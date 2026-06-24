import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing, TouchableOpacity, Text } from "react-native";
import { colors, spacing, typography } from "../../theme/tokens";
import { X } from "phosphor-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface AIVoiceOrbProps {
  isVisible: boolean;
  state: "idle" | "listening" | "processing" | "speaking";
  onTap: () => void;
  onClose: () => void;
  text?: string;
}

export function AIVoiceOrb({ isVisible, state, onTap, onClose, text }: AIVoiceOrbProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // Three continuous rotation values
  const rot1 = useRef(new Animated.Value(0)).current;
  const rot2 = useRef(new Animated.Value(0)).current;
  const rot3 = useRef(new Animated.Value(0)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();

      let speedMult = 1;
      if (state === "listening") speedMult = 0.8;
      if (state === "processing") speedMult = 0.5;
      if (state === "speaking") speedMult = 0.6;

      const spin1 = Animated.loop(
        Animated.timing(rot1, { toValue: 1, duration: 6000 * speedMult, easing: Easing.linear, useNativeDriver: true })
      );
      const spin2 = Animated.loop(
        Animated.timing(rot2, { toValue: 1, duration: 9000 * speedMult, easing: Easing.linear, useNativeDriver: true })
      );
      const spin3 = Animated.loop(
        Animated.timing(rot3, { toValue: 1, duration: 12000 * speedMult, easing: Easing.linear, useNativeDriver: true })
      );

      spin1.start();
      spin2.start();
      spin3.start();

      let rippleLoop: Animated.CompositeAnimation | null = null;
      if (state === "speaking") {
        rippleLoop = Animated.loop(
          Animated.timing(rippleAnim, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true })
        );
        rippleLoop.start();
      } else {
        Animated.timing(rippleAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      }

      return () => {
        spin1.stop();
        spin2.stop();
        spin3.stop();
        rippleLoop?.stop();
        rot1.setValue(0);
        rot2.setValue(0);
        rot3.setValue(0);
        rippleAnim.setValue(0);
      };
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible, state]);

  if (!isVisible) return null;

  // Rotations mapped to 360 degrees
  const spin1 = rot1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const spin2 = rot2.interpolate({ inputRange: [0, 1], outputRange: ["360deg", "0deg"] }); // reverse
  const spin3 = rot3.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  let c1 = "#00B4D8"; // Bright sky blue
  let c2 = "#90E0EF"; // Light sky blue
  let c3 = "#0077B6"; // Deeper blue for contrast

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color={colors.white} />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.orbWrapper}>
          
          {/* Speaking Ripple Effect */}
          <Animated.View style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: c2,
              borderRadius: 100,
              opacity: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] }),
              transform: [{ scale: rippleAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.4] }) }]
            }
          ]} />

          <TouchableOpacity style={[styles.orbSphere, { backgroundColor: c2 }]} onPress={onTap} activeOpacity={0.9}>
            
            {/* Massive off-center rotating gradient 1 */}
            <Animated.View style={[styles.fluidLayer, styles.layer1, { transform: [{ rotate: spin1 }] }]}>
               <LinearGradient
                 colors={[c1, c1 + "00"]} // Color to transparent
                 style={styles.gradientFill}
                 start={{ x: 0.2, y: 0.2 }}
                 end={{ x: 0.8, y: 0.8 }}
               />
            </Animated.View>

            {/* Massive off-center rotating gradient 2 */}
            <Animated.View style={[styles.fluidLayer, styles.layer2, { transform: [{ rotate: spin2 }] }]}>
               <LinearGradient
                 colors={[c3 + "E6", "transparent"]} // 90% opacity to transparent
                 style={styles.gradientFill}
                 start={{ x: 0.5, y: 0.0 }}
                 end={{ x: 0.5, y: 1.0 }}
               />
            </Animated.View>

            {/* Massive off-center rotating gradient 3 */}
            <Animated.View style={[styles.fluidLayer, styles.layer3, { transform: [{ rotate: spin3 }] }]}>
               <LinearGradient
                 colors={[c2 + "CC", "transparent", c1 + "CC"]} // 80% opacity
                 style={styles.gradientFill}
                 start={{ x: 0.0, y: 1.0 }}
                 end={{ x: 1.0, y: 0.0 }}
               />
            </Animated.View>

            {/* Static 3D Specular Highlight / Glass effect */}
            <View style={styles.specularHighlight}>
               <LinearGradient
                 colors={["rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.05)", "transparent"]}
                 style={styles.gradientFill}
                 start={{ x: 0.2, y: 0.1 }}
                 end={{ x: 0.8, y: 0.8 }}
               />
            </View>
            
            {/* Static 3D Bottom Shadow */}
            <View style={styles.innerShadow}>
               <LinearGradient
                 colors={["transparent", "rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.6)"]}
                 style={styles.gradientFill}
                 start={{ x: 0.5, y: 0.3 }}
                 end={{ x: 0.5, y: 1 }}
               />
            </View>
            
          </TouchableOpacity>
        </View>

        <Text style={styles.stateText}>
          {state === "listening"
            ? "Listening..."
            : state === "processing"
            ? "Thinking..."
            : state === "speaking"
            ? "Aurora"
            : "Tap to speak"}
        </Text>
        {text ? <Text style={styles.subtitleText}>{text}</Text> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 16, 12, 0.95)", 
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    justifyContent: "center",
  },
  orbWrapper: {
    width: 200,
    height: 200,
    marginBottom: spacing.xxl,
    borderRadius: 100, 
    shadowColor: colors.white,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 30,
    elevation: 15,
    backgroundColor: "transparent", 
  },
  orbSphere: {
    flex: 1,
    borderRadius: 100, 
    overflow: "hidden", 
  },
  // The fluid layers are massive and purposely off-centered so when they rotate, 
  // the gradients sweep across the 200x200 container like a rolling liquid wave.
  fluidLayer: {
    position: "absolute",
  },
  layer1: {
    width: 600,
    height: 600,
    top: -200,
    left: -200,
  },
  layer2: {
    width: 800,
    height: 800,
    top: -300,
    left: -150, // slightly offset center
  },
  layer3: {
    width: 500,
    height: 500,
    top: -100, // offset
    left: -250,
  },
  gradientFill: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  specularHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
  },
  innerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
  },
  stateText: {
    fontFamily: typography.display.semiBold,
    fontSize: 28,
    color: colors.white,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  subtitleText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    paddingHorizontal: spacing.xl,
    maxWidth: "80%",
  },
});
