import { noteContents, noteSections } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { db } from '@/db/client';

export async function getNoteSections() {
  const query = await db
  .select()
  .from(noteSections);

  return query;
}

export async function getNoteSectionsByNoteId(noteId: string) {
 const sections = await db
    .select()
    .from(noteSections)
    .where(
      eq(noteSections.noteId, noteId)
    );

  const result = await Promise.all(
    sections.map(async (section) => {
      const contents = await db
        .select()
        .from(noteContents)
        .where(
          eq(noteContents.noteSectionId, section.id)
        );

      return {
        ...section,
        noteContents: contents,
      };
    }),
  );

  return result
}

export async function createNoteSection(
  input: {
    id: string;
    title: string;
    noteId: string;
}) {
  await db
  .insert(noteSections)
  .values({
    id: input.id,
    title: input.title,
    noteId: input.noteId
  });
}

export async function updateNoteSection(
  id: string,
  input: {
    title: string;
  },
) {
  await db
  .update(noteSections)
  .set({
    title: input.title,
  })
  .where(
    eq(noteSections.id, id)
  );
};

export async function deleteNoteSection(id: string) {
  await db
  .delete(noteSections)
  .where(
    eq(noteSections.id, id)
  );
};