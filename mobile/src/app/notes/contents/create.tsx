import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createContent } from "@/repositories/content.repository";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ContentFormData } from "@/schemas/content.schema";
import { View } from "react-native";

import ContentForm from "@/components/contents/ContentForm";

export default function CreateNoteScreen() {
  const { noteId, title } = useLocalSearchParams<{
    noteId: string;
    title: string;
  }>();

  const queryClient = useQueryClient();
  const router = useRouter();

  const noteCreateMutation = useMutation({
    mutationFn: createContent,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contents", noteId]
      });
      await queryClient.invalidateQueries({
        queryKey: ["note", noteId],
      });
      router.back();
    },

    onError: (error) => {
      console.error(error.message);
    },
  });

  const handleContentSubmit = async (data: ContentFormData) => {
    await noteCreateMutation.mutateAsync({
      noteId: noteId,
      title: data.title ?? '',
      url: data.url ?? "",
      content: data.content,
      todo: data.todo ?? null,
      remarks: data.remarks ?? "",
      position: data.position ?? null,
    });
  };

  return (
    <View className="flex-1 bg-white">
      <ContentForm
        defaultValues={{
          title: "",
          url: "",
          content: "",
          remarks: "",
          todo: null,
          position: null
        }}
        onSubmit={handleContentSubmit}
      />
    </View>
  )
}