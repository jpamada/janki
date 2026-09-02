import { deleteContent, getContentById, updateContent } from "@/repositories/content.repository";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Text, View } from "react-native";
import { ContentFormData } from "@/schemas/content.schema";
import { SearchX } from "lucide-react-native";

import ContentForm from "@/components/contents/ContentForm";

export default function ContentScreen() {
  const { noteId, contentId } = useLocalSearchParams<{
    noteId: string;
    contentId: string;
  }>();

  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: content, isLoading, error } = useQuery({
    queryKey: ["content", contentId],
    queryFn: () => getContentById(contentId),
    enabled: !!contentId,
  });

  const updateContentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContentFormData }) =>
      updateContent(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contents", noteId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["content", contentId],
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

  const deleteContentMutation = useMutation({
    mutationFn: deleteContent,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contents"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["contents", noteId],
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
     await updateContentMutation.mutateAsync({
      id: contentId,
      data: {
        title: data.title,
        url: data.url ?? "",
        content: data.content,
        todo: data.todo ?? null,
        remarks: data.remarks ?? "",
        position: data.position ?? null,
      }
    });
  };

  const handleContentDelete = async () => {
    await deleteContentMutation.mutateAsync(contentId);
  }

  return (
    <View className="flex-1 bg-white">
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="small" color="#4b5563" />
        </View>

      ) : error ? (
        <View className="flex-1 items-center justify-center">
          <Text>Failed to load content</Text>
        </View>

      ) : !content ? (
        <View className="flex-1 items-center justify-center">
          <SearchX size={64} color="#9ca3af" />
          <Text className="font-semibold text-gray-400">
            Content not found
          </Text>
        </View>

      ) : (
        <ContentForm
          key={content.id}
          defaultValues={{
            id: content.id,
            title: content.title,
            content: content.content,
            url: content.url ?? "",
            todo: content.todo ?? null,
            remarks: content.remarks ?? "",
            position: content.position ?? null
          }}
          onSubmit={handleContentSubmit}
          onDelete={handleContentDelete}
        />
      )}
    </View>
  );
}