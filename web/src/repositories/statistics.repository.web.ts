import { webHistory } from "./web-data";

export async function getStatistics() {
  const total = webHistory.length;

  const correct = webHistory.filter(
    (item) => item.status === "correct",
  ).length;

  const incorrect = webHistory.filter(
    (item) => item.status === "incorrect",
  ).length;

  const accuracy =
    total > 0
      ? Math.round((correct / total) * 100)
      : 0;

  return {
    total,
    correct,
    incorrect,
    accuracy,
  };
}

export async function getDailyStatistics() {
  const statistics = new Map<
    string,
    {
      date: string;
      total: number;
      correct: number;
      incorrect: number;
    }
  >();

  for (const item of webHistory) {
    const date = item.attemptDate
      .toISOString()
      .slice(0, 10);

    const current = statistics.get(date) ?? {
      date,
      total: 0,
      correct: 0,
      incorrect: 0,
    };

    current.total += 1;

    if (item.status === "correct") {
      current.correct += 1;
    }

    if (item.status === "incorrect") {
      current.incorrect += 1;
    }

    statistics.set(date, current);
  }

  return Array.from(statistics.values()).sort(
    (a, b) => a.date.localeCompare(b.date),
  );
}

export async function getHeatmapData() {
  const heatmap = new Map<string, number>();

  for (const item of webHistory) {
    if (item.status !== "correct") {
      continue;
    }

    const date = item.attemptDate
      .toISOString()
      .slice(0, 10);

    heatmap.set(
      date,
      (heatmap.get(date) ?? 0) + 1,
    );
  }

  return Array.from(heatmap.entries()).map(
    ([date, count]) => ({
      date,
      count,
    }),
  );
}