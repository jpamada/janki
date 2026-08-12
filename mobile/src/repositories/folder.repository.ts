import { eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { folders } from '@/db/schema';

export async function getFolders() {
  return db.select().from(folders).where(isNull(folders.deletedAt));
}

export async function getFolderById(id: string) {
  const result = await db
    .select()
    .from(folders)
    .where(eq(folders.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function createFolder(input: {
  id: string;
  name: string;
  parentId?: string | null;
}) {
  const [folder] = await db
    .insert(folders)
    .values({
      id: input.id,
      name: input.name,
      parentId: input.parentId ?? null,
      createdAt: new Date(),
    })
    .returning();

  return folder;
}

export async function updateFolder(
  id: string,
  input: {
    name: string;
  },
) {
  const [folder] = await db
    .update(folders)
    .set({
      name: input.name,
      updatedAt: new Date(),
    })
    .where(eq(folders.id, id))
    .returning();

  return folder;
}

export async function deleteFolder(id: string) {
  const now = new Date();

  const [folder] = await db
    .update(folders)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(eq(folders.id, id))
    .returning();

  return folder;
}
