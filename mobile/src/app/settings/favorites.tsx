import { ActivityIndicator, Animated, FlatList, Modal, Pressable, Text, View } from "react-native";
import { getFavoriteLessons, toggleLessonFavorite } from "@/repositories/lesson.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Lightbulb, Star, StarMinus, StarPlus, Trash2 } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { useBottomSheet } from "@/hooks/UseBottomSheet";
import { useMemo, useState } from "react";
import { router } from "expo-router";

import FavoriteItem from "@/components/lessons/FavoriteItem";
import Header from "@/components/shared/Header";
import EmptyList from "@/components/EmptyList";
import BottomSheet from "@/components/shared/BottomSheet";
import { useColorScheme } from "nativewind";
import CustomModal from "@/components/shared/modals/CustomModal";
import DeleteModal from "@/components/shared/modals/DeleteModal";

export default function FavoritesScreen() {
  const { showSnackbar } = useSnackbar();
  const { colorScheme } = useColorScheme();

  const lessonSheet = useBottomSheet();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const { data: favorites = [], isPending: favoritesPending } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavoriteLessons
  });

  const selectedLesson = useMemo(() => 
    favorites.find(
      (lesson) => lesson.id === selectedLessonId,
    ), [favorites, selectedLessonId]
  );

  const toggleFavoriteMutation = useMutation({
    mutationFn: ({ id, favorite }: {
      id: string;
      favorite: boolean;
    }) => toggleLessonFavorite(id, favorite),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["lessons"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["favorites"],
      });

      setModalVisible(false);
      setSelectedLessonId(null);

      if (variables.favorite) {
        showSnackbar({ message: "Added to favorites" });

      } else {
        showSnackbar({ message: "Removed from favorites" });
      }
    },

    onError: (error) => {
      console.error(error);
      showSnackbar({ message: "Something went wrong. Please try again." });
    }
  });

  const handleLessonLongPress = (id: string) => {
    setSelectedLessonId(id);
    lessonSheet.open();
  };

  const handleToggleFavorite = (id: string, favorite: boolean) => {
    toggleFavoriteMutation.mutate({
      id,
      favorite,
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setSelectedLessonId(id);
    setModalVisible(true);
  };

  const resetState = () => {
    lessonSheet.close();
    setModalVisible(false);
    setSelectedLessonId(null);
  }

  return (
    <View 
      className="flex-1 bg-white dark:bg-neutral-900"
      style={{ paddingBottom: insets.bottom }}
    >
      <Header title="Favorites" back />

      {favoritesPending ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : (
        <View className="flex-1">
          <FlatList
            data={favorites}
            className='px-6 py-4'
            keyExtractor={(item) => item.id}
            contentContainerClassName="gap-2"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: insets.bottom
            }}
            renderItem={({ item }) => (
              <FavoriteItem
                id={item.id}
                title={item.name}
                subject={item.subject}
                favorite={item.favorite}
                onLongPress={handleLessonLongPress}
                onRemoveFavorite={handleRemoveFavorite}
              />
            )}
            ListEmptyComponent={
              <EmptyList message="No favorites yet" />
            }
          />
        </View>
      )}

      <BottomSheet
        sheet={lessonSheet}
        onRequestClose={resetState}
        className="px-4 py-8"
      >
        <View className="bg-white rounded-3xl dark:bg-neutral-700">
          <Pressable
            onPress={() => {
              setSelectedLessonId(null);
              lessonSheet.close();
              router.push({
                pathname: "/questions/create",
                params: { lessonId: selectedLessonId }
              });
            }}
            className="
              flex-row items-center gap-2 
              rounded-t-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <Lightbulb size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
            <Text className="text-xl dark:text-neutral-300">
              Add Question
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setSelectedLessonId(null);
              lessonSheet.close();
              router.push({
                pathname: "/questions/browse",
                params: { lessonId: selectedLessonId }
              });
            }}
            className="
              flex-row items-center gap-2 p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            <Lightbulb size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
            <Text className="text-xl dark:text-neutral-300">
              Browse Questions
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              lessonSheet.close(() => {
                if (!selectedLessonId) return;
                setModalVisible(true);
              });
            }}
            className="
              flex-row items-center gap-2 
              rounded-b-3xl p-4 
              bg-white active:bg-gray-100
              dark:bg-neutral-700 dark:active:bg-neutral-600
            "
          >
            {selectedLesson?.favorite ? 
              <>
                <StarMinus size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Remove From Favorites
                </Text>
              </>
            : <>
                <StarPlus size={16} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                <Text className="text-xl dark:text-neutral-300">
                  Add to Favorites
                </Text>
              </>
            }  
          </Pressable>
        </View>
      </BottomSheet>

      <DeleteModal
        icon={StarMinus}
        onClose={resetState}
        header="Remove Favorite"
        onConfirm={() => {
          if (!selectedLesson) return;
          handleToggleFavorite(selectedLesson.id, false);
        }}
        isVisible={modalVisible}
        onConfirmLabel={toggleFavoriteMutation.isPending ? 'Removing...' : 'Confirm'}
        description={`Are you sure you want to remove ${selectedLesson?.name || "this lesson"} from favorites?`}
      />
    </View>
  )
}