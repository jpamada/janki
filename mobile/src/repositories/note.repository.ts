import { and, eq, isNull } from 'drizzle-orm';
import { noteContents, notes, noteSections } from '@/db/schema';
import { db } from '@/db/client';

import * as Crypto from "expo-crypto";
import { noteSchema } from '@/schemas/note.schema';
import { getNoteSectionsByNoteId } from './note-section.repository';

export async function getNotes() {
  const query = await db
  .select({
    id: notes.id,
    title: notes.title,
    createdAt: notes.createdAt
  })
  .from(notes)
  .where(
    isNull(notes.folderId)
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

export async function getNoteById(id: string) {
  const query = await db
  .select()
  .from(notes)
  .where(
    eq(notes.id, id)
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
      noteContents?: {
        id?: string;
        title: string;
        content: string;
        type: string;
        url?: string;
        remarks?: string;
        position?: number;
      }[];
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

      for (const noteContent of noteSection.noteContents ?? []) {
        const noteContentId = Crypto.randomUUID();
        await tx.insert(noteContents).values({
          id: noteContentId,
          noteSectionId: noteSectionId,
          title: noteContent.title,
          content: noteContent.content,
          type: noteContent.type,
          url: noteContent.url ?? null,
          remarks: noteContent.remarks ?? null,
          position: noteContent.position ?? null,
        });
      }
    }
  });

  return noteId;
}

export async function updateNote(
  id: string,
  input: {
    title: string;
    folderId?: string | null;
    noteSections?: {
      id?: string;
      title: string;
      position?: number;
      noteContents?: {
        id?: string;
        title: string;
        content: string;
        type: string;
        url?: string;
        remarks?: string;
        position?: number;
      }[];
    }[];
  }
): Promise<void> {

  await db.transaction(async (tx) => {
    await tx.update(notes).set({
      title: input.title,
      folderId: input.folderId ?? null,
      updatedAt: new Date(),
    }).where(eq(notes.id, id));

    for (const noteSection of input.noteSections ?? []) {
      let noteSectionId: string;

      if (noteSection.id) {
        noteSectionId = noteSection.id;
        await tx.update(noteSections).set({
          title: noteSection.title,
          position: noteSection.position ?? null,
        }).where(eq(noteSections.id, noteSection.id));

      } else {
        noteSectionId = Crypto.randomUUID();
        await tx.insert(noteSections).values({
          id: noteSectionId,
          noteId: id,
          title: noteSection.title,
          position: noteSection.position ?? null,
        });
      }

      for (const noteContent of noteSection.noteContents ?? []) {
        if (noteContent.id) {
          await tx.update(noteContents).set({
            title: noteContent.title,
            content: noteContent.content,
            type: noteContent.type,
            url: noteContent.url ?? null,
            remarks: noteContent.remarks ?? null,
            position: noteContent.position ?? null,
          }).where(eq(noteContents.id, noteContent.id));

        } else {
          await tx.insert(noteContents).values({
            id: Crypto.randomUUID(),
            noteSectionId,
            title: noteContent.title,
            content: noteContent.content,
            type: noteContent.type,
            url: noteContent.url ?? null,
            remarks: noteContent.remarks ?? null,
            position: noteContent.position ?? null,
          });
        }
      }
    }
  });
}

export async function deleteNote(id: string) {
  await db
  .delete(notes)
  .where(
    eq(notes.id, id)
  );
};

export async function getAllNotesForBackup() {
  const noteRows = await db
    .select()
    .from(notes);

  const result = await Promise.all(
    noteRows.map(async (note) => {
      const sections = await getNoteSectionsByNoteId(note.id);

      return {
        ...note,
        noteSections: sections,
      };
    })
  );

  return result;
}