import { Tabs, router } from "expo-router";
import { View, TouchableOpacity, Platform } from "react-native";
import { House, Leaf, Moon, CheckSquare, User, Drop, ForkKnife, Sparkle } from "phosphor-react-native";
import { colors, typography } from "../../src/theme/tokens";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
        <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: `${colors.bgPaper}F2`,
            borderTopWidth: 1,
            borderTopColor: `${colors.line}80`,
            elevation: 0,
            shadowColor: colors.ink,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            height: 60,
            paddingBottom: 6,
            ...(Platform.OS === "web" ? { backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" } as any : {}),
          },
          tabBarActiveTintColor: colors.accentOlive,
          tabBarInactiveTintColor: colors.inkSoft,
          tabBarLabelStyle: {
            fontFamily: typography.caption.fontFamily,
            fontSize: 10,
            marginTop: 2,
            letterSpacing: 0.3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => <House color={color as string} size={size} weight={focused ? "fill" : "regular"} />,
          }}
        />
        <Tabs.Screen
          name="nourish"
          options={{
            title: "Nourish",
            tabBarIcon: ({ color, size, focused }) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Drop color={color as string} size={20} weight={focused ? "fill" : "regular"} style={{ marginRight: -6 }} />
                <ForkKnife color={color as string} size={20} weight={focused ? "fill" : "regular"} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="assistant"
          options={{
            title: "", // Remove title to make room for the big icon
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: 68, height: 68, alignItems: 'center', justifyContent: 'center', marginTop: -20 }}>
                {/* Outer Ring with Border */}
                <View style={{
                  position: 'absolute',
                  width: 68,
                  height: 68,
                  borderRadius: 34,
                  backgroundColor: colors.bgPaper,
                  borderWidth: 1,
                  borderColor: colors.line,
                }} />
                
                {/* Mask to hide bottom of the ring so it blends into the tab bar */}
                <View style={{
                  position: 'absolute',
                  bottom: -2, // slightly extend over the border
                  width: 66,
                  height: 35, // hide lower half
                  backgroundColor: colors.bgPaper,
                }} />

                {/* Inner Icon */}
                <View style={{
                  backgroundColor: colors.ink,
                  width: 54,
                  height: 54,
                  borderRadius: 27,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: colors.ink,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 6,
                  elevation: 5,
                }}>
                  <Sparkle color={colors.bgPaper} size={28} weight="fill" />
                </View>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: "Habits",
            tabBarIcon: ({ color, size, focused }) => <CheckSquare color={color as string} size={size} weight={focused ? "fill" : "regular"} />,
          }}
        />
        <Tabs.Screen
          name="sleep"
          options={{
            title: "Sleep",
            tabBarIcon: ({ color, size, focused }) => <Moon color={color as string} size={size} weight={focused ? "fill" : "regular"} />,
          }}
        />
        
        {/* Hidden screens — still routable but not shown in tab bar */}
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="hydration" options={{ href: null }} />
        <Tabs.Screen name="meals" options={{ href: null }} />
      </Tabs>
    </View>
  );
}
