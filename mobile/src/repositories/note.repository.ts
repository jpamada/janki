import { and, eq, isNull } from 'drizzle-orm';

import { db } from '@/db/client';
import { notes } from '@/db/schema';

export async function getNotes() {
  return db.select().from(notes).where(isNull(notes.deletedAt));
}

export async function getNotesByFolderId(folderId: string) {
  return db
    .select()
    .from(notes)
    .where(and(eq(notes.folderId, folderId), isNull(notes.deletedAt)));
}

export async function getNoteById(id: string) {
  const result = await db.select().from(notes).where(eq(notes.id, id)).limit(1);
  return result[0] ?? null;
}

export async function createNote(input: {
  id: string;
  title: string;
  content?: string;
  folderId?: string | null;
}) {
  const [note] = await db
    .insert(notes)
    .values({
      id: input.id,
      title: input.title,
      content: input.content ?? '',
      folderId: input.folderId ?? null,
      createdAt: new Date(),
    })
    .returning();

  return note;
}

export async function updateNote(
  id: string,
  input: {
    title: string;
    content: string;
  },
) {
  const [note] = await db
    .update(notes)
    .set({
      title: input.title,
      content: input.content,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id))
    .returning();

  return note;
}

export async function deleteNote(id: string) {
  const now = new Date();

  const [note] = await db
    .update(notes)
    .set({
      deletedAt: now,
      updatedAt: now,
    })
    .where(eq(notes.id, id))
    .returning();

  return note;
}
