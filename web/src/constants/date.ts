import { format } from "date-fns";

export const todayKey = () => format(new Date(), "yyyy-MM-dd");