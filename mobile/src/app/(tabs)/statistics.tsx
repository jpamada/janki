import { getFavoriteLessons, toggleLessonFavorite } from '@/repositories/lesson.repository';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Lightbulb, Star, StarMinus, StarPlus } from 'lucide-react-native';
import { Animated, Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSnackbar } from '@/providers/SnackbarContext';
import { useBottomSheet } from '@/hooks/UseBottomSheet';
import { FlatList } from 'react-native-gesture-handler';
import { router } from 'expo-router';
import { useState } from 'react';

import FavoriteItem from '@/components/lessons/FavoriteItem';
import ReviewHeatmap from '@/components/logs/LogsHeatmap';
import ReviewStats from '@/components/logs/ReviewStats';
import Header from '@/components/shared/Header';

export default function StatisticsScreen() {
  const { showSnackbar } = useSnackbar();

  const {
    backdropOpacity,
    open: openBottomSheet,
    close: closeBottomSheet,
    visible: bottomSheetVisible,
    translateY: bottomSheetTranslateY,
  } = useBottomSheet();

  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavoriteLessons
  });

  const selectedLesson = favorites.find(
    (lesson) => lesson.id === selectedLessonId,
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
    }
  });

  const handleLessonLongPress = (id: string) => {
    setSelectedLessonId(id);
    openBottomSheet();
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

  return (
    <View 
      className='flex-1 bg-white'
    >
      <Header title="Stats" />

      <View
        className="flex-1 px-6 py-4"
      >
        <ReviewStats />
        <ReviewHeatmap />

        <View className='bg-white rounded-xl py-4 min-h-60 mb-16'>
          <Text className='text-gray-600 text-lg font-bold mb-2'>
            Favorites
          </Text>

          {favorites.length > 0 ? (
            <FlatList
              data={favorites}
              keyExtractor={(item) => item.id}
              contentContainerClassName="gap-2"
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
            />
          ) : (
            <View className='flex-1 justify-center items-center'>
              <Star size={64} color="#d1d5db" />
              <Text className='text-gray-300 font-semibold'>
                No Favorites found
              </Text>
            </View>
          )}
        </View>

      <Modal
        transparent
        animationType="none"
        visible={bottomSheetVisible}
        onRequestClose={() => closeBottomSheet()}
      >
        <View className="flex-1 justify-end">
          <Animated.View
            className="absolute inset-0 bg-black/40"
            style={{ opacity: backdropOpacity }}
          >
            <Pressable
              className="flex-1"
              onPress={() => {
                setSelectedLessonId(null);
                closeBottomSheet();
              }}
            />
          </Animated.View>

          <Animated.View
            style={{
              transform: [{
                translateY: bottomSheetTranslateY,
              }],
            }}
            className="rounded-t-3xl bg-gray-50 px-4 py-8"
          >
            <View className="rounded-3xl bg-white">
              <Pressable
                onPress={() => {
                  setSelectedLessonId(null);
                  closeBottomSheet(() => {
                    router.push({
                      pathname: "/questions/create",
                      params: { lessonId: selectedLessonId }
                    });
                  });
                }}
                className="flex-row items-center gap-2 rounded-t-3xl p-4 active:bg-gray-100"
              >
                <Lightbulb size={16} />
                <Text className="text-xl">
                  Add Question
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setSelectedLessonId(null);
                  closeBottomSheet(() => {
                    router.push({
                      pathname: "/questions/browse",
                      params: { lessonId: selectedLessonId }
                    });
                  });
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                <Lightbulb size={16} />
                <Text className="text-xl">
                  Browse Questions
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  closeBottomSheet(() => {
                    if (!selectedLessonId) return;
                    setModalVisible(true);
                  });
                }}
                className="flex-row items-center gap-2 p-4 active:bg-gray-100"
              >
                {selectedLesson?.favorite ? 
                  <>
                    <StarMinus size={16} />
                    <Text className="text-xl">
                      Remove From Favorites
                    </Text>
                  </>
                : <>
                    <StarPlus size={16} />
                    <Text className="text-xl">
                      Add to Favorites
                    </Text>
                  </>
                }  
              </Pressable>
              </View>

              <View style={{ height: insets.bottom }} />
            </Animated.View>
          </View>
        </Modal>

        <Modal
          transparent
          animationType="fade"
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <Pressable
            className="flex-1 items-center justify-center bg-black/40"
            onPress={() => {
              setSelectedLessonId(null);
              setModalVisible(false);
            }}
          >
            <Pressable
              className="w-[90%] rounded-2xl bg-white p-6"
              onPress={(event) => event.stopPropagation()}
            >
              <View>
                <Text className="text-xl font-bold">
                  Confirm Action
                </Text>

                <Text className="mt-2 text-gray-500">
                    Are you sure you want to remove this lesson from your favorites?
                </Text>

                <View className="mt-6 flex-row justify-end gap-2">
                  <Pressable
                    onPress={() => {
                      setSelectedLessonId(null);
                      setModalVisible(false);
                    }}
                    className="rounded-full px-6 py-3 active:bg-gray-100"
                  >
                    <Text className="font-semibold text-gray-600">
                      Cancel
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      if (!selectedLesson) return;
                      handleToggleFavorite(
                        selectedLesson.id,
                        false
                      );
                    }}
                    disabled={toggleFavoriteMutation.isPending}
                    className="rounded-full bg-red-500 px-6 py-3 active:bg-red-400"
                  >
                    <Text className="font-semibold text-white">
                      {toggleFavoriteMutation.isPending
                        ? "Removing..."
                        : "Remove"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
    </View>
  );
}
