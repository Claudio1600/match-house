import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Message } from "../types";
import { colors, radius, spacing, typography } from "../utils/theme";

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "adesso";
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours}h fa`;
  if (diffDays === 1) return "ieri";
  return date.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const time = useMemo(
    () => formatRelativeTime(message.createdAt),
    [message.createdAt]
  );

  return (
    <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
      <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
        <Text style={[styles.content, isOwn ? styles.contentOwn : styles.contentOther]}>
          {message.content}
        </Text>
      </View>
      <View style={[styles.meta, isOwn ? styles.metaOwn : styles.metaOther]}>
        <Text style={styles.time}>{time}</Text>
        {isOwn ? (
          <Text style={styles.readReceipt}>
            {message.read ? "  " : " "}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.xs,
    maxWidth: "75%",
  },
  wrapperOwn: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  wrapperOther: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  bubbleOwn: {
    backgroundColor: colors.textPrimary,
    borderBottomRightRadius: radius.sm,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.sm,
  },
  content: {
    ...typography.body,
  },
  contentOwn: {
    color: colors.background,
  },
  contentOther: {
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    gap: spacing.xs,
  },
  metaOwn: {
    paddingRight: spacing.xs,
  },
  metaOther: {
    paddingLeft: spacing.xs,
  },
  time: {
    ...typography.caption,
    color: colors.textMuted,
  },
  readReceipt: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
