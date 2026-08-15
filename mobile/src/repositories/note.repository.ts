import { and, eq, isNull } from 'drizzle-orm';
import { notes } from '@/db/schema';
import { db } from '@/db/client';

export async function getNotes() {
  const query = await db
  .select()
  .from(notes)
  .where(
    isNull(notes.deletedAt)
  );

  return query;
}

export async function getNotesByFolderId(folderId: string) {
  const query = await db
  .select()
  .from(notes)
  .where(
    and(
      eq(notes.folderId, folderId), 
      isNull(notes.deletedAt)
    )
  );

  return query;
}

export async function getNoteById(id: string) {
  const query = await db
  .select()
  .from(notes)
  .where(
    and(
      eq(notes.id, id),
      isNull(notes.deletedAt)
    )
  )
  .limit(1);

  return query[0];
}

export async function createNote(
  input: {
    id: string;
    title: string;
    content?: string;
    folderId?: string | null;
}) {
  await db
  .insert(notes)
  .values({
    id: input.id,
    title: input.title,
    content: input.content ?? '',
    folderId: input.folderId ?? null,
    createdAt: new Date(),
  });
}

export async function updateNote(
  id: string,
  input: {
    title: string;
    content: string;
  },
) {
  await db
  .update(notes)
  .set({
    title: input.title,
    content: input.content,
    updatedAt: new Date(),
  })
  .where(
    eq(notes.id, id)
  );
};

export async function deleteNote(id: string) {
  await db
  .update(notes)
  .set({
    deletedAt: new Date(),
    updatedAt: new Date(),
  })
  .where(
    eq(notes.id, id)
  );
};