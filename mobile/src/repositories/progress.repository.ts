import { todayKey } from "@/constants/date";
import { progress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function getTodayProgress(lessonId: string) {
  return db
  .select()
  .from(progress)
  .where(
    and(
      eq(progress.lessonId, lessonId),
      eq(progress.sessionDate, todayKey()),
    ),
  );
}

export async function startOrResumeQuiz(lessonId: string, allQuestionIds: string[]) {
  const date = todayKey();

  const existing = await db
  .select()
  .from(progress)
  .where(
    and(
      eq(progress.lessonId, lessonId), 
      eq(progress.sessionDate, date)
    )
  );

  const existingIds = new Set(existing.map((row) => row.questionId));
  const missingIds = allQuestionIds.filter((id) => !existingIds.has(id));

  if (missingIds.length > 0) {
    await db
    .insert(progress)
    .values(
      missingIds.map((qid) => ({
        id: Crypto.randomUUID(),
        questionId: qid,
        lessonId,
        sessionDate: date,
        status: "unanswered" as const,
      })),
    );
  }

  const allRows = [
    ...existing,
    ...missingIds.map(
      (id) => ({ 
        questionId: id, 
        status: "unanswered" as const })
    ),
  ];

  return allRows
    .filter((row) => row.status !== "correct")
    .map((row) => row.questionId);
}

export async function recordAnswer(questionId: string, correct: boolean) {
  await db
  .update(progress)
  .set({ 
    status: correct ? "correct" : "incorrect", 
    answeredAt: new Date() 
  })
  .where(
    and(
      eq(progress.questionId, questionId), 
      eq(progress.sessionDate, todayKey())
    )
  );
}