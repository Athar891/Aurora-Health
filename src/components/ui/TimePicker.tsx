import React, { useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TouchableOpacity,
} from "react-native";
import { colors, spacing, radii, typography, fontSizes } from "../../theme/tokens";
import { textStyles } from "../../theme/styles";

interface TimePickerProps {
  value: { hours: number; minutes: number };
  onChange: (value: { hours: number; minutes: number }) => void;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0, 5, 10, ..., 55
const PERIODS = ["AM", "PM"];

/**
 * WheelColumn — A scroll-snap wheel for picking a single value.
 *
 * Bug-fix: The previous implementation used a stale useRef for
 * handleViewableItemsChanged, capturing onSelect at mount time.
 * This version uses onMomentumScrollEnd to calculate the selected
 * index from the scroll offset — much more reliable on all platforms.
 */
function WheelColumn({
  data,
  selectedIndex,
  onSelect,
  formatItem,
}: {
  data: (number | string)[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem?: (item: number | string) => string;
}) {
  const flatListRef = useRef<FlatList>(null);
  const onSelectRef = useRef(onSelect);
  const isUserScrolling = useRef(false);
  const lastReportedIndex = useRef(selectedIndex);

  // Keep callback ref fresh so scroll handler always calls latest onSelect
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Scroll to initial position on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (flatListRef.current && selectedIndex >= 0 && selectedIndex < data.length) {
        flatListRef.current.scrollToOffset({
          offset: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
      }
    }, 80);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync scroll position when selectedIndex changes externally (e.g. AM/PM toggle)
  useEffect(() => {
    if (!isUserScrolling.current && selectedIndex !== lastReportedIndex.current) {
      lastReportedIndex.current = selectedIndex;
      const timer = setTimeout(() => {
        if (flatListRef.current && selectedIndex >= 0 && selectedIndex < data.length) {
          flatListRef.current.scrollToOffset({
            offset: selectedIndex * ITEM_HEIGHT,
            animated: true,
          });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex, data.length]);

  const handleScrollBegin = useCallback(() => {
    isUserScrolling.current = true;
  }, []);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));

      isUserScrolling.current = false;
      lastReportedIndex.current = clampedIndex;

      // Snap to exact position
      flatListRef.current?.scrollToOffset({
        offset: clampedIndex * ITEM_HEIGHT,
        animated: true,
      });

      if (clampedIndex !== selectedIndex) {
        onSelectRef.current(clampedIndex);
      }
    },
    [data.length, selectedIndex]
  );

  // Also handle regular scroll end (drag without momentum)
  const handleDragEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetY = e.nativeEvent.contentOffset.y;
      const index = Math.round(offsetY / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));

      isUserScrolling.current = false;
      lastReportedIndex.current = clampedIndex;

      flatListRef.current?.scrollToOffset({
        offset: clampedIndex * ITEM_HEIGHT,
        animated: true,
      });

      if (clampedIndex !== selectedIndex) {
        onSelectRef.current(clampedIndex);
      }
    },
    [data.length, selectedIndex]
  );

  const renderItem = ({ item, index }: { item: number | string; index: number }) => {
    const isSelected = index === selectedIndex;
    const distance = Math.abs(index - selectedIndex);
    const label = formatItem ? formatItem(item) : String(item);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => {
          // Direct tap to select
          flatListRef.current?.scrollToOffset({
            offset: index * ITEM_HEIGHT,
            animated: true,
          });
          lastReportedIndex.current = index;
          onSelectRef.current(index);
        }}
        style={[styles.wheelItem, { height: ITEM_HEIGHT }]}
      >
        <Text
          style={[
            textStyles.bodySemiBold,
            {
              fontSize: isSelected ? 22 : distance === 1 ? 17 : 14,
              color: isSelected ? colors.ink : colors.inkSoft,
              opacity: isSelected ? 1 : distance === 1 ? 0.5 : 0.25,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wheelContainer}>
      <FlatList
        ref={flatListRef}
        data={data}
        keyExtractor={(_, i) => i.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleDragEnd}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
        extraData={selectedIndex}
      />
    </View>
  );
}

export function TimePicker({ value, onChange }: TimePickerProps) {
  const is12h = value.hours >= 12;
  const displayHour = value.hours % 12 || 12;

  const hourIndex = HOURS.indexOf(displayHour);
  const minuteIndex = MINUTES.indexOf(
    Math.round(value.minutes / 5) * 5
  );
  const periodIndex = is12h ? 1 : 0;

  // Use refs to always get latest values in callbacks without re-renders
  const valueRef = useRef(value);
  const periodRef = useRef(periodIndex);
  useEffect(() => {
    valueRef.current = value;
    periodRef.current = periodIndex;
  }, [value, periodIndex]);

  const handleHourChange = useCallback((index: number) => {
    const h = HOURS[index];
    const isPM = periodRef.current === 1;
    let newHour = h;
    if (isPM && h !== 12) newHour = h + 12;
    if (!isPM && h === 12) newHour = 0;
    onChange({ hours: newHour, minutes: valueRef.current.minutes });
  }, [onChange]);

  const handleMinuteChange = useCallback((index: number) => {
    onChange({ hours: valueRef.current.hours, minutes: MINUTES[index] });
  }, [onChange]);

  const handlePeriodChange = useCallback((index: number) => {
    const isPM = index === 1;
    let newHour = valueRef.current.hours;
    if (isPM && newHour < 12) newHour += 12;
    if (!isPM && newHour >= 12) newHour -= 12;
    onChange({ hours: newHour, minutes: valueRef.current.minutes });
  }, [onChange]);

  return (
    <View style={styles.container}>
      {/* Selection highlight bar */}
      <View style={styles.selectionBar} pointerEvents="none" />

      <WheelColumn
        data={HOURS}
        selectedIndex={hourIndex >= 0 ? hourIndex : 0}
        onSelect={handleHourChange}
        formatItem={(item) => String(item)}
      />

      <Text style={[textStyles.h2, styles.separator]}>:</Text>

      <WheelColumn
        data={MINUTES}
        selectedIndex={minuteIndex >= 0 ? minuteIndex : 0}
        onSelect={handleMinuteChange}
        formatItem={(item) => String(item).padStart(2, "0")}
      />

      <WheelColumn
        data={PERIODS}
        selectedIndex={periodIndex}
        onSelect={handlePeriodChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    overflow: "hidden",
    backgroundColor: colors.bgPaperAlt,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  selectionBar: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    height: ITEM_HEIGHT,
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    backgroundColor: colors.accentOliveLight,
    borderRadius: radii.sm,
  },
  wheelContainer: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
  },
  wheelItem: {
    justifyContent: "center",
    alignItems: "center",
  },
  separator: {
    color: colors.ink,
    marginHorizontal: 2,
  },
});
