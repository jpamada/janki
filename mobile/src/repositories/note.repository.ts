import { and, eq, isNull } from 'drizzle-orm';
import { notes, noteSections } from '@/db/schema';
import { db } from '@/db/client';

import * as Crypto from "expo-crypto";
import { noteSchema } from '@/schemas/note.schema';

export async function getNotes() {
  const query = await db
  .select({
    id: notes.id,
    title: notes.title,
    createdAt: notes.createdAt
  })
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
    title: string;
    folderId?: string | null;
    noteSections?: {
      title: string;
      position?: number;
    }[];
}): Promise<string> {

  const noteId = Crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(notes).values({
      id: noteId,
      title: input.title,
      folderId: input.folderId ?? null,
      createdAt: new Date(),
    });

    for (const noteSection of input.noteSections ?? []) {
      const noteSectionId = Crypto.randomUUID();
      await tx.insert(noteSections).values({
        id: noteSectionId,
        noteId: noteId,
        title: noteSection.title,
        position: noteSection.position ?? null,
      });
    }
  });

  return noteId;
}

export async function updateNote(
  id: string,
  input: {
    title: string;
    folderId?: string | null,
    noteSections?: {
      id?: string;
      title: string;
      position?: number;
    }[];
}): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.update(notes).set({
      title: input.title,
      updatedAt: new Date(),
    })
    .where(
      eq(notes.id, id)
    );

    for (const noteSection of input.noteSections ?? []) {
      if (noteSection.id) {
        await tx.update(noteSections).set({
          title: noteSection.title,
          position: noteSection.position ?? null,
        })
        .where(
          eq(noteSections.id, noteSection.id)
        );

      } else {
        await tx.insert(noteSections).values({
          id: Crypto.randomUUID(),
          noteId: id,
          title: noteSection.title,
          position: noteSection.position ?? null,
        });
      }
    }
  })
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