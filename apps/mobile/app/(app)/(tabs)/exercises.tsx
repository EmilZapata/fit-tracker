import ExerciseCard from "@/components/exercise-card";
import { Exercise } from "@/core/libs/sanity-types";
import { client } from "@/core/libs/sanity/client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { defineQuery } from "groq";
import React, { useEffect } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const exercisesQuery = defineQuery(`*[_type == "exercise"]{
  ...
}`);

export default function Exercises() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = React.useState<Exercise[]>(
    [],
  );
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exercisesQuery);
      setExercises(exercises);
      setFilteredExercises(exercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate a refresh delay
    await fetchExercises();
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredExercises(exercises);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(lowerCaseQuery),
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises]);

  return (
    <SafeAreaView className="flex flex-1 bg-gray-50">
      {/* Header */}
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">
          Exercise Library
        </Text>
        <Text className="text-gray-600">
          Discover and master new excercises
        </Text>

        {/* Search bar */}
        <View className="flex-row items-center bg-gray-100 rounded-xl px-4 mt-3">
          <Ionicons name="search" size={20} color="#6B7280" />
          <TextInput
            className="flex-1 ml-3 text-gray-800"
            placeholder="Search exercises..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Exercise list */}
      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => router.push(`/exercise-detail/${item._id}`)}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#3B82F6"]} // Android
            tintColor="#3B82F6" // iOS
            title="Pull to refresh exercises"
            titleColor="#6B7280" // iOS
          />
        }
        ListEmptyComponent={
          <View className="bg-white rounded-2xl p-8 items-center">
            <Ionicons name="fitness-outline" size={64} color="#9CA3AF" />
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              {searchQuery ? "No exercises found" : "Loading exercises..."}
            </Text>
            <Text className="text-gray-600 text-center mt-2">
              {searchQuery
                ? "Try adjusting your search"
                : "Your exercise will appear here"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
