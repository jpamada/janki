import { sql, gte, and, lte, eq } from 'drizzle-orm';
import { count } from '@/db/sql/aggregates';
import { history, lessons, questions, subjects } from "@/db/schema";
import { db } from "@/db/client";

export async function getStatistics() {
  const day = sql<string>`
    date(
      ${history.attemptedAt} / 1000, 
      'unixepoch', 
      'localtime'
    )
  `;

  const [
    statistics,
    subjectsQuery,
    lessonsQuery,
    questionsQuery,
    subjectsAccuracyQuery,
  ] = await Promise.all([
    db
    .select({
      day: day,
      count: count,
      status: history.status,
    })
    .from(history)
    .groupBy(day, history.status)
    .orderBy(day),  

    db
    .select({
      count: count,
    })
    .from(subjects),

    db
    .select({
      count: count,
    })
    .from(lessons),

    db
    .select({
      count: count,
    })
    .from(questions),

    db
    .select({
      subjectId: subjects.id,
      subjectName: subjects.name,
      correct: sql<number>`
        SUM(
          CASE
            WHEN ${history.status} = 'correct' THEN 1
            ELSE 0
          END
        )
      `,
      total: count,
    })
    .from(history)
    .innerJoin(
      questions,
      eq(history.questionId, questions.id)
    )
    .innerJoin(
      lessons,
      eq(questions.lessonId, lessons.id)
    )
    .innerJoin(
      subjects,
      eq(lessons.subjectId, subjects.id)
    )
    .groupBy(
      subjects.id,
      subjects.name
    )
    .orderBy()
  ])

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

  const subjectCount = subjectsQuery[0]?.count ?? 0;
  const lessonCount = lessonsQuery[0]?.count ?? 0;
  const questionCount = questionsQuery[0]?.count ?? 0;

  const subjectsAccuracy = subjectsAccuracyQuery
  .map((subject) => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    accuracy: subject.total > 0 ? Math.round((subject.correct / subject.total) * 100) : 0,
  }))
  .sort((a, b) => b.accuracy - a.accuracy);

  return {
    accuracy: accuracy,
    activeDays: activeDays,
    statistics: statistics,
    totalReviews: totalReviews,
    dailyAverage: dailyAverage,
    correctReviews: correctReviews,
    incorrectReviews: incorrectReviews,

    lessonCount: lessonCount,
    subjectCount: subjectCount,
    questionCount: questionCount,
    subjectsAccuracy: subjectsAccuracy ?? []
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
