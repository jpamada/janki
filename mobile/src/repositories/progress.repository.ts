import { todayKey } from "@/constants/date";
import { progress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";

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