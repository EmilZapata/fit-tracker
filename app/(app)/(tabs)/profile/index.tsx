import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Page() {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut(),
      },
    ]);
  };

  return (
    <SafeAreaView className="flex flex-1">
      <Text>Profile</Text>
      {/* Sign Out Button */}
      <View className="px-6 mb-8">
        <Pressable
          className="bg-red-600 rounded-2xl p-4 shadow-sm"
          onPress={handleSignOut}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Sign Out
            </Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
