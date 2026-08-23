import { noteBackupSchema } from "@/schemas/note-backup.schema";
import { File } from "expo-file-system";

import * as DocumentPicker from "expo-document-picker";

export async function importNotesBackup() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return;
  }

  const asset = result.assets[0];

  const file = new File(asset.uri);

  const json = await file.text();

  let data: unknown;

  try {
    data = JSON.parse(json);
  } catch {
    throw new Error("The selected file is not valid JSON");
  }

  const parsed = noteBackupSchema.safeParse(data);

  if (!parsed.success) {
    throw new Error("Invalid notes backup");
  }

  return parsed.data;
}