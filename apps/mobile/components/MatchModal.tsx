import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { colors, radius, spacing, typography } from "../utils/theme";
import { Button } from "./Button";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PHOTO_SIZE = 120;

interface MatchModalProps {
  visible: boolean;
  matchId: string;
  otherUserPhoto: string;
  myPhoto: string;
  onClose: () => void;
  onChat: () => void;
}

export function MatchModal({
  visible,
  otherUserPhoto,
  myPhoto,
  onClose,
  onChat,
}: MatchModalProps) {
  const myPhotoX = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const otherPhotoX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      myPhotoX.setValue(-SCREEN_WIDTH);
      otherPhotoX.setValue(SCREEN_WIDTH);
      contentOpacity.setValue(0);
      contentScale.setValue(0.8);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(myPhotoX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 60,
            friction: 10,
          }),
          Animated.spring(otherPhotoX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 60,
            friction: 10,
          }),
        ]),
        Animated.parallel([
          Animated.timing(contentOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(contentScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 80,
            friction: 8,
          }),
        ]),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Photos */}
          <View style={styles.photosRow}>
            <Animated.View
              style={[
                styles.photoWrapper,
                { transform: [{ translateX: myPhotoX }] },
              ]}
            >
              <Image
                source={{ uri: myPhoto || "https://placekitten.com/200/200" }}
                style={styles.photo}
                contentFit="cover"
              />
            </Animated.View>

            <View style={styles.photoOverlap} />

            <Animated.View
              style={[
                styles.photoWrapper,
                { transform: [{ translateX: otherPhotoX }] },
              ]}
            >
              <Image
                source={{
                  uri: otherUserPhoto || "https://placekitten.com/201/200",
                }}
                style={styles.photo}
                contentFit="cover"
              />
            </Animated.View>
          </View>

          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: contentOpacity,
                transform: [{ scale: contentScale }],
              },
            ]}
          >
            <Text style={styles.matchTitle}>IT'S A MATCH!</Text>
            <Text style={styles.matchSubtitle}>
              Avete scelto di conoscervi
            </Text>

            <Button
              label="Scrivi subito"
              onPress={onChat}
              variant="primary"
              style={styles.chatButton}
            />

            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.continueLink}>Continua a esplorare</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: SCREEN_WIDTH - spacing.xl * 2,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden",
  },
  photosRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xl,
    height: PHOTO_SIZE + 8,
  },
  photoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: radius.full,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: colors.background,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoOverlap: {
    width: spacing.md,
  },
  content: {
    width: "100%",
    alignItems: "center",
    gap: spacing.sm,
  },
  matchTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  matchSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  chatButton: {
    marginTop: spacing.md,
  },
  continueLink: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
    textDecorationLine: "underline",
  },
});
