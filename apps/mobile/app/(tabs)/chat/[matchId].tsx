import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { matchService } from "../../../services/matchService";
import { useSocket } from "../../../hooks/useSocket";
import { useAuthStore } from "../../../stores/authStore";
import { ChatBubble } from "../../../components/ChatBubble";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { Message, LandlordProfile, SeekerProfile } from "../../../types";
import { colors, radius, spacing, typography } from "../../../utils/theme";

export default function ChatScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sending, setSending] = useState(false);

  // Fetch match info
  const { data: match, isLoading: matchLoading } = useQuery({
    queryKey: ["match", matchId],
    queryFn: () => matchService.getMatch(matchId!),
    enabled: !!matchId,
  });

  // Fetch messages
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", matchId],
    queryFn: () => matchService.getMessages(matchId!),
    enabled: !!matchId,
  });

  // Sync server messages into local state
  useEffect(() => {
    if (messagesData) {
      setLocalMessages(messagesData.messages);
      if (matchId) matchService.markRead(matchId).catch(() => {});
    }
  }, [messagesData, matchId]);

  const profile = match?.otherProfile as LandlordProfile | SeekerProfile | undefined;
  const name =
    profile && "firstName" in profile
      ? `${profile.firstName} ${profile.lastName}`
      : profile && "title" in profile
      ? profile.title
      : "Chat";

  // Socket
  const { sendMessage, startTyping, stopTyping, joinMatch, leaveMatch } =
    useSocket({
      onMessage: useCallback(
        (msg: Message) => {
          if (msg.matchId === matchId) {
            setLocalMessages((prev) => {
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
          }
          // Invalidate matches list for unread count
          queryClient.invalidateQueries({ queryKey: ["matches"] });
        },
        [matchId, queryClient]
      ),
      onTyping: useCallback(
        ({ matchId: mid, userId, isTyping: typing }) => {
          if (mid === matchId && userId !== user?.id) {
            setIsTyping(typing);
          }
        },
        [matchId, user?.id]
      ),
    });

  useEffect(() => {
    if (matchId) {
      joinMatch(matchId);
      return () => leaveMatch(matchId);
    }
  }, [matchId, joinMatch, leaveMatch]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (localMessages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 50);
    }
  }, [localMessages.length]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !matchId || sending) return;

    setInputText("");
    setSending(true);
    stopTyping(matchId);

    // Optimistic update
    const optimisticMsg: Message = {
      id: `opt-${Date.now()}`,
      matchId,
      senderId: user?.id || "",
      content: text,
      read: false,
      createdAt: new Date().toISOString(),
    };
    setLocalMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      // Send via socket (real-time) and also via REST for persistence
      sendMessage(matchId, text);
      const saved = await matchService.sendMessage(matchId, text);

      // Replace optimistic with real
      setLocalMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? saved : m))
      );
    } catch {
      // Remove optimistic on error
      setLocalMessages((prev) =>
        prev.filter((m) => m.id !== optimisticMsg.id)
      );
    } finally {
      setSending(false);
    }
  };

  const handleChangeText = (text: string) => {
    setInputText(text);

    if (matchId) {
      startTyping(matchId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(matchId), 2000);
    }
  };

  const sortedMessages = useMemo(
    () =>
      [...localMessages].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    [localMessages]
  );

  if (matchLoading || messagesLoading) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerName} numberOfLines={1}>
            {name}
          </Text>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={sortedMessages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          renderItem={({ item }) => (
            <ChatBubble
              message={item}
              isOwn={item.senderId === user?.id}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>
                Inizia la conversazione!
              </Text>
            </View>
          }
        />

        {/* Typing indicator */}
        {isTyping ? (
          <View style={styles.typingIndicator}>
            <Text style={styles.typingText}>sta scrivendo...</Text>
          </View>
        ) : null}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleChangeText}
            placeholder="Scrivi un messaggio..."
            placeholderTextColor={colors.textMuted}
            multiline
            maxLength={1000}
            returnKeyType="default"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || sending}
            activeOpacity={0.7}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.sendButtonText}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backText: { ...typography.h3, color: colors.textPrimary },
  headerName: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
  },
  messageList: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    flexGrow: 1,
  },
  emptyChat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: spacing.xxl,
  },
  emptyChatText: { ...typography.body, color: colors.textMuted },
  typingIndicator: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  typingText: { ...typography.caption, color: colors.textMuted, fontStyle: "italic" },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.textPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: colors.textMuted,
  },
  sendButtonText: {
    fontSize: 20,
    color: colors.background,
    fontWeight: "500",
  },
});
