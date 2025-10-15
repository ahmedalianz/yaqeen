import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { TextStyle } from "react-native";

export default function TabLayout() {
  const TabBarIcon = ({ name, focused }: { name: any; focused: boolean }) => (
    <Ionicons name={name} size={24} color={focused ? "#0369a1" : "#64748b"} />
  );
  const tabBarLabelStyle: TextStyle = {
    fontSize: 12,
    fontFamily: "Cairo_500Medium",
    marginTop: -2,
  };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarLabelStyle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={"home"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: "القبلة",
          tabBarLabelStyle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={"compass"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quarn"
        options={{
          title: "القرآن",
          tabBarLabelStyle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={"book"} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "الإعدادات",
          tabBarLabelStyle,
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={"settings"} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
