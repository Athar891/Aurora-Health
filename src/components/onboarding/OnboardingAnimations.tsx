import React, { useEffect, useRef } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { colors } from "../../theme/tokens";

/* ─── Shared helpers ─── */
function useLoop(duration: number, delay = 0) {
  const val = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, {
          toValue: 1,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(val, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return val;
}

function useSpin(duration: number) {
  const val = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(val, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);
  return val.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
}

function useStaggeredFadeIn(count: number, stagger: number, baseDelay = 0) {
  const vals = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
  useEffect(() => {
    const anims = vals.map((v, i) =>
      Animated.sequence([
        Animated.delay(baseDelay + i * stagger),
        Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }),
      ])
    );
    Animated.parallel(anims).start();
  }, []);
  return vals;
}

/* ─── 1. Landing – Sparkle Star ─── */
export function LandingAnimation() {
  const spin = useSpin(4000);
  const pulse = useLoop(1500);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.1] });

  return (
    <View style={a.center}>
      {/* Outer ring */}
      <Animated.View
        style={[a.ring, a.ringLg, { opacity: ringOpacity, transform: [{ scale: ringScale }] }]}
      />
      {/* Inner ring */}
      <Animated.View
        style={[a.ring, a.ringSm, { opacity: ringOpacity, transform: [{ scale }] }]}
      />
      {/* Star */}
      <Animated.View style={[a.star, { transform: [{ rotate: spin }, { scale }] }]}>
        <View style={a.starDiamond} />
      </Animated.View>
      {/* Floating dots */}
      <Animated.View style={[a.dot, a.dot1, { opacity: pulse }]} />
      <Animated.View style={[a.dot, a.dot2, { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }]} />
      <Animated.View style={[a.dot, a.dot3, { opacity: pulse }]} />
    </View>
  );
}

/* ─── 2. Companion – Heart ─── */
export function CompanionAnimation() {
  const pulse = useLoop(800);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const ringScale1 = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOp1 = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  const ringScale2 = pulse.interpolate({ inputRange: [0, 1], outputRange: [1.1, 1.9] });
  const ringOp2 = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] });

  return (
    <View style={a.center}>
      <Animated.View style={[a.ring, { width: 100, height: 100, borderRadius: 50, borderColor: colors.accentTerracotta }, { opacity: ringOp1, transform: [{ scale: ringScale1 }] }]} />
      <Animated.View style={[a.ring, { width: 100, height: 100, borderRadius: 50, borderColor: colors.accentMustard }, { opacity: ringOp2, transform: [{ scale: ringScale2 }] }]} />
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <View style={a.heart}>
          <View style={a.heartBottom}>
            <View style={a.heartLeft} />
            <View style={a.heartRight} />
          </View>
        </View>
      </Animated.View>
      {/* ECG line placeholder */}
      <View style={a.ecgContainer}>
        <View style={a.ecgLine} />
        <View style={[a.ecgPeak, { left: "35%" }]} />
        <View style={[a.ecgPeak, { left: "55%", height: 18 }]} />
      </View>
    </View>
  );
}

