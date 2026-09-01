import { and, eq, isNull, or } from 'drizzle-orm';
import { notes } from '@/db/schema';
import { db } from '@/db/client';

import * as Crypto from "expo-crypto";

export async function getNotes() {
  const query = await db
  .select()
  .from(notes)
  .where(
    and(
      isNull(notes.folderId),
      isNull(notes.subfolderId)
    )
  );

  return query;
}

export async function getNotesByFolderId(folderId: string) {
  const query = await db
  .select()
  .from(notes)
  .where(
    eq(notes.folderId, folderId), 
  );

  return query;
}

export async function getNotesBySubfolderId(subfolderId: string) {
  const query = await db
  .select()
  .from(notes)
  .where(
    eq(notes.subfolderId, subfolderId), 
  );

  return query;
}

export async function getNoteById(id: string) {
  return db.query.notes
  .findFirst({
    where: eq(notes.id, id),

    with: {
      contents: {
        orderBy: (contents, { asc }) => [
          asc(contents.position),
        ],
      },
    },
  });
}

export async function createNote(
  input: {
    title: string;
    folderId?: string | null;
    subfolderId?: string | null;
}) {
  const noteId = Crypto.randomUUID();
  await db
  .insert(notes)
  .values({
    id: noteId,
    title: input.title,
    folderId: input.folderId ?? null,
    subfolderId: input.subfolderId ?? null,
    createdAt: new Date(),
  });

  return {
    id: noteId,
    title: input.title
  }
}

export async function updateNote(
  id: string,
  input: {
    title: string;
    folderId?: string | null;
    subfolderId?: string | null;
}){
  await db
  .update(notes)
  .set({
    title: input.title,
    folderId: input.folderId ?? null,
    subfolderId: input.subfolderId ?? null,
    updatedAt: new Date(),
  })
  .where(
    eq(notes.id, id)
  );
}

export async function deleteNote(id: string) {
  await db
  .delete(notes)
  .where(
    eq(notes.id, id)
  );
};