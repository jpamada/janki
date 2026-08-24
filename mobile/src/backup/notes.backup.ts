import { noteBackupSchema } from "@/schemas/note-backup.schema";
import { Directory } from "expo-file-system";

export async function exportNotesBackup(data: unknown) {
  const result = noteBackupSchema.safeParse(data);

  if (!result.success) {
    throw new Error("Invalid notes backup");
  }

  const json = JSON.stringify(result.data, null, 2);

  const directory = await Directory.pickDirectoryAsync();

  if (!directory) {
    return;
  }

  const file = directory.createFile(
    `notes-${new Date().toISOString().split("T")[0]}`,
    "application/json"
  );

  file.write(json);
}