import { folders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';

import * as Crypto from "expo-crypto";

export async function getFolders() {
  const query = db.query.folders
  .findMany({
    with: {
      category: true,
      subfolders: {
        with: {
          notes: true,
        },
      },
      notes: true,
    },
  });

  return query;
}

export async function getFoldersByCategory(
  categoryId?: string | null
) {
  let query;

  if (categoryId?.trim()) {
    query = await db.query.folders
    .findMany({
      where: eq(
        folders.categoryId, categoryId
      ),
      with: {
        category: true,
        subfolders: {
          with: {
            notes: true,
          },
        },
        notes: true,
      },
    });

  } else {
    query = await db.query.folders.findMany({
      with: {
        category: true,
        subfolders: {
          with: {
            notes: true,
          },
        },
        notes: true,
      },
    });
  }

  return query;
}

export async function getFolderById(id: string) {
  const query = await db
  .select()
  .from(folders)
  .where(
    eq(folders.id, id)
  )
  .limit(1);

  return query[0] ?? null;
}

export async function createFolder(
  input: {
    name: string;
    categoryId: string;
}) {
  const folderId = Crypto.randomUUID();
  await db
  .insert(folders)
  .values({
    id: folderId,
    name: input.name,
    categoryId: input.categoryId,
    createdAt: new Date(),
  });
}

export async function updateFolder(
  id: string,
  input: {
    name: string;
    categoryId?: string;
}) {
  await db
  .update(folders)
  .set({
    name: input.name,
    categoryId: input.categoryId,
    updatedAt: new Date(),
  })
  .where(
    eq(folders.id, id)
  );
}

export async function deleteFolder(id: string) {
  await db
  .delete(folders)
  .where(
    eq(folders.id, id)
  );
}
