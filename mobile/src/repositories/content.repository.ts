import { contents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';

import * as Crypto from "expo-crypto";

export async function getContents() {
  const query = await db
  .select()
  .from(contents);

  return query;
}

export async function getContentsByNote(noteId: string) {
  const query = await db
  .select()
  .from(contents)
  .where(
    eq(contents.noteId, noteId), 
  );

  return query;
}

export async function getContentById(id: string) {
  const query = await db
  .select()
  .from(contents)
  .where(
    eq(contents.id, id)
  )
  .limit(1);

  return query[0] ?? null;
}

export async function createContent(
  input: {
    title: string;
    content: string;
    noteId: string;
    url?: string;
    remarks?: string;
    todo?: boolean | null;
    position?: number | null;
}) {
  const contentId = Crypto.randomUUID();
  await db
  .insert(contents)
  .values({
    id: contentId,
    title: input.title,
    noteId: input.noteId,
    content: input.content,
    url: input.url ?? "",
    todo: input.todo ?? null,
    remarks: input.remarks ?? "",
    position: input.position ?? null
  });
}

export async function updateContent(
  id: string,
  input: {
    title: string;
    content: string;
    url?: string;
    remarks?: string;
    todo?: boolean | null;
    position?: number | null;
  },
) {
  await db
  .update(contents)
  .set({
    title: input.title,
    content: input.content,
    url: input.url ?? "",
    todo: input.todo ?? null,
    remarks: input.remarks ?? "",
    position: input.position ?? null
  })
  .where(
    eq(contents.id, id)
  );
};

export async function deleteContent(id: string) {
  await db
  .delete(contents)
  .where(
    eq(contents.id, id)
  );
};