import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii } from "../../theme/tokens";
import { textStyles } from "../../theme/styles";

interface MiniBarChartProps {
  data: number[]; // Array of values for the bars (usually 7 days)
  labels?: string[]; // Optional day labels (e.g. M, T, W)
  maxValue?: number; // Optional max value to scale against
  accentColor?: string; // Color of the bars
  height?: number; // Height of the chart
}

/**
 * A tiny sparkline-style bar chart intended for summary cards.
 * Can optionally show single-letter day labels below each bar.
 */
export function MiniBarChart({
  data,
  labels,
  maxValue,
  accentColor = colors.accentSlate,
  height = 40, // Increased default height to fit labels
}: MiniBarChartProps) {
  // Ensure we only show up to 7 bars (a week)
  const chartData = data.slice(0, 7);
  
  // Calculate max value for scaling
  const maxDataValue = Math.max(...chartData, 0);
  const scaleMax = maxValue && maxValue > maxDataValue ? maxValue : (maxDataValue || 1);

  return (
    <View style={[styles.container, { height }]}>
      {chartData.map((value, index) => {
        // Calculate bar height percentage, ensuring a tiny minimum height if value is 0
        const barHeightPercent = Math.max(Math.min((value / scaleMax) * 100, 100), 5);
        
        return (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barTrackWrapper}>
              <View style={styles.barTrack}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      height: `${barHeightPercent}%`,
                      backgroundColor: value > 0 ? accentColor : colors.line // faint color for 0 values
                    }
                  ]} 
                />
              </View>
            </View>
            {labels && labels[index] && (
              <Text style={[textStyles.captionSmall, styles.label]}>{labels[index]}</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    width: "100%",
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    paddingHorizontal: 1, // small gap between bars
  },
  barTrackWrapper: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barTrack: {
    width: 6, // Slightly wider to match labels
    height: "100%",
    justifyContent: "flex-end",
  },
  barFill: {
    width: "100%",
    borderRadius: radii.sm,
  },
  label: {
    fontSize: 9,
    color: colors.inkSoft,
    marginTop: 4,
  },
});
