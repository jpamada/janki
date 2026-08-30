import { and, eq, isNull } from "drizzle-orm";
import { subjects } from "@/db/schema";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getSubjects() {
  const query = await db
  .select()
  .from(subjects);

  return query;
}

export async function getSubjectsByCategory(
  categoryId?: string | null
) {
  let query;

  if (categoryId?.trim()) {
    query = await db
    .select()
    .from(subjects)
    .where(
      eq(subjects.categoryId, categoryId)
    );

  } else {
    query = await db
    .select()
    .from(subjects)
    .where(
      isNull(subjects.categoryId)
    );
  }

  return query;
}

export async function getSubjectById(id: string) {
  const query = await db
  .select()
  .from(subjects)
  .where(
    eq(subjects.id, id)
  )
  .limit(1);

  return query[0];
}

export async function createSubject(
  input: {
    title: string;
    categoryId?: string | null;
}) {
  const subjectId = Crypto.randomUUID();

  await db
  .insert(subjects)
  .values({
    id: subjectId,
    title: input.title,
    categoryId: input.categoryId ?? null,
    createdAt: new Date()
  });
};

export async function updateSubject(
  id: string,
  input: {
    title: string;
    categoryId?: string | null;
}) {
  await db
  .update(subjects)
  .set({
    title: input.title,
    categoryId: input.categoryId ?? null,
    updatedAt: new Date(),
  })
  .where(
    eq(subjects.id, id)
  );
};

export async function deleteSubject(id: string) {
  await db
  .delete(subjects)
  .where(
    eq(subjects.id, id)
  );
};