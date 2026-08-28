import { NoteContentType } from '@/constants/note-content';
import { noteContents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';

export async function getNoteContents() {
  const query = await db
  .select()
  .from(noteContents);

  return query;
}

export async function getNoteContentsByNoteSectionId(noteSectionId: string) {
  const query = await db
  .select()
  .from(noteContents)
  .where(
    eq(
      noteContents.noteSectionId, noteSectionId
    ), 
  );

  return query;
}

export async function getNoteContentById(id: string) {
  const query = await db
  .select()
  .from(noteContents)
  .where(
    eq(noteContents.id, id)
  )
  .limit(1);

  return query[0];
}

export async function createNoteContent(
  input: {
    id: string;
    title: string;
    content: string;
    noteSectionId: string;
    type: NoteContentType;
    remarks: string | null;
    position: number | null;
}) {
  await db
  .insert(noteContents)
  .values({
    id: input.id,
    title: input.title,
    noteSectionId: input.noteSectionId,
    content: input.content,
    type: input.type,
    remarks: input.remarks ?? null,
    position: input.position ?? null
  });
}

export async function updateNoteContent(
  id: string,
  input: {
    title: string;
  },
) {
  await db
  .update(noteContents)
  .set({
    title: input.title,
  })
  .where(
    eq(noteContents.id, id)
  );
};

export async function deleteNoteContent(id: string) {
  await db
  .delete(noteContents)
  .where(
    eq(noteContents.id, id)
  );
};