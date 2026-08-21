import { eq, isNull } from 'drizzle-orm';
import { folders } from '@/db/schema';
import { db } from '@/db/client';

export async function getFolders() {
  const query = await db
  .select()
  .from(folders);

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

export async function createFolder(input: {
  id: string;
  name: string;
  parentId?: string | null;
}) {
  await db
  .insert(folders)
  .values({
    id: input.id,
    name: input.name,
    parentId: input.parentId ?? null,
    createdAt: new Date(),
  });
}

export async function updateFolder(
  id: string,
  input: {
    name: string;
  },
) {
  await db
  .update(folders)
  .set({
    name: input.name,
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
