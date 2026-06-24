import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, LayoutAnimation, UIManager, Platform, Animated } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
import { Moon, Plus, Bed, Alarm, Star, Sun, TrendUp, Trash } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { ScreenWrapper } from "../../src/components/ui/ScreenWrapper";
import { HeaderAvatar } from "../../src/components/shared/HeaderAvatar";
import { Card } from "../../src/components/ui/Card";
import { WeeklyBarChart } from "../../src/components/charts/WeeklyBarChart";
import { textStyles } from "../../src/theme/styles";
import { colors, spacing, fontSizes, typography, radii } from "../../src/theme/tokens";
import { useSleepStore } from "../../src/stores/sleepStore";
import { useTodayDate } from "../../src/hooks/useTodayDate";
import Svg, { Circle as SvgCircle } from "react-native-svg";

/**
 * Circular sleep score ring for today's sleep.
 */
function SleepScoreRing({ hours, goalHours = 8, size = 100 }: { hours: number; goalHours?: number; size?: number }) {
  const progress = Math.min(hours / goalHours, 1);
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  const getColor = () => {
    if (hours >= 7) return colors.accentOlive;
    if (hours >= 5) return colors.accentMustard;
    return colors.accentTerracotta;
  };

  const getLabel = () => {
    if (hours >= 7) return "Great";
    if (hours >= 5) return "Fair";
    if (hours > 0) return "Low";
    return "—";
  };

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: size, height: size }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.line}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {hours > 0 && (
          <SvgCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        )}
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        <Text style={{
          fontFamily: typography.display.semiBold,
          fontSize: fontSizes.h3,
          color: colors.ink,
        }}>
          {getLabel()}
        </Text>
        <Text style={{
          fontFamily: typography.caption.fontFamily,
          fontSize: 9,
          color: colors.inkSoft,
          letterSpacing: 0.5,
          marginTop: 1,
        }}>
          {Math.round(progress * 100)}%
        </Text>
      </View>
    </View>
  );
}

