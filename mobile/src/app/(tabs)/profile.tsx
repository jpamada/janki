import { getAllNotesForBackup } from "@/repositories/note.repository";
import { Pressable, ScrollView, Text, View } from "react-native";
import { exportNotesBackup } from "@/backup/notes.backup";
import { CloudUpload } from "lucide-react-native";

import Header from "@/components/shared/Header";

export default function ProfileScreen() {
  const backupNotes = async () => {
    try {
      const noteData = await getAllNotesForBackup();

      await exportNotesBackup({
        version: 1,
        type: "notes",
        exportedAt: new Date().toISOString(),
        notes: noteData,
      });

    } catch (error) {
      console.error("Export failed:", error);
    }
  }

  return (
    <View className="flex-1 bg-white">
      <Header title="Profile" />

      <ScrollView
        overScrollMode="always"
        className="flex-1 px-6 py-4"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => backupNotes()}
        >
          <View className='flex flex-row items-center gap-4 p-4 bg-gray-50 rounded-lg'>
            <View className='bg-white rounded-xl p-4'>
              <CloudUpload color="#9ca3af" />
            </View>

            <Text className='text-gray-600 text-lg font-bold'>Backup</Text>
          </View>
        </Pressable>
      </ScrollView>
    </View>
  )
}