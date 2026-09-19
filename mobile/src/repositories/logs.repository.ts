import { differenceInCalendarDays, isToday, isYesterday, parseISO } from 'date-fns';
import { sql, gte, and, lte } from 'drizzle-orm';
import { logs } from "@/db/schema";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function logReview(
  input: { 
    questionId: string; 
    isCorrect: boolean 
}) {
  await db
  .insert(logs)
  .values({
    id: Crypto.randomUUID(),
    questionId: input.questionId,
    isCorrect: input.isCorrect,
    reviewedAt: new Date(),
  });
}

export async function getReviewHeatmapData(
  start: Date, 
  end: Date
) {
  const rows = await db
    .select({
      day: sql<string>`
        date(
          ${logs.reviewedAt} / 1000,
          'unixepoch',
          'localtime'
        )
      `,
      count: sql<number>`count(*)`,
    })
    .from(logs)
    .where(
      and(
        gte(logs.reviewedAt, start),
        lte(logs.reviewedAt, end),
      )
    )
    .groupBy(
      sql`
        date(
          ${logs.reviewedAt} / 1000,
          'unixepoch',
          'localtime'
        )
      `
    );

  return rows;
}

export async function getReviewActivityDays() {
  const rows = await db
    .select({
      day: sql<string>`date(${logs.reviewedAt} / 1000, 'unixepoch', 'localtime')`,
      count: sql<number>`count(*)`,
    })
    .from(logs)
    .groupBy(sql`date(${logs.reviewedAt} / 1000, 'unixepoch', 'localtime')`)
    .orderBy(sql`date(${logs.reviewedAt} / 1000, 'unixepoch', 'localtime')`);

  return rows;
}

export function computeReviewStats(rows: { day: string; count: number }[]) {
  if (rows.length === 0) {
    return { 
      dailyAverage: 0, 
      longestStreak: 0, 
      currentStreak: 0, 
      totalReviews: 0, 
      activeDays: 0 
    };
  }

  const totalReviews = rows.reduce((sum, row) => sum + Number(row.count), 0);
  const activeDays = rows.length;
  const dailyAverage = totalReviews / activeDays;

  let longestStreak = 1;
  let running = 1;

  for (let i = 1; i < rows.length; i++) {
    const diff = differenceInCalendarDays(parseISO(rows[i].day), parseISO(rows[i - 1].day));
    running = diff === 1 ? running + 1 : 1;
    longestStreak = Math.max(longestStreak, running);
  }

  const lastDay = parseISO(rows[rows.length - 1].day);
  let currentStreak = 0;

  if (isToday(lastDay) || isYesterday(lastDay)) {
    currentStreak = 1;
    for (let i = rows.length - 1; i > 0; i--) {
      const diff = differenceInCalendarDays(parseISO(rows[i].day), parseISO(rows[i - 1].day));
      if (diff !== 1) break;
      currentStreak += 1;
    }
  }

  return { dailyAverage, longestStreak, currentStreak, totalReviews, activeDays };
}