function AnimatedLogCard({ log, onDelete, duration, qualityColor }: any) {
  const [exactHeight, setExactHeight] = React.useState<number | null>(null);
  const heightAnim = useRef(new Animated.Value(100)).current; // Dummy initial value
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const marginAnim = useRef(new Animated.Value(spacing.sm)).current; // Matches gap

  const handleDelete = () => {
    // Make sure we start from the exact measured height
    if (exactHeight !== null) {
      heightAnim.setValue(exactHeight);
    }
    
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(heightAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }),
      Animated.timing(marginAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      })
    ]).start(() => {
      onDelete(log.id);
    });
  };

  return (
    <Animated.View 
      style={[
        styles.logCard, 
        { 
          opacity: opacityAnim, 
          marginBottom: marginAnim,
          // Only apply animated height after we've measured it, or during deletion
          height: exactHeight !== null ? heightAnim : undefined 
        }
      ]}
      onLayout={(e) => {
        if (exactHeight === null) {
          const { height } = e.nativeEvent.layout;
          setExactHeight(height);
          heightAnim.setValue(height);
        }
      }}
    >
      <View style={[styles.logAccent, { backgroundColor: qualityColor }]} />
      <View style={styles.logCardContent}>
        <View style={styles.logCardLeft}>
          <Moon color={qualityColor} weight="fill" size={22} />
          <View>
            <Text style={textStyles.bodyMedium}>
              {duration.hours}h {duration.mins}m
            </Text>
            <Text style={[textStyles.caption, { color: colors.inkSoft }]}>
              {log.sleepStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              {" → "}
              {log.sleepEnd.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Text>
          </View>
        </View>
        <View style={styles.logCardRight}>
          <View style={[styles.qualityPill, { backgroundColor: `${qualityColor}18` }]}>
            <Text style={[styles.qualityPillText, { color: qualityColor }]}>
              {duration.totalHours >= 7 ? "Good" : duration.totalHours >= 5 ? "Fair" : "Low"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.deleteBtn}
          >
            <Trash color={colors.accentTerracotta} size={16} weight="bold" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function SleepScreen() {
  const router = useRouter();
  const { logs, weeklyLogs, fetchLogs, fetchWeeklyLogs, deleteLog } = useSleepStore();
  const todayStr = useTodayDate(); // auto-updates at midnight

  useEffect(() => {
    fetchLogs(todayStr);
    // Fetch weekly data for chart
    const dates = getLast7DaysStrings(todayStr);
    fetchWeeklyLogs(dates[0], dates[6]);
  }, [fetchLogs, fetchWeeklyLogs, todayStr]);

  const getDuration = (start: Date, end: Date) => {
    let diff = (end.getTime() - start.getTime()) / 60000;
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = Math.floor(diff % 60);
    return { hours, mins, totalHours: diff / 60 };
  };

  // Chart data — build from actual weekly logs
  const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];
  const sparklineDates = useMemo(() => getLast7DaysStrings(todayStr), [todayStr]);

  const chartData = useMemo(() => {
    return sparklineDates.map((dateStr, i) => {
      const logsForDate = weeklyLogs.filter(log => log.date === dateStr);
      const totalHours = logsForDate.reduce((sum, log) => sum + log.durationHours, 0);
      return {
        label: dayLabels[i],
        value: totalHours,
        displayValue: totalHours > 0 ? `${Math.floor(totalHours)}h` : "",
      };
    });
  }, [sparklineDates, weeklyLogs]);

  // Compute weekly average
  const weeklyAvg = useMemo(() => {
    const daysWithData = chartData.filter(d => d.value > 0);
    if (daysWithData.length === 0) return 0;
    return daysWithData.reduce((sum, d) => sum + d.value, 0) / daysWithData.length;
  }, [chartData]);

  // Today's sleep data — sum ALL logs for the day
  const todayTotalHours = useMemo(() => {
    return logs.reduce((sum, log) => sum + log.durationHours, 0);
  }, [logs]);

  const todayTotalDuration = useMemo(() => {
    const totalMinutes = Math.round(todayTotalHours * 60);
    return { hours: Math.floor(totalMinutes / 60), mins: totalMinutes % 60 };
  }, [todayTotalHours]);

  // Earliest bedtime and latest wake-up across all logs
  const earliestSleepStart = useMemo(() => {
    if (logs.length === 0) return null;
    return logs.reduce((earliest, log) =>
      log.sleepStart < earliest ? log.sleepStart : earliest, logs[0].sleepStart);
  }, [logs]);

  const latestSleepEnd = useMemo(() => {
    if (logs.length === 0) return null;
    return logs.reduce((latest, log) =>
      log.sleepEnd > latest ? log.sleepEnd : latest, logs[0].sleepEnd);
  }, [logs]);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.header}>
        <View>
          <Text style={textStyles.captionSmall}>SLEEP</Text>
          <Text style={[textStyles.h2, { marginTop: spacing.xs }]}>Rest and recharge.</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <HeaderAvatar />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero: Today's Total Sleep */}
        <View style={styles.heroCard}>
          {/* Decorative night icon watermark */}
          <View style={styles.heroWatermark}>
            <Moon color={colors.accentMustard} size={52} weight="fill" />
          </View>
          <View style={styles.heroLeft}>
            <SleepScoreRing hours={todayTotalHours} />
          </View>
          <View style={styles.heroRight}>
            <Text style={styles.heroLabel}>TODAY'S SLEEP</Text>
            {logs.length > 0 ? (
              <>
                <Text style={styles.heroValue}>
                  {todayTotalDuration.hours}h {todayTotalDuration.mins}m
                </Text>
                <View style={styles.heroTimesRow}>
                  <View style={styles.heroTimeItem}>
                    <Bed color={colors.accentSlate} size={14} weight="fill" />
                    <Text style={styles.heroTimeText}>
                      {earliestSleepStart!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                  <Text style={[styles.heroTimeText, { color: colors.line, marginHorizontal: 4 }]}>→</Text>
                  <View style={styles.heroTimeItem}>
                    <Alarm color={colors.accentMustard} size={14} weight="fill" />
                    <Text style={styles.heroTimeText}>
                      {latestSleepEnd!.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </View>
                </View>
                {logs.length > 1 && (
                  <Text style={[styles.heroTimeText, { marginTop: 4 }]}>
                    {logs.length} sessions combined
                  </Text>
                )}
              </>
            ) : (
              <Text style={[textStyles.body, { color: colors.inkSoft, marginTop: spacing.xs }]}>
                No sleep logged yet.
              </Text>
            )}
          </View>
        </View>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Moon color={colors.accentMustard} size={18} weight="fill" />
            <Text style={styles.statLabel}>GOAL</Text>
            <Text style={styles.statValue}>8<Text style={styles.statUnit}>h</Text></Text>
          </View>
          <View style={styles.statCard}>
            <TrendUp color={colors.accentOlive} size={18} weight="bold" />
            <Text style={styles.statLabel}>AVG / DAY</Text>
            <Text style={styles.statValue}>
              {weeklyAvg > 0 ? weeklyAvg.toFixed(1) : "—"}
              {weeklyAvg > 0 && <Text style={styles.statUnit}>h</Text>}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Sun color={colors.accentSlate} size={18} weight="fill" />
            <Text style={styles.statLabel}>WEEKLY</Text>
            <Text style={styles.statValue}>
              {chartData.reduce((sum, d) => sum + d.value, 0) > 0 
                ? Math.round(chartData.reduce((sum, d) => sum + d.value, 0))
                : "—"}
              {chartData.reduce((sum, d) => sum + d.value, 0) > 0 && <Text style={styles.statUnit}>h</Text>}
            </Text>
          </View>
        </View>

        {/* Weekly Chart */}
        <Text style={[textStyles.h3, styles.sectionTitle]}>This Week</Text>
        <View style={styles.chartCard}>
          <WeeklyBarChart
            data={chartData}
            maxValue={12}
            accentColor={colors.accentMustard}
          />
        </View>

        {/* Sleep History */}
        <Text style={[textStyles.h3, styles.sectionTitle, { marginTop: spacing.xl }]}>Today's Logs</Text>
        <View style={styles.logList}>
          {logs.map((log) => {
            const duration = getDuration(log.sleepStart, log.sleepEnd);
            const qualityColor = duration.totalHours >= 7 ? colors.accentOlive
              : duration.totalHours >= 5 ? colors.accentMustard
              : colors.accentTerracotta;

            return (
              <AnimatedLogCard 
                key={log.id} 
                log={log} 
                onDelete={deleteLog} 
                duration={duration} 
                qualityColor={qualityColor} 
              />
            );
          })}
          {logs.length === 0 && (
            <View style={styles.emptyState}>
              <Moon color={colors.line} size={40} weight="thin" />
              <Text style={[textStyles.body, { color: colors.inkSoft, textAlign: "center", marginTop: spacing.md }]}>
                No sleep logged for today.{"\n"}
                <Text style={{ fontStyle: "italic", fontSize: fontSizes.bodySmall }}>
                  Tap + to log your sleep.
                </Text>
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => router.push("/(modals)/sleep-log")}
        activeOpacity={0.8}
      >
        <Plus color={colors.bgPaper} weight="bold" size={24} />
      </TouchableOpacity>
    </ScreenWrapper>
  );
}

function getLast7DaysStrings(todayStr: string): string[] {
  const dates = [];
  const [y, m, d] = todayStr.split("-").map(Number);
  const todayDate = new Date(y, m - 1, d);
  for (let i = 6; i >= 0; i--) {
    const pastDate = new Date(todayDate);
    pastDate.setDate(todayDate.getDate() - i);
    const year = pastDate.getFullYear();
    const month = String(pastDate.getMonth() + 1).padStart(2, "0");
    const day = String(pastDate.getDate()).padStart(2, "0");
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    marginHorizontal: -spacing.lg,
    backgroundColor: colors.bgPaper,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  floatingButton: {
    position: "absolute",
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: colors.accentMustard,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  /* Hero Card */
  heroCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.lg,
    overflow: "hidden",
  },
  heroWatermark: {
    position: "absolute",
    top: 10,
    right: 10,
    opacity: 0.12,
  },
  heroLeft: {
    alignItems: "center",
  },
  heroRight: {
    flex: 1,
  },
  heroLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    color: colors.inkSoft,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  heroValue: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h1,
    color: colors.ink,
  },
  heroTimesRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  heroTimeItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  heroTimeText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.caption,
    color: colors.inkSoft,
  },

  /* Stats Row */
  statsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    padding: spacing.md,
    alignItems: "flex-start",
    gap: 4,
  },
  statLabel: {
    fontFamily: typography.caption.fontFamily,
    fontSize: 9,
    color: colors.inkSoft,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  statValue: {
    fontFamily: typography.display.semiBold,
    fontSize: fontSizes.h3,
    color: colors.ink,
  },
  statUnit: {
    fontFamily: typography.body.medium,
    fontSize: fontSizes.bodySmall,
    color: colors.inkSoft,
  },

  /* Chart */
  sectionTitle: {
    marginBottom: spacing.md,
  },
  chartCard: {
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    padding: spacing.md,
  },

  /* Log Cards */
  logList: {
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  logCard: {
    flexDirection: "row",
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.lg,
    overflow: "hidden",
  },
  logAccent: {
    width: 4,
  },
  logCardContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    gap: spacing.md,
  },
  logCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  logCardRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  deleteBtn: {
    marginLeft: spacing.xs,
  },
  qualityPill: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    borderRadius: radii.pill,
  },
  qualityPillText: {
    fontFamily: typography.caption.fontFamily,
    fontSize: fontSizes.captionSmall,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  /* Empty State */
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
});
