import { todayKey } from "@/constants/date";
import { logs, progress } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";

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

export async function deleteProgress() {
  await db.delete(progress);
  await db.delete(logs);
}
