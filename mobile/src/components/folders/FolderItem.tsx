import { FileText, FolderClosed, FolderOpen } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';

import * as Haptics from 'expo-haptics';

type FolderItemProps = {
  folder: {
    id: string;
    name: string;
    subfolders: {
      id: string;
      name: string;
      notes: {
        id: string;
        title: string;
        createdAt: Date;
      }[];
    }[];
    notes: {
      id: string;
      title: string;
      createdAt: Date;
    }[];
  };
  onFolderLongPress: (id: string) => void;
  onSubfolderLongPress: (id: string) => void;
  onNoteLongPress: (id: string) => void;
};

export default function FolderItem({
  folder,
  onFolderLongPress,
  onSubfolderLongPress,
  onNoteLongPress,
}: FolderItemProps) {

  const [folderIsOpen, setFolderIsOpen] = useState(false);
  const [subfolderIsOpen, setSubfolderIsOpen] = useState(false);

  return (
    <View className="rounded-xl bg-gray-50">
      <Pressable
        delayLongPress={500}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onFolderLongPress(folder.id);
        }}
        onPress={() => setFolderIsOpen((prev) => !prev)}
        className="flex-row items-center gap-2 rounded-lg px-4 py-4"
      >
        {folderIsOpen ? <FolderOpen size={18} /> : <FolderClosed size={18} />}

        <Text className="flex-1 font-semibold text-gray-700">
          {folder.name}
        </Text>
      </Pressable>

      {folderIsOpen && (
        <View className={`${folder.subfolders.length > 0 ? "pb-2 ps-4" : ""}`}>
          {folder.subfolders.map((subfolder) => (
            <View key={subfolder.id}>
              <Pressable
                delayLongPress={500}
                onPress={() => setSubfolderIsOpen((prev) => !prev)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSubfolderLongPress(subfolder.id);
                }}
                className="flex-row items-center gap-2 px-4 py-3"
              >
                 {subfolderIsOpen ? <FolderOpen size={18} /> : <FolderClosed size={18} />}
                <Text className="font-medium text-gray-600">
                  {subfolder.name}
                </Text>
              </Pressable>

              {subfolderIsOpen && (
                subfolder.notes.map((note) => (
                  <Pressable
                    key={note.id}
                    onPress={() => router.push(`/notes/${note.id}`)}
                    onLongPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onNoteLongPress(note.id);
                    }}
                    className="flex-row items-center gap-2 px-4 py-3 ps-8"
                  >
                    <FileText size={18} />
                    <Text className="font-medium text-gray-600">{note.title}</Text>
                  </Pressable>
                ))
              )}
            </View>
          ))}

          {folder.notes.map((note) => (
            <Pressable
              key={note.id}
              onPress={() => router.push(`/notes/${note.id}`)}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onNoteLongPress(note.id);
              }}
              className="flex-row items-center gap-2 px-4 py-3"
            >
              <FileText size={18} />
              <Text className="font-medium text-gray-600">{note.title}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}