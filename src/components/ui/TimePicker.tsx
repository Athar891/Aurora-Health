import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ViewToken,
} from "react-native";
import { colors, spacing, radii } from "../../theme/tokens";
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

function WheelColumn({
  data,
  selectedIndex,
  onSelect,
  formatItem,
}: {
  data: number[] | string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  formatItem?: (item: number | string) => string;
}) {
  const flatListRef = useRef<FlatList>(null);
  const isScrolling = useRef(false);

  useEffect(() => {
    // Scroll to initial position
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: false,
        viewPosition: 0.5,
      });
    }, 100);
  }, []);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && isScrolling.current) {
        // Find the center item
        const centerItem = viewableItems[Math.floor(viewableItems.length / 2)];
        if (centerItem?.index != null) {
          onSelect(centerItem.index);
        }
      }
    }
  ).current;

  const handleScrollBegin = () => {
    isScrolling.current = true;
  };

  const handleMomentumEnd = () => {
    isScrolling.current = false;
  };

  const renderItem = ({ item, index }: { item: number | string; index: number }) => {
    const isSelected = index === selectedIndex;
    const label = formatItem ? formatItem(item) : String(item);
    return (
      <View style={[styles.wheelItem, { height: ITEM_HEIGHT }]}>
        <Text
          style={[
            textStyles.bodySemiBold,
            {
              fontSize: isSelected ? 22 : 16,
              color: isSelected ? colors.ink : colors.inkSoft,
              opacity: isSelected ? 1 : 0.4,
            },
          ]}
        >
          {label}
        </Text>
      </View>
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
        onMomentumScrollEnd={handleMomentumEnd}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
        }}
        getItemLayout={(_, index) => ({
          length: ITEM_HEIGHT,
          offset: ITEM_HEIGHT * index,
          index,
        })}
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

  const handleHourChange = (index: number) => {
    const h = HOURS[index];
    const isPM = periodIndex === 1;
    let newHour = h;
    if (isPM && h !== 12) newHour = h + 12;
    if (!isPM && h === 12) newHour = 0;
    onChange({ hours: newHour, minutes: value.minutes });
  };

  const handleMinuteChange = (index: number) => {
    onChange({ hours: value.hours, minutes: MINUTES[index] });
  };

  const handlePeriodChange = (index: number) => {
    const isPM = index === 1;
    let newHour = value.hours;
    if (isPM && newHour < 12) newHour += 12;
    if (!isPM && newHour >= 12) newHour -= 12;
    onChange({ hours: newHour, minutes: value.minutes });
  };

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
