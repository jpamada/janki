import { folders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';

import * as Crypto from "expo-crypto";

export async function getNoteFolders() {
  const query = await db
  .select()
  .from(folders);

  return query;
}

export async function getNoteFoldersByCategory(
  categoryId?: string | null
) {
  const query = await db
  .select()
  .from(folders)
  .where(
    eq(folders.categoryId, categoryId ?? "")
  );

  return query;
}

export async function getNoteFolderById(id: string) {
  const query = await db
  .select()
  .from(folders)
  .where(
    eq(folders.id, id)
  )
  .limit(1);

  return query[0] ?? null;
}

export async function createNoteFolder(
  input: {
    name: string;
    categoryId: string;
}) {
  const noteFolderId = Crypto.randomUUID();
  await db
  .insert(folders)
  .values({
    id: noteFolderId,
    name: input.name,
    categoryId: input.categoryId,
    createdAt: new Date(),
  });
}

export async function updateNoteFolder(
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

export async function deleteNoteFolder(id: string) {
  await db
  .delete(folders)
  .where(
    eq(folders.id, id)
  );
}
