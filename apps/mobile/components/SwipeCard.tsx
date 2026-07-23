import React, { useCallback } from "react";
import { StyleSheet, Text, View, Dimensions } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LandlordProfile, SeekerProfile } from "../types";
import { colors, radius, spacing, typography } from "../utils/theme";
import { ProfileCard } from "./ProfileCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;
const CARD_ROTATION_DEG = 15;

interface SwipeCardProps {
  profile: LandlordProfile | SeekerProfile;
  onSwipe: (userId: string, action: "SMASH" | "PASS") => void;
  isTop: boolean;
  index: number; // 0 = top, 1 = second, 2 = third
}

export function SwipeCard({ profile, onSwipe, isTop, index }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const handleSwipeComplete = useCallback(
    (action: "SMASH" | "PASS") => {
      onSwipe(profile.userId, action);
    },
    [onSwipe, profile.userId]
  );

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY * 0.3;
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const shouldSwipeRight =
        translateX.value > SWIPE_THRESHOLD || velocity > 800;
      const shouldSwipeLeft =
        translateX.value < -SWIPE_THRESHOLD || velocity < -800;

      if (shouldSwipeRight) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 280 });
        runOnJS(handleSwipeComplete)("SMASH");
      } else if (shouldSwipeLeft) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 280 });
        runOnJS(handleSwipeComplete)("PASS");
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-CARD_ROTATION_DEG, 0, CARD_ROTATION_DEG],
      Extrapolation.CLAMP
    );

    const scale = isTop
      ? 1
      : interpolate(
          index,
          [1, 2, 3],
          [0.95, 0.9, 0.85],
          Extrapolation.CLAMP
        );

    const yOffset = isTop ? 0 : index * -spacing.sm;

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value + yOffset },
        { rotate: `${rotate}deg` },
        { scale },
      ],
    };
  });

  // SMASH overlay: opacity increases with rightward drag
  const smashOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // PASS overlay: opacity increases with leftward drag
  const passOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardWrapper, cardStyle]}>
        <ProfileCard profile={profile} />

        {/* SMASH overlay */}
        <Animated.View
          style={[styles.overlay, styles.smashOverlay, smashOverlayStyle]}
          pointerEvents="none"
        >
          <View style={styles.overlayLabel}>
            <Text style={styles.smashText}>SMASH</Text>
          </View>
        </Animated.View>

        {/* PASS overlay */}
        <Animated.View
          style={[styles.overlay, styles.passOverlay, passOverlayStyle]}
          pointerEvents="none"
        >
          <View style={[styles.overlayLabel, styles.passLabel]}>
            <Text style={styles.passText}>PASS</Text>
          </View>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    position: "absolute",
    width: SCREEN_WIDTH - spacing.lg * 2,
    top: 0,
    left: spacing.lg,
    bottom: 0,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.lg,
  },
  smashOverlay: {
    backgroundColor: `${colors.smash}22`,
  },
  passOverlay: {
    backgroundColor: `${colors.pass}22`,
  },
  overlayLabel: {
    position: "absolute",
    top: spacing.xl,
    left: spacing.lg,
    borderWidth: 2,
    borderColor: colors.smash,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    transform: [{ rotate: "-15deg" }],
  },
  passLabel: {
    left: undefined,
    right: spacing.lg,
    borderColor: colors.pass,
    transform: [{ rotate: "15deg" }],
  },
  smashText: {
    ...typography.h3,
    color: colors.smash,
    letterSpacing: 2,
  },
  passText: {
    ...typography.h3,
    color: colors.pass,
    letterSpacing: 2,
  },
});
