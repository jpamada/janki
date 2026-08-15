import { and, eq, isNull } from "drizzle-orm";
import { lessons } from "@/db/schema";
import { db } from "@/db/client";

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
    id: string;
    title: string;
    subjectId: string;
}) {
  await db
  .insert(lessons)
  .values({
    id: input.id,
    title: input.title,
    subjectId: input.subjectId,
    createdAt: new Date()
  });
};

export async function updateLesson(
  id: string,
  input: {
    title: string;
    subjectId: string;
}) {
  await db
  .update(lessons)
  .set({
    title: input.title,
    subjectId: input.subjectId,
    updatedAt: new Date(),
  })
  .where(
    eq(lessons.id, id)
  );
};

export async function deleteLesson(id: string) {
  await db
  .update(lessons)
  .set({
    deletedAt: new Date(),
    updatedAt: new Date(),
  })
  .where(
    eq(lessons.id, id)
  );
};