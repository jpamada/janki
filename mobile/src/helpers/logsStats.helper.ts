import { differenceInCalendarDays, isToday, isYesterday, parseISO } from 'date-fns';

type ReviewActivityRow = {
  day: string;
  count: number | string;
};

export type ReviewStats = {
  dailyAverage: number;
  longestStreak: number;
  currentStreak: number;
  totalReviews: number;
  activeDays: number;
};

export function computeReviewStats(
  rows: ReviewActivityRow[]
): ReviewStats {
  
  if (rows.length === 0) {
    return {
      dailyAverage: 0,
      longestStreak: 0,
      currentStreak: 0,
      totalReviews: 0,
      activeDays: 0,
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