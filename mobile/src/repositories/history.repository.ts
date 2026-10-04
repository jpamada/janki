import { sql, desc, eq, asc } from 'drizzle-orm';
import {  history } from "@/db/schema";
import { db } from "@/db/client";

import * as Crypto from "expo-crypto";

export async function createHistory(
  input: {
    answer: string;
    questionId: string;
    isCorrect: boolean;
    responseTime?: number;
}) {
  const answer = input.answer;
  const id = Crypto.randomUUID();
  const attemptedAt = new Date();
  const questionId = input.questionId;
  const responseTime = input.responseTime ?? null;
  const status = input.isCorrect ? "correct" : "incorrect";

  await db
  .insert(history)
  .values({
    id: id,
    answer: answer,
    status: status,
    questionId: questionId,
    attemptedAt: attemptedAt,
    responseTime:  responseTime,
  });
}

export async function getHistory(
  limit: number,
  offset: number,
) {
  const query = await db.query.history
  .findMany({
    with: {
      question: true
    },
    orderBy: desc(history.attemptedAt),
    limit: limit,
    offset: offset,
  })

  return query ?? [];
}


export async function getHistoryById(id: string) {
  const query = await db.query.history.findFirst({
    where: eq(history.id, id),
    with: {
      question: {
        with: {
          questionAnswers: {
            with: {
              answer: true,
            },
          },
        },
      },
    },
  });

  return query ?? null;
}

export async function getLatestHistory() {
 const query = await db.query.history
 .findMany({
    with: {
      question: {
        with: {
          questionAnswers: {
            with: {
              answer: true,
            },
          },
        },
      },
    },
    limit: 5,
    orderBy: desc(history.attemptedAt)
  });

  return query ?? null;
}

export async function getHistoryByDay(day: string) {
  const dayClause = sql<string>`
    date(
      ${history.attemptedAt} / 1000, 
      'unixepoch', 
      'localtime'
    ) = ${day}
  `;

  const query = await db.query.history
  .findMany({
    where: dayClause,
    with: {
      question: true,
    },
    orderBy: (historyTable, { asc }) => [
      asc(historyTable.attemptedAt)
    ],
  });

  return query;
}

