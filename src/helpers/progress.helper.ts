import { addDays } from "date-fns";

export type ReviewInterval = "1_day" | "3_days" | "7_days";

export function computeNextattemptedAt(
  interval: ReviewInterval, 
  from = new Date()
): Date {

  switch (interval) {
    case "1_day":
      return addDays(from, 1);

    case "3_days":
      return addDays(from, 3);

    case "7_days":
      return addDays(from, 7);
  }
}