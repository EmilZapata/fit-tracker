import { urlForImage } from "@/core/libs/sanity/client";
import { Exercise } from "@/core/libs/sanity/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, Text, View } from "react-native";

interface ExerciseCardProps {
  item: Exercise;
  onPress: () => void;
  showChevron?: boolean;
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "bg-green-500";
    case "intermediate":
      return "bg-yellow-500";
    case "advanced":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getDifficultyText = (difficulty: string) => {
  switch (difficulty) {
    case "beginner":
      return "Beginner";
    case "intermediate":
      return "Intermediate";
    case "advanced":
      return "Advanced";
    default:
      return "Unknown";
  }
};

export default function ExerciseCard({
  item,
  onPress,
  showChevron = false,
}: ExerciseCardProps) {
  return (
    <Pressable
      className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-200"
      onPress={onPress}
    >
      <View className="flex-row p-6">
        <View className="w-20 h-20 bg-white rounded-xl mr-4 overflow-hidden">
          {item?.image ? (
            <Image
              source={{
                uri: urlForImage(item?.image?.asset?._ref!).size(80, 80).url(),
              }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
            />
          ) : (
            <View className="w-full h-full bg-gradient-to-br from-blue-400 border border-blue-500">
              <Ionicons name="fitness" size={24} color="#fff" />
            </View>
          )}
        </View>

        <View className="flex-1 justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-900 mb-1">
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {item.description || "No description available."}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View
              className={`px-3 py-1 rounded-full ${getDifficultyColor(item.difficulty!)}`}
            >
              <Text className="text-sm font-semibold text-white">
                {getDifficultyText(item.difficulty!)}
              </Text>
            </View>

            {showChevron && (
              <Pressable className="p-2">
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </Pressable>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
}
