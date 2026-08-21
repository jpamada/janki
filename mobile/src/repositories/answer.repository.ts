import { and, eq, isNull } from "drizzle-orm";
import { answers } from "@/db/schema";
import { db } from "@/db/client";

export async function getAnswers() {
  const query = await db
  .select()
  .from(answers);

  return query;
}

export async function getAnswersByLessonId(lessonId: string) {
  const query = await db
  .select()
  .from(answers)
  .where(
    eq(answers.lessonId, lessonId), 
  );

  return query;
}

export async function getAnswerById(id: string) {
  const query = await db
  .select()
  .from(answers)
  .where(
    eq(answers.id, id), 
  )
  .limit(1);

  return query[0];
}

export async function createAnswer(
  input: {
    id: string;
    answer: string;
    lessonId: string;
}) {
  await db
  .insert(answers)
  .values({
    id: input.id,
    answer: input.answer,
    lessonId: input.lessonId,
    createdAt: new Date()
  });
};

export async function updateAnswer(
  id: string,
  input: {
    answer: string;
    lessonId: string;
}) {
  await db
  .update(answers)
  .set({
    answer: input.answer,
    lessonId: input.lessonId,
    updatedAt: new Date(),
  })
  .where(
    eq(answers.id, id)
  );
};

export async function deleteAnswer(id: string) {
  await db
  .delete(answers)
  .where(
    eq(answers.id, id)
  );
};