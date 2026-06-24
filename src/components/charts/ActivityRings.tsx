import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import Svg, { Circle } from "react-native-svg";

interface Ring {
  progress: number; // 0 to 1
  color: string;
  backgroundColor: string;
}

interface ActivityRingsProps {
  rings: Ring[]; // outer to inner
  size?: number;
  strokeWidth?: number;
  gap?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ActivityRings({
  rings,
  size = 120,
  strokeWidth = 12,
  gap = 2,
}: ActivityRingsProps) {
  const center = size / 2;

  // Render a single ring
  const renderRing = (ring: Ring, index: number) => {
    const radius = center - strokeWidth / 2 - index * (strokeWidth + gap);
    const circumference = 2 * Math.PI * radius;

    // We animate the progress
    const progressAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.timing(progressAnim, {
        toValue: Math.min(Math.max(ring.progress, 0), 1),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, [ring.progress]);

    const strokeDashoffset = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, 0],
    });

    return (
      <React.Fragment key={index}>
        {/* Track background */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={ring.backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress fill */}
        <AnimatedCircle
          cx={center}
          cy={center}
          r={radius}
          stroke={ring.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          // Rotate -90deg so it starts at the top
          transform={`rotate(-90 ${center} ${center})`}
        />
      </React.Fragment>
    );
  };

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {rings.map(renderRing)}
      </Svg>
    </View>
  );
}
