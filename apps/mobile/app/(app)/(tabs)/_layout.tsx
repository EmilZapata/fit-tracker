import { AntDesign } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="exercises"
        options={{
          title: "Exercises",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="book" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="plus-circle" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="active-workout"
        options={{
          title: "Active workout",
          headerShown: false,
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",

          tabBarIcon: ({ color, size }) => (
            <AntDesign name="clock-circle" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          // tabBarIcon: ({ color, size }) => (
          //   <Image
          //   source={{
          //     uri: user?.imageUrl ?? user?.externalAccounts[0]?.imageUrl
          //   }}
          //   className="rounded-full"
          //     style={{ width: 28, height: 28, borderRadius: 100 }}
          //   />
          //   // <AntDesign name="user" color={color} size={size} />

          // ),
        }}
      />
    </Tabs>
  );
}
