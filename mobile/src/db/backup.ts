import { categories, folders, subfolders, notes, contents } from './schema';
import { File, Paths } from 'expo-file-system';
import { db } from './client';

import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

type BackupPayload = {
  version: number;
  exportedAt: string;
  data: {
    categories: (typeof categories.$inferSelect)[];
    folders: (typeof folders.$inferSelect)[];
    subfolders: (typeof subfolders.$inferSelect)[];
    notes: (typeof notes.$inferSelect)[];
    contents: (typeof contents.$inferSelect)[];
  };
};

export async function exportData() {
  const [categoriesData, foldersData, subfoldersData, notesData, contentsData] =
    await Promise.all([
      db.select().from(categories),
      db.select().from(folders),
      db.select().from(subfolders),
      db.select().from(notes),
      db.select().from(contents),
    ]);

  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      categories: categoriesData,
      folders: foldersData,
      subfolders: subfoldersData,
      notes: notesData,
      contents: contentsData,
    },
  };

  const file = new File(Paths.cache, `janki-backup-${Date.now()}.json`);
  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Export notes backup',
      UTI: 'public.json',
    });
  }

  return file.uri;
}

export async function importData() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return { imported: false as const };
  }

  const file = new File(result.assets[0].uri);
  const raw = await file.text();

  let payload: BackupPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error('Selected file is not valid JSON.');
  }

  if (!payload?.data) {
    throw new Error('Selected file is not a valid backup.');
  }

  const { categories: cats = [], folders: fol = [], subfolders: sub = [], notes: nts = [], contents: cts = [] } =
    payload.data;

  const toDate = (value: string | number | Date | null | undefined): Date | null => {
    if (!value) return null;
    return value instanceof Date ? value : new Date(value);
  };

  await db.transaction(async (tx) => {
    if (cats.length) {
      await tx.insert(categories).values(cats).onConflictDoNothing();
    }
    if (fol.length) {
      await tx
        .insert(folders)
        .values(
          fol.map((f) => ({
            ...f,
            createdAt: toDate(f.createdAt)!,
            updatedAt: toDate(f.updatedAt),
            deletedAt: toDate(f.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }
    if (sub.length) {
      await tx
        .insert(subfolders)
        .values(
          sub.map((s) => ({
            ...s,
            createdAt: toDate(s.createdAt)!,
            updatedAt: toDate(s.updatedAt),
            deletedAt: toDate(s.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }
    if (nts.length) {
      await tx
        .insert(notes)
        .values(
          nts.map((n) => ({
            ...n,
            createdAt: toDate(n.createdAt)!,
            updatedAt: toDate(n.updatedAt),
            deletedAt: toDate(n.deletedAt),
          })),
        )
        .onConflictDoNothing();
    }
    if (cts.length) {
      await tx.insert(contents).values(cts).onConflictDoNothing();
    }
  });

  return {
    imported: true as const,
    counts: {
      categories: cats.length,
      folders: fol.length,
      subfolders: sub.length,
      notes: nts.length,
      contents: cts.length,
    },
  };
}