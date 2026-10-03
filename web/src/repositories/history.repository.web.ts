import { webHistory } from "./web-data";

export async function getHistory() {
  return [...webHistory].sort(
    (a, b) =>
      b.attemptDate.getTime() - a.attemptDate.getTime(),
  );
}

export async function getLatestHistory() {
  return [...webHistory]
    .sort(
      (a, b) =>
        b.attemptDate.getTime() - a.attemptDate.getTime(),
    )
    .slice(0, 1);
}

export async function createHistory(input: {
  questionId: string;
  isCorrect: boolean;
  responseTime?: number | null;
}) {
  const now = new Date();

  webHistory.push({
    id: `history-${Date.now()}`,
    questionId: input.questionId,
    responseTime: input.responseTime ?? null,
    attemptDate: now,
    status: input.isCorrect ? "correct" : "incorrect",
    answeredAt: now,
  });
}