import Animated, { FadeInUp, FadeOutUp, LayoutAnimationConfig, LinearTransition } from "react-native-reanimated";
import { FolderClosed, FolderOpen, Star } from "lucide-react-native";
import { Pressable, StyleSheet, View, Text } from "react-native";
import { useSfx } from "@/contexts/SfxContext";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { useState } from "react";

import DebouncedPressable from "../shared/pressables/DebouncedPressable";

const ANIMATION_DURATION = 200;

const ENTERING = FadeInUp.duration(ANIMATION_DURATION);
const EXITING = FadeOutUp.duration(ANIMATION_DURATION);
const LAYOUT = LinearTransition.duration(ANIMATION_DURATION);

const styles = StyleSheet.create({
  clip: {
    overflow: "hidden",
  },
});

type SubjectItemProps = {
  subject: {
    id: string;
    name: string;
    lessons: {
      id: string;
      name: string;
      favorite: boolean;
      questions: {
        id: string;
      }[];
      dueCount: number;
    }[];
  };
  onLessonLongPress: (id: string) => void;
  onSubjectLongPress: (id: string) => void;
  onToggleFavorite: (id: string, favorite: boolean) => void;
};

function SubjectItemContent({
  subject,
  onLessonLongPress,
  onSubjectLongPress,
  onToggleFavorite,
}: SubjectItemProps) {
  const { hapticVibration } = useSfx();
  const { colorScheme } = useColorScheme();

  const [subjectIsOpen, setSubjectIsOpen] = useState(false);

  return (
    <Animated.View layout={LAYOUT} style={styles.clip}>
      <View className="rounded-xl bg-gray-50 dark:bg-neutral-800">
        <Pressable
          onPress={() => {
            setSubjectIsOpen((prev) => !prev);
          }}
          onLongPress={() => {
            hapticVibration();
            onSubjectLongPress(subject.id);
          }}
          delayLongPress={500}
          className="
            z-10 flex-row items-center gap-2
            rounded-lg px-2 py-2
            bg-gray-100 active:bg-gray-200 active:rounded-b-none
            dark:bg-neutral-800 dark:active:bg-[#292929]
          "
        >
          <View className="p-2">
            {subjectIsOpen 
              ? <FolderOpen size={18} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} /> 
              : <FolderClosed size={18} color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
            }
          </View>

          <Text className="flex-1 text-gray-700 text-lg font-semibold dark:text-neutral-300">
            {subject.name}
          </Text>
        </Pressable>
        
        {subjectIsOpen && (
          <Animated.View entering={ENTERING} exiting={EXITING}>
            {subject?.lessons?.map((lesson) => {
              const hasQuestions = lesson.questions.length > 0;
              const isCompleted = hasQuestions && lesson.dueCount === 0;

              return (
                <DebouncedPressable
                  key={lesson.id}
                  onPress={() =>
                    router.push({
                      pathname: "/quiz/start",
                      params: { lessonId: lesson.id },
                    })
                  }
                  onLongPress={() => {
                    hapticVibration();
                    onLessonLongPress(lesson.id);
                  }}
                  className="
                    flex-row items-center gap-2
                    bg-gray-50 active:bg-gray-100 px-2 py-2
                    dark:bg-neutral-700 dark:active:bg-neutral-600
                  "
                >
                  <View className="min-w-0 flex-1">
                    <View className="flex-row items-start gap-2">
                      <Pressable
                        onPress={(event) => {
                          event.stopPropagation();
                          onToggleFavorite(lesson.id, !lesson.favorite);
                        }}
                        className="
                          shrink-0 rounded-xl p-2
                          active:bg-gray-100 dark:active:bg-neutral-600
                        "
                      >
                        <Star
                          size={20}
                          color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"}
                          fill={
                            lesson.favorite
                              ? colorScheme === "light"
                                ? "#4b5563"
                                : "#d4d4d4"
                              : "transparent"
                          }
                        />
                      </Pressable>
                      
                      <View className="flex-col ">
                        <Text
                          className="
                            min-w-0 flex-1 shrink
                            text-gray-600 text-lg font-medium
                            dark:text-neutral-300
                          "
                        >
                          {lesson.name}
                        </Text>

                        <View className="flex-row items-center gap-2">
                          {!hasQuestions ? (
                            <Text className="text-sm text-gray-400">Empty</Text>
                          ) : isCompleted ? (
                            <Text className="text-sm text-gray-400">Completed</Text>
                          ) : (
                            <Text className="text-sm text-gray-400">
                              {lesson.dueCount} left
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </DebouncedPressable>
              );
            })}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export default function SubjectItem(props: SubjectItemProps) {
  return (
    <LayoutAnimationConfig skipExiting>
      <SubjectItemContent {...props} />
    </LayoutAnimationConfig>
  );
}