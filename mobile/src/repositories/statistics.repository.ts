import { sql, gte, and, lte } from 'drizzle-orm';
import { count } from '@/db/sql/aggregates';
import { history } from "@/db/schema";
import { db } from "@/db/client";

export async function getStatistics() {
  const day = sql<string>`
    date(
      ${history.attemptedAt} / 1000, 
      'unixepoch', 
      'localtime'
    )
  `;

  const statistics = await db
  .select({
    day: day,
    count: count,
    status: history.status,
  })
  .from(history)
  .groupBy(day, history.status)
  .orderBy(day);

  const correctReviews = statistics
  .filter((review) => review.status === "correct")
  .reduce((total, review) => total + review.count, 0);

  const incorrectReviews = statistics
  .filter((review) => review.status === "incorrect")
  .reduce((total, review) => total + review.count, 0);

  const totalReviews = statistics.reduce(
    (total, review) => total + review.count, 0
  );

  const activeDays = new Set(
    statistics.map((review) => review.day)
  ).size;

  const dailyAverage = activeDays > 0 ? totalReviews / activeDays : 0;

  const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  return {
    accuracy: accuracy,
    activeDays: activeDays,
    totalReviews: totalReviews,
    dailyAverage: dailyAverage,
    correctReviews: correctReviews,
    statistics: statistics,
    incorrectReviews: incorrectReviews,
  };
}

export async function getDailyStatistics() {
  const today = sql<string>`
    date(
      ${history.attemptedAt} / 1000,
      'unixepoch',
      'localtime'
    )
  `;

  const whereToday = sql<string>`
    ${today} = date('now', 'localtime')
  `;

  const dailyReviews = await db
    .select({
      status: history.status,
    })
    .from(history)
    .where(
      whereToday
    );

  const totalReviews = dailyReviews.length;

  const correctReviews = dailyReviews.filter(
    (review) => review.status === "correct"
  ).length;

  const accuracy = totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

  return {
    accuracy: accuracy,
    totalReviews: totalReviews,
    correctReviews: correctReviews,
  };
}

export async function getHeatmapData(
  start: Date,
  end: Date
) {
  const day = sql<string>`
    date(
      ${history.attemptedAt} / 1000,
      'unixepoch',
      'localtime'
    )
  `;

  const count = sql<number>`
    count(*)
  `;

  const rows = await db
  .select({
    day: day,
    count: count,
  })
  .from(history)
  .where(
    and(
      gte(history.attemptedAt, start),
      lte(history.attemptedAt, end),
    )
  )
  .groupBy(day);

  return rows;
}
