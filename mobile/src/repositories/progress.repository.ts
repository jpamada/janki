import { computeNextattemptedAt, type ReviewInterval } from "@/helpers/progress.helper";
import { eq, inArray } from "drizzle-orm";
import { progress } from "@/db/schema";
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

export async function recordCorrectAnswer(
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

export async function recordIncorrectAnswer(
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
}