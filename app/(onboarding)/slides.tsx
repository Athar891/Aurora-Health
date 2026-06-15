import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { Button } from "../../src/components/ui/Button";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, radii } from "../../src/theme/tokens";
import {
  CompanionAnimation,
  TrackAnimation,
  InsightsAnimation,
  RoutinesAnimation,
  JourneyAnimation,
} from "../../src/components/onboarding/OnboardingAnimations";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Meet your personal health companion.",
    subtitle: "Aurora is here to help you understand your patterns and build healthier routines.",
    Animation: CompanionAnimation,
  },
  {
    id: "2",
    title: "Track what matters.",
    subtitle: "Log your hydration, sleep, habits, and nutrition easily and beautifully.",
    Animation: TrackAnimation,
  },
  {
    id: "3",
    title: "Receive personalized insights.",
    subtitle: "Turn your data into actionable, gentle guidance for your well-being.",
    Animation: InsightsAnimation,
  },
  {
    id: "4",
    title: "Build healthier routines.",
    subtitle: "Consistency is key. Aurora helps you maintain streaks and build lasting habits.",
    Animation: RoutinesAnimation,
  },
  {
    id: "5",
    title: "Learn more about yourself every day.",
    subtitle: "Your journey starts here.",
    Animation: JourneyAnimation,
  },
];

export default function OnboardingSlidesScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / width);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    } else {
      router.push("/(onboarding)/auth/signup");
    }
  };

  const handleSkip = () => {
    router.push("/(onboarding)/auth/signup");
  };

  const renderItem = ({ item }: { item: typeof SLIDES[0] }) => {
    const { Animation } = item;
    return (
      <View style={[styles.slide, { width }]}>
        <View style={styles.illustrationContainer}>
          <Animation />
        </View>
        <View style={styles.textContainer}>
          <Text style={[textStyles.h2, styles.title]}>{item.title}</Text>
          <Text style={[textStyles.body, styles.subtitle]}>{item.subtitle}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper scrollable={false} padded={false} style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Skip"
          variant="ghost"
          size="small"
          onPress={handleSkip}
          textStyle={styles.skipText}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                currentIndex === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
        <Button
          title={currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    zIndex: 1,
  },
  skipText: {
    fontFamily: textStyles.caption.fontFamily,
    fontSize: textStyles.caption.fontSize,
    textTransform: "uppercase",
  },
  slide: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  illustrationContainer: {
    flex: 0.6,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 0.4,
    width: "100%",
    alignItems: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: spacing.md,
  },
  subtitle: {
    textAlign: "center",
    color: colors.inkSoft,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.line,
  },
  activeDot: {
    width: 8,
    height: 8,
    backgroundColor: colors.accentTerracotta,
  },
});
