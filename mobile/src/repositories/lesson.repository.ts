import { and, eq, isNull } from "drizzle-orm";
import { lessons } from "@/db/schema";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getLessons() {
  const query = await db
  .select()
  .from(lessons)
  .where(
    isNull(lessons.deletedAt)
  );

  return query;
}

export async function getLessonsBySubjectId(subjectId: string) {
  const query = await db
  .select()
  .from(lessons)
  .where(
    and(
      eq(lessons.subjectId, subjectId), 
      isNull(lessons.deletedAt)
    )
  );

  return query;
}

export async function getLessonById(id: string) {
  const query = await db
  .select()
  .from(lessons)
  .where(
    and(
      eq(lessons.id, id), 
      isNull(lessons.deletedAt)
    )
  )
  .limit(1);

  return query[0];
}

export async function createLesson(
  input: {
    name: string;
    subjectId: string;
}) {
  const lessonId = Crypto.randomUUID();

  await db
  .insert(lessons)
  .values({
    id: lessonId,
    name: input.name,
    subjectId: input.subjectId,
    createdAt: new Date()
  });
};

export async function updateLesson(
  id: string,
  input: {
    name: string;
    subjectId: string;
    favorite: boolean;
}) {
  await db
  .update(lessons)
  .set({
    name: input.name,
    favorite: input.favorite,
    subjectId: input.subjectId,
    updatedAt: new Date(),
  })
  .where(
    eq(lessons.id, id)
  );
};

export async function toggleLessonFavorite(
  id: string,
  favorite: boolean,
) {
  await db
  .update(lessons)
  .set({
    favorite,
    updatedAt: new Date(),
  })
  .where(
    eq(lessons.id, id)
  );
}

export async function getFavoriteLessons() {
  const query = await db
  .select()
  .from(lessons)
  .where(
    eq(lessons.favorite, true)
  );

  return query;
}

export async function deleteLesson(id: string) {
  await db
  .delete(lessons)
  .where(
    eq(lessons.id, id)
  );
};