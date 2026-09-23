import { sql, gte, and, lte, eq } from 'drizzle-orm';
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
        eq(logs.isCorrect, true),
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
  const query = await db
  .select({
    day: sql<string>`
      date(${logs.reviewedAt} / 1000, 'unixepoch', 'localtime')
    `,
    count: sql<number>`
      count(*)
    `,
  })
  .from(logs)
  .where(
    eq(logs.isCorrect, true)
  )
  .groupBy(
    sql`
      date(${logs.reviewedAt} / 1000, 'unixepoch', 'localtime')
    `
  )
  .orderBy(
    sql`
      date(${logs.reviewedAt} / 1000, 'unixepoch', 'localtime')
    `
  );

  return query;
}