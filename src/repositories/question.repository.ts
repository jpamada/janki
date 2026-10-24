import { asc, eq, isNull } from "drizzle-orm";
import { questions } from "@/db/schema";
import { db } from "@/db/client";

export async function getQuestions() {
  const query = await db
  .select()
  .from(questions)
  .where(
    isNull(questions.deletedAt)
  );

  return query;
}

export async function getQuestionsByLessonId(
  lessonId: string,
  limit: number,
  offset: number,
) {
  const query = await db
    .select()
    .from(questions)
    .where(eq(questions.lessonId, lessonId))
    .limit(limit)
    .offset(offset)
    .orderBy(asc(questions.createdAt));

  return query;
}

export async function getQuestionById(id: string) {
  const query = await db.query.questions
  .findFirst({
    where: eq(questions.id, id),
    with: {
      questionAnswers: {
        with: {
          answer: true,
        },
      },
    },
  });

  return query ?? null;
}

export async function deleteQuestion(id: string) {
  await db
  .delete(questions)
  .where(
    eq(questions.id, id)
  );
};
