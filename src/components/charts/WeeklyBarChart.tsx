import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, spacing, radii } from "../../theme/tokens";
import { textStyles } from "../../theme/styles";

interface ChartDataPoint {
  label: string; // e.g., 'M', 'T', 'W'
  value: number; // The actual value
  displayValue?: string; // Optional custom string to display above the bar
}

interface WeeklyBarChartProps {
  data: ChartDataPoint[];
  maxValue?: number; // Optional max value to scale against. If not provided, it finds the max in data.
  goalValue?: number; // Optional goal line
  accentColor?: string; // Color of the bars
  height?: number; // Height of the chart container
}

export function WeeklyBarChart({
  data,
  maxValue,
  goalValue,
  accentColor = colors.accentSlate,
  height = 150,
}: WeeklyBarChartProps) {
  // Ensure we have 7 days of data
  const chartData = data.slice(0, 7);
  
  // Calculate max value for scaling
  const maxDataValue = Math.max(...chartData.map((d) => d.value), 0);
  const scaleMax = maxValue && maxValue > maxDataValue ? maxValue : (maxDataValue || 1);
  
  // Calculate goal line percentage
  const goalPercentage = goalValue ? Math.min((goalValue / scaleMax) * 100, 100) : null;

  return (
    <View style={[styles.container, { height }]}>
      {/* Optional Goal Line */}
      {goalPercentage !== null && (
        <View 
          style={[
            styles.goalLine, 
            { bottom: `${goalPercentage}%` }
          ]} 
        />
      )}
      
      <View style={styles.chartArea}>
        {chartData.map((item, index) => {
          // Calculate bar height percentage
          const barHeightPercent = Math.max(Math.min((item.value / scaleMax) * 100, 100), 2); // 2% minimum height for visibility
          
          return (
            <View key={index} style={styles.barColumn}>
              <View style={styles.valueContainer}>
                {item.value > 0 ? (
                  <Text style={[textStyles.captionSmall, styles.valueText]} numberOfLines={1}>
                    {item.displayValue || item.value.toString()}
                  </Text>
                ) : null}
              </View>
              
              <View style={styles.barTrack}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      height: `${barHeightPercent}%`,
                      backgroundColor: accentColor
                    }
                  ]} 
                />
              </View>
              
              <Text style={[textStyles.captionSmall, styles.label]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: spacing.sm,
    position: "relative",
  },
  chartArea: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingTop: 20, // Space for values on top
    paddingBottom: 20, // Space for labels on bottom
  },
  barColumn: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
  },
  valueContainer: {
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  valueText: {
    color: colors.inkSoft,
    fontSize: 9,
  },
  barTrack: {
    flex: 1,
    width: 24,
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.sm,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: radii.sm,
  },
  label: {
    marginTop: spacing.sm,
    color: colors.inkSoft,
    height: 16,
  },
  goalLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.accentOlive,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: colors.accentOlive,
    opacity: 0.5,
    zIndex: -1,
  },
});