/* ─── 3. Track – Clipboard ─── */
export function TrackAnimation() {
  const checks = useStaggeredFadeIn(3, 500, 200);

  return (
    <View style={a.center}>
      {/* Clipboard */}
      <View style={a.clipboard}>
        <View style={a.clipboardClip} />
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={[a.checkRow, { opacity: checks[i], transform: [{ scale: checks[i].interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }]}>
            <View style={[a.checkBox, i < 2 ? a.checkBoxDone : null]}>
              {i < 2 && <View style={a.checkMark} />}
            </View>
            <View style={[a.checkLine, { width: i === 0 ? 70 : i === 1 ? 55 : 50 }]} />
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

/* ─── 4. Insights – Lightbulb ─── */
export function InsightsAnimation() {
  const glow = useLoop(1200);
  const glowScale = glow.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1.2] });
  const glowOpacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.35] });
  const rays = useStaggeredFadeIn(5, 150, 300);

  const rayPositions = [
    { top: -18, left: "50%", marginLeft: -1, rotate: "0deg" },
    { top: 5, right: -10, rotate: "45deg" },
    { top: 5, left: -10, rotate: "-45deg" },
    { top: "50%", right: -18, marginTop: -1, rotate: "90deg" },
    { top: "50%", left: -18, marginTop: -1, rotate: "-90deg" },
  ];

  return (
    <View style={a.center}>
      {/* Glow */}
      <Animated.View style={[a.glowCircle, { opacity: glowOpacity, transform: [{ scale: glowScale }] }]} />
      {/* Bulb */}
      <View style={a.bulb}>
        <View style={a.bulbHead} />
        <View style={a.bulbBase} />
        {/* Rays */}
        {rays.map((r, i) => (
          <Animated.View
            key={i}
            style={[
              a.ray,
              rayPositions[i] as any,
              { opacity: r, transform: [{ rotate: (rayPositions[i] as any).rotate || "0deg" }] },
            ]}
          />
        ))}
      </View>
      {/* Mini chart */}
      <View style={a.miniChart}>
        {[14, 22, 18, 28, 20].map((h, i) => (
          <Animated.View
            key={i}
            style={[a.chartBar, { height: h, opacity: rays[Math.min(i, rays.length - 1)] }]}
          />
        ))}
      </View>
    </View>
  );
}

