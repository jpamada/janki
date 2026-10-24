import { computeNextattemptedAt, type ReviewInterval } from "@/helpers/progress.helper";
import { history, progress } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getDueQuestionIds(
  allQuestionIds: string[]
): Promise<string[]> {

  const now = new Date();

  if (allQuestionIds.length === 0) {
    return [];
  }

  const query = await db
  .select({ 
    questionId: progress.questionId, 
    nextattemptedAt: progress.nextattemptedAt 
  })
  .from(progress)
  .where(
    inArray(progress.questionId, allQuestionIds)
  );

  const progressByQuestionId = new Map(query.map(
    (progress) => [progress.questionId, progress]
  ));

  const dueQuestionIds = allQuestionIds.filter((id) => {
    const progressData = progressByQuestionId.get(id);

    if (!progressData) {
      return true; 
    }

    if (progressData.nextattemptedAt === null) {
      return true;
    }

    return progressData.nextattemptedAt.getTime() <= now.getTime();
  });

  return dueQuestionIds;
}

export async function recordCorrectAnswerProgress(
  questionId: string, 
  interval: ReviewInterval
) {
  const now = new Date();
  const nextattemptedAt = computeNextattemptedAt(interval, now);

  const existing = await db
  .select({ id: progress.id })
  .from(progress)
  .where(eq(progress.questionId, questionId));

  if (existing.length === 0) {
    await db.insert(progress).values({
      id: Crypto.randomUUID(),
      questionId,
      reviewInterval: interval,
      lastattemptedAt: now,
      nextattemptedAt: nextattemptedAt,
    });

  } else {
    await db
    .update(progress)
    .set({ 
      reviewInterval: interval, 
      lastattemptedAt: now, 
      nextattemptedAt:nextattemptedAt 
    })
    .where(eq(progress.questionId, questionId));
  }
}

export async function recordIncorrectAnswerProgress(
  questionId: string
) {
  const now = new Date();

  const existing = await db
  .select({ id: progress.id })
  .from(progress)
  .where(eq(progress.questionId, questionId));

  if (existing.length === 0) {
    await db
    .insert(progress)
    .values({
      id: Crypto.randomUUID(),
      questionId,
      reviewInterval: null,
      lastattemptedAt: now,
      nextattemptedAt: now,
    });

  } else {
    await db
    .update(progress)
    .set({ 
      lastattemptedAt: now 
    })
    .where(
      eq(progress.questionId, questionId)
    );
  }
}

export async function resetProgressForQuestions(
  questionIds: string[]
) {
  if (questionIds.length === 0) {
    return;
  }

  await db
  .update(progress)
  .set({ 
    nextattemptedAt: null 
  })
  .where(
    inArray(progress.questionId, questionIds)
  );
}

export async function deleteProgress() {
  await db
  .delete(progress);

  await db
  .delete(history);
}

type FinalizeQuizAnswerInput = {
  submissionId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  interval?: ReviewInterval;
  responseTime?: number;
};

export async function finalizeQuizAnswer(
  input: FinalizeQuizAnswerInput,
) {
  if (input.isCorrect && !input.interval) {
    throw new Error("A review interval is required for a correct answer.");
  }

  return db.transaction(async (tx) => {
    const existingHistory = await tx
      .select({ id: history.id })
      .from(history)
      .where(eq(history.id, input.submissionId))
      .limit(1);


    if (existingHistory.length > 0) {
      return { alreadyFinalized: true };
    }

    const now = new Date();

    await tx.insert(history).values({
      id: input.submissionId,
      questionId: input.questionId,
      answer: input.answer,
      responseTime: input.responseTime ?? null,
      attemptedAt: now,
      status: input.isCorrect ? "correct" : "incorrect",
    });

    const existingProgress = await tx
      .select({ id: progress.id })
      .from(progress)
      .where(eq(progress.questionId, input.questionId))
      .limit(1);

    if (input.isCorrect) {
      const interval = input.interval!;
      const nextattemptedAt = computeNextattemptedAt(interval, now);

      if (existingProgress.length === 0) {
        await tx.insert(progress).values({
          id: Crypto.randomUUID(),
          questionId: input.questionId,
          reviewInterval: interval,
          lastattemptedAt: now,
          nextattemptedAt,
        });
      } else {
        await tx
          .update(progress)
          .set({
            reviewInterval: interval,
            lastattemptedAt: now,
            nextattemptedAt,
          })
          .where(eq(progress.questionId, input.questionId));
      }
    } else if (existingProgress.length === 0) {
      await tx.insert(progress).values({
        id: Crypto.randomUUID(),
        questionId: input.questionId,
        reviewInterval: null,
        lastattemptedAt: now,
        nextattemptedAt: now,
      });
    } else {
      await tx
        .update(progress)
        .set({ lastattemptedAt: now })
        .where(eq(progress.questionId, input.questionId));
    }

    return { alreadyFinalized: false };
  });
}