import { eachDayOfInterval, format, isSameMonth } from 'date-fns';

export type ReviewHeatmapRow = {
  day: string;
  count: number | string;
};

export type HeatmapDay = {
  date: string;
  count: number;
  inMonth: boolean;
  dayNumber: number;
};

export function bucketColor(count: number, inMonth: boolean) {
  if (!inMonth) return 'transparent';
  if (count === 0) return '#f3f4f6';
  if (count >= 51) return '#196127';
  if (count >= 26) return '#239a3b';
  if (count >= 11) return '#7bc96f';
  if (count >= 1) return '#c6e48b';
}

export function computeHeatmapWeeks(
  rows: ReviewHeatmapRow[],
  gridStart: Date,
  gridEnd: Date,
  monthStart: Date,
): HeatmapDay[][] {
  const countByDay = new Map(rows.map((row) => [row.day, Number(row.count)]));

  const dates = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const days: HeatmapDay[] = dates.map((date) => {
    const key = format(date, 'yyyy-MM-dd');
    return {
      date: key,
      count: countByDay.get(key) ?? 0,
      inMonth: isSameMonth(date, monthStart),
      dayNumber: date.getDate(),
    };
  });

  const weeks: HeatmapDay[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}