/* ─── 5. Routines – Calendar ─── */
export function RoutinesAnimation() {
  const days = useStaggeredFadeIn(7, 200, 100);

  return (
    <View style={a.center}>
      <View style={a.calendar}>
        {/* Header bar */}
        <View style={a.calHeader} />
        {/* Hooks */}
        <View style={[a.calHook, { left: 25 }]} />
        <View style={[a.calHook, { right: 25 }]} />
        {/* Day grid */}
        <View style={a.dayGrid}>
          {days.map((d, i) => (
            <Animated.View
              key={i}
              style={[
                a.dayDot,
                i >= 4 ? { backgroundColor: colors.accentMustard } : { backgroundColor: colors.accentOlive },
                { opacity: d, transform: [{ scale: d }] },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

/* ─── 6. Journey – Path ─── */
export function JourneyAnimation() {
  const pins = useStaggeredFadeIn(2, 800, 200);
  const sparkle = useLoop(1000, 1200);
  const sparkleRotate = sparkle.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View style={a.center}>
      {/* Path dots */}
      <View style={a.pathContainer}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={[a.pathDot, { opacity: 0.3 + i * 0.08 }]} />
        ))}
      </View>
      {/* Start pin */}
      <Animated.View style={[a.pin, a.pinStart, { opacity: pins[0], transform: [{ scale: pins[0].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
        <View style={a.pinInner} />
      </Animated.View>
      {/* End pin */}
      <Animated.View style={[a.pin, a.pinEnd, { opacity: pins[1], transform: [{ scale: pins[1].interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }] }]}>
        <View style={a.pinInner} />
      </Animated.View>
      {/* Sparkle */}
      <Animated.View style={[a.sparkle, { opacity: sparkle, transform: [{ rotate: sparkleRotate }] }]}>
        <View style={a.sparkleDiamond} />
      </Animated.View>
    </View>
  );
}

/* ─── Styles ─── */
const TERRACOTTA = colors.accentTerracotta;
const MUSTARD = colors.accentMustard;
const OLIVE = colors.accentOlive;

const a = StyleSheet.create({
  center: { width: 220, height: 220, alignItems: "center", justifyContent: "center" },

  /* Landing */
  ring: { position: "absolute", borderWidth: 2, borderColor: TERRACOTTA },
  ringLg: { width: 160, height: 160, borderRadius: 80 },
  ringSm: { width: 110, height: 110, borderRadius: 55, borderColor: MUSTARD, borderStyle: "dashed" },
  star: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  starDiamond: { width: 36, height: 36, backgroundColor: TERRACOTTA, borderRadius: 4, transform: [{ rotate: "45deg" }] },
  dot: { position: "absolute", borderRadius: 10, backgroundColor: TERRACOTTA },
  dot1: { width: 8, height: 8, top: 30, left: 40 },
  dot2: { width: 6, height: 6, top: 50, right: 35, backgroundColor: MUSTARD },
  dot3: { width: 5, height: 5, bottom: 45, right: 50, backgroundColor: OLIVE },

  /* Heart */
  heart: { width: 60, height: 60, alignItems: "center", justifyContent: "center", marginTop: -10 },
  heartBottom: { width: 30, height: 30, backgroundColor: TERRACOTTA, transform: [{ rotate: "45deg" }] },
  heartLeft: { position: "absolute", top: 0, left: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: TERRACOTTA },
  heartRight: { position: "absolute", top: -15, left: 0, width: 30, height: 30, borderRadius: 15, backgroundColor: TERRACOTTA },
  ecgContainer: { position: "absolute", bottom: 30, width: 120, height: 24, flexDirection: "row", alignItems: "center" },
  ecgLine: { position: "absolute", width: "100%", height: 2, backgroundColor: OLIVE, opacity: 0.4 },
  ecgPeak: { position: "absolute", width: 2, height: 14, backgroundColor: OLIVE, borderRadius: 1 },

  /* Clipboard */
  clipboard: { width: 130, height: 160, borderRadius: 12, borderWidth: 3, borderColor: TERRACOTTA, paddingTop: 28, paddingHorizontal: 14, gap: 14 },
  clipboardClip: { position: "absolute", top: -8, alignSelf: "center", width: 44, height: 14, borderRadius: 7, backgroundColor: TERRACOTTA },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkBox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: OLIVE, alignItems: "center", justifyContent: "center" },
  checkBoxDone: { backgroundColor: OLIVE, borderColor: OLIVE },
  checkMark: { width: 8, height: 4, borderLeftWidth: 2, borderBottomWidth: 2, borderColor: "#fff", transform: [{ rotate: "-45deg" }], marginTop: -2 },
  checkLine: { height: 6, borderRadius: 3, backgroundColor: MUSTARD, opacity: 0.6 },

  /* Insights */
  glowCircle: { position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: MUSTARD },
  bulb: { width: 70, height: 90, alignItems: "center", marginTop: -20 },
  bulbHead: { width: 60, height: 60, borderRadius: 30, backgroundColor: MUSTARD },
  bulbBase: { width: 28, height: 16, borderRadius: 4, backgroundColor: MUSTARD, marginTop: -2 },
  ray: { position: "absolute", width: 2, height: 18, backgroundColor: TERRACOTTA, borderRadius: 1 },
  miniChart: { flexDirection: "row", alignItems: "flex-end", gap: 6, marginTop: 16 },
  chartBar: { width: 12, borderRadius: 4, backgroundColor: OLIVE, opacity: 0.7 },

  /* Calendar */
  calendar: { width: 140, height: 130, borderRadius: 12, borderWidth: 3, borderColor: TERRACOTTA, overflow: "visible" },
  calHeader: { height: 26, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: TERRACOTTA },
  calHook: { position: "absolute", top: -6, width: 6, height: 16, borderRadius: 3, backgroundColor: TERRACOTTA },
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 12 },
  dayDot: { width: 18, height: 18, borderRadius: 9 },
  fireContainer: { marginTop: 14, alignItems: "center" },
  fireStar: { width: 20, height: 20, backgroundColor: TERRACOTTA, borderRadius: 3, transform: [{ rotate: "45deg" }] },

  /* Journey */
  pathContainer: { flexDirection: "row", alignItems: "center", gap: 6, position: "absolute" },
  pathDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: MUSTARD },
  pin: { position: "absolute", width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  pinStart: { left: 30, bottom: 60, backgroundColor: TERRACOTTA },
  pinEnd: { right: 30, top: 60, backgroundColor: OLIVE },
  pinInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#F4F0EA" },
  sparkle: { position: "absolute", top: 50, right: 40 },
  sparkleDiamond: { width: 16, height: 16, backgroundColor: MUSTARD, borderRadius: 2, transform: [{ rotate: "45deg" }] },
});
