import { eq, isNull, max } from "drizzle-orm";
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

export async function getFavoriteLessons() {
  const query = await db.query.lessons
  .findMany({
    where: eq(lessons.favorite, true),
    with: {
      subject: true,
    },
  });

  return query;
}

export async function createLesson(input: {
  name: string;
  subjectId: string;
}) {
  const lessonId = Crypto.randomUUID();

  await db.transaction(async (tx) => {
    const [query] = await tx
      .select({
        maxPosition: max(lessons.position),
      })
      .from(lessons)
      .where(
        eq(lessons.subjectId, input.subjectId)
      );

    await tx
      .insert(lessons)
      .values({
        id: lessonId,
        name: input.name,
        position: (query.maxPosition ?? -1) + 1,
        subjectId: input.subjectId,
        createdAt: new Date(),
      });
  });
}

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

export async function swapLessonPosition(
  lessonId: string,
  targetLessonId: string,
) {
  await db.transaction(async (tx) => {
    const [lesson] = await tx
      .select({ position: lessons.position })
      .from(lessons)
      .where(eq(lessons.id, lessonId));

    const [targetLesson] = await tx
      .select({ position: lessons.position })
      .from(lessons)
      .where(eq(lessons.id, targetLessonId));

    if (!lesson || !targetLesson) {
      throw new Error("Lesson not found");
    }

    await tx
      .update(lessons)
      .set({ position: targetLesson.position })
      .where(eq(lessons.id, lessonId));

    await tx
      .update(lessons)
      .set({ position: lesson.position })
      .where(eq(lessons.id, targetLessonId));
  });
}

export async function deleteLesson(id: string) {
  await db
  .delete(lessons)
  .where(
    eq(lessons.id, id)
  );
};