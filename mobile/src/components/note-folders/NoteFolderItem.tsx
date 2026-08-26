import { getNotesByFolderId } from "@/repositories/note.repository";
import { Pressable, Text, View } from "react-native";
import { FolderClosed } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import NoteItem from "../notes/NoteItem";

type NoteFolderItemProps = {
  id: string;
  name: string;
  onLongPress: (id: string) => void;
  onNoteLongPress: (id: string) => void;
};

export default function NoteFolderItem({
  id,
  name,
  onLongPress,
  onNoteLongPress,
}: NoteFolderItemProps) {

  const [notesVisible, setNotesVisible] = useState(false);

  const { data: notes = [], isPending, error } = useQuery({
    queryKey: ["notes", id],
    queryFn: () => getNotesByFolderId(id),
    enabled: !!id
  })

  return (
    <View className="bg-gray-50 rounded-lg">
      <Pressable
        delayLongPress={500}
        onLongPress={() => {
          onLongPress(id)
        }}
        onPress={() => {
          setNotesVisible((prev) => !prev)
        }}
        className={`
          flex flex-row items-center gap-2 
          bg-gray-50 rounded-lg 
          px-4 py-4 
        `}
      >
        <FolderClosed size={16} />
        <Text className="text-gray-600 font-semibold">
          {name}
        </Text>
      </Pressable>

      {notesVisible && (
        <View className="ps-6">
          {notes.map((note) => (
            <NoteItem
              key={note.id}
              id={note.id}
              title={note.title}
              createdAt={note.createdAt}
              onLongPress={onNoteLongPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}