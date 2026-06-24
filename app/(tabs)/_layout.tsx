import { Tabs, router } from "expo-router";
import { View, TouchableOpacity } from "react-native";
import { House, Leaf, Moon, CheckSquare, User, Drop, ForkKnife, Sparkle } from "phosphor-react-native";
import { colors, typography } from "../../src/theme/tokens";

export default function TabsLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.bgPaper,
            borderTopColor: colors.line,
            elevation: 0,
            shadowOpacity: 0,
            height: 60,
            paddingBottom: 6,
          },
          tabBarActiveTintColor: colors.ink,
          tabBarInactiveTintColor: colors.inkSoft,
          tabBarLabelStyle: {
            fontFamily: typography.caption.fontFamily,
            fontSize: 10,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => <House color={color as string} size={size} weight="regular" />,
          }}
        />
        <Tabs.Screen
          name="nourish"
          options={{
            title: "Nourish",
            tabBarIcon: ({ color, size }) => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Drop color={color as string} size={20} weight="regular" style={{ marginRight: -6 }} />
                <ForkKnife color={color as string} size={20} weight="regular" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="assistant"
          options={{
            title: "Assistant",
            tabBarIcon: ({ color, size }) => (
              <View style={{
                backgroundColor: colors.ink,
                padding: 10,
                borderRadius: 24,
                marginTop: -10, // Slight pop-up effect
                shadowColor: colors.ink,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
              }}>
                <Sparkle color={colors.bgPaper} size={size + 2} weight="fill" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="habits"
          options={{
            title: "Habits",
            tabBarIcon: ({ color, size }) => <CheckSquare color={color as string} size={size} weight="regular" />,
          }}
        />
        <Tabs.Screen
          name="sleep"
          options={{
            title: "Sleep",
            tabBarIcon: ({ color, size }) => <Moon color={color as string} size={size} weight="regular" />,
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
