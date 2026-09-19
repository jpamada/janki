import { todayKey } from "@/constants/date";
import { db } from "@/db/client";
import { progress } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function resetQuizSession(lessonId: string) {
  await db
    .delete(progress)
    .where(
      and(
        eq(progress.lessonId, lessonId),
        eq(progress.sessionDate, todayKey()),
      ),
    );
}