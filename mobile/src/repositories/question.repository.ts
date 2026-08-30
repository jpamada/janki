import { and, eq, isNull } from "drizzle-orm";
import { answers, questionAnswers, questions } from "@/db/schema";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getQuestions() {
  const query = await db
  .select()
  .from(questions)
  .where(
    isNull(questions.deletedAt)
  );

  return query;
}

export async function getQuestionsByLessonId(lessonId: string) {
  const query = await db
  .select()
  .from(questions)
  .where(
    eq(questions.lessonId, lessonId)
  );

  return query;
}

export async function getQuestionsByLessonIdWithAnswers(
  lessonId: string,
) {
  const query = db.query.questions
  .findMany({
    where: eq(questions.lessonId, lessonId),

    with: {
      questionAnswers: {
        with: {
          answer: true,
        },
      },
    },
  });

  return query;
}

export async function getQuestionById(id: string) {
  const query = db.query.questions
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

  return query;
}

export async function createQuestion(
  input: {
    id: string;
    question: string;
    lessonId: string;
}) {
  await db
  .insert(questions)
  .values({
    id: input.id,
    question: input.question,
    lessonId: input.lessonId,
    createdAt: new Date()
  });
};

export async function createQuestionWithAnswers(
  input: {
    question: string;
    lessonId: string;
    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
}): Promise<void> {
  await db.transaction(async (tx) => {
    const questionId = Crypto.randomUUID();

    await tx.insert(questions).values({
      id: questionId,
      question: input.question,
      lessonId: input.lessonId,
      createdAt: new Date(),
    });

    for (const answer of input.answers) {
      const answerId = Crypto.randomUUID();

      await tx.insert(answers).values({
        id: answerId,
        answer: answer.answer,
        lessonId: input.lessonId,
        createdAt: new Date(),
      });

      await tx.insert(questionAnswers).values({
        id: Crypto.randomUUID(),
        questionId,
        answerId,
        isCorrect: answer.isCorrect,
        createdAt: new Date(),
      });
    }
  });
}

export async function updateQuestion(
  id: string,
  input: {
    question: string;
    lessonId: string;
}) {
  await db
  .update(questions)
  .set({
    question: input.question,
    lessonId: input.lessonId,
    updatedAt: new Date(),
  })
  .where(
    eq(questions.id, id)
  );
};

export async function deleteQuestion(id: string) {
  await db
  .delete(questions)
  .where(
    eq(questions.id, id)
  );
};

export async function updateQuestionWithAnswers(
  questionId: string,
  input: {
    question: string;
    lessonId: string;
    answers: {
      answer: string;
      isCorrect: boolean;
    }[];
  }
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .update(questions)
      .set({
        question: input.question,
        lessonId: input.lessonId,
        updatedAt: new Date(),
      })
      .where(
        eq(questions.id, questionId)
      );

    const existingQuestionAnswers = await tx
      .select({
        answerId: questionAnswers.answerId,
      })
      .from(questionAnswers)
      .where(
        eq(questionAnswers.questionId, questionId)
      );

    await tx
      .delete(questionAnswers)
      .where(
        eq(questionAnswers.questionId, questionId)
      );

    for (const item of existingQuestionAnswers) {
      await tx
        .delete(answers)
        .where(
          eq(answers.id, item.answerId)
        );
    }

    for (const answer of input.answers) {
      const answerId = Crypto.randomUUID();

      await tx.insert(answers).values({
        id: answerId,
        answer: answer.answer,
        lessonId: input.lessonId,
        createdAt: new Date(),
      });

      await tx.insert(questionAnswers).values({
        id: Crypto.randomUUID(),
        questionId,
        answerId,
        isCorrect: answer.isCorrect,
        createdAt: new Date(),
      });
    }
  });
}