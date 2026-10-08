import { FolderClosed, FolderOpen, Star } from "lucide-react-native";
import { Pressable, View, Text } from "react-native";
import { useSfx } from "@/contexts/SfxContext";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { useState } from "react";

import DebouncedPressable from "../shared/pressables/DebouncedPressable";

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

export default function SubjectItem({
  subject,
  onLessonLongPress,
  onSubjectLongPress,
  onToggleFavorite,
}: SubjectItemProps) {
  const { hapticVibration } = useSfx();
  const { colorScheme } = useColorScheme();

  const [subjectIsOpen, setSubjectIsOpen] = useState(false);

  return (
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
          flex-row items-center gap-2
          bg-gray-100 rounded-lg px-2 py-2
          active:bg-gray-100 dark:bg-neutral-800 dark:active:bg-neutral-700
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
        <View>
          {subject?.lessons?.map((lesson) => {
            const hasQuestions = lesson.questions.length > 0;
            const isCompleted = hasQuestions && lesson.dueCount === 0;

            return (
              <DebouncedPressable
                key={lesson.id}
                onPress={() => router.push({
                  pathname: "/quiz/start",
                  params: { lessonId: lesson.id }
                })}
                onLongPress={() => {
                  hapticVibration();
                  onLessonLongPress(lesson.id);
                }}
                className="
                  flex-row items-center justify-between gap-2 
                  bg-white active:bg-gray-100 px-2 py-2 
                  dark:bg-neutral-700 dark:active:bg-neutral-600
                "
              >
                <View className="flex flex-col gap-1">
                  <View className="flex flex-row items-center gap-2">
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        onToggleFavorite(lesson.id, !lesson.favorite);
                      }}
                      className="rounded-xl p-2 active:bg-gray-100 dark:active:bg-neutral-600"
                    >
                      {lesson.favorite ? (
                        <Star 
                          size={20} 
                          color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} 
                          fill={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} />
                      ) : (
                        <Star 
                          size={20} 
                          color={colorScheme === "light" ? "#4b5563" : "#d4d4d4"} 
                        />
                      )}
                    </Pressable>

                    <Text className="
                      text-gray-600 text-lg font-medium 
                      dark:text-neutral-300
                    ">
                      {lesson.name}
                    </Text>
                  </View>

                  <View className="flex flex-row items-center gap-2 ms-12">                   
                    {!hasQuestions ? (
                      <View className="flex flex-row items-center gap-1">
                        <Text className="text-sm text-gray-400">
                          Empty
                        </Text>
                      </View>
                    ) : isCompleted ? (
                      <View className="flex flex-row items-center gap-1">
                        <Text className="text-sm text-gray-400">
                          Completed
                        </Text>
                      </View>
                      
                    ) : (
                      <Text className="text-sm text-gray-400">
                        {lesson.dueCount} left
                      </Text>
                    )}
                  </View>
                </View>
              </DebouncedPressable>
            );
          })}
        </View>
      )}
    </View>
  );
}