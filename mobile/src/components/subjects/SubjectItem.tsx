import { FileText, FolderClosed, FolderOpen, Lightbulb, Star } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import { Text } from "react-native";
import { useState } from "react";

import * as Haptics from 'expo-haptics';

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
      progress: {
        sessionDate: string;
        status: 'unanswered' | 'correct' | 'incorrect';
      }[];
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

  const [subjectIsOpen, setSubjectIsOpen] = useState(false);

  return (
    <View className="rounded-xl bg-gray-50">
      <Pressable
        delayLongPress={500}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSubjectLongPress(subject.id);
        }}
        onPress={() => {
          setSubjectIsOpen((prev) => !prev);
        }}
        className="flex-row items-center gap-2 rounded-lg px-4 py-4 active:bg-gray-100"
      >
        {subjectIsOpen ? <FolderOpen size={18} /> : <FolderClosed size={18} />}

        <Text className="flex-1 font-semibold text-gray-700 text-lg">
          {subject.name}
        </Text>
      </Pressable>
      
      {subjectIsOpen && (
        <View>
          {subject?.lessons?.map((lesson) => {
            const correctCount = lesson.progress.filter(
              (item) => item.status === 'correct',
            ).length;

            return (
              <Pressable
                key={lesson.id}
                onPress={() => router.push({
                  pathname: "/quiz/play",
                  params: { lessonId: lesson.id }
                })}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onLessonLongPress(lesson.id);
                }}
                className="flex-row items-center justify-between gap-2 px-4 py-4 active:bg-gray-100"
              >
                <View className="flex flex-col gap-1">
                  <View className="flex flex-row items-center gap-2">
                    <Lightbulb size={18} />
                    <Text className="font-medium text-gray-600 text-lg">
                      {lesson.name}
                    </Text>
                  </View>

                  <View className="flex flex-row items-center gap-2 ms-8">
                    <Text className="text-sm text-gray-400">
                      {lesson.questions.length - correctCount} left
                    </Text>
                  </View>
                </View>
                
                <Pressable
                  onPress={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(lesson.id, !lesson.favorite);
                  }}
                  className="rounded-xl px-4 py-2 active:bg-gray-100"
                >
                  {lesson.favorite ? (
                    <Star size={20} color="#9ca3af" fill="#9ca3af" />
                  ) : (
                    <Star size={20} color="#9ca3af" />
                  )}
                </Pressable>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}