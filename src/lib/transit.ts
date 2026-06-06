import { formatDistance, metersBetween } from "./distance";
import type { CampusName, LatLng } from "./types";

export type TransitMode = "bus" | "train";

export type TransitOperator =
  | "神戸市バス"
  | "JR"
  | "阪急電鉄"
  | "阪神電鉄"
  | "神戸市営地下鉄"
  | "ポートライナー";

export interface TransitStop {
  id: string;
  name: string;
  mode: TransitMode;
  operator: TransitOperator;
  line: string;
  direction: string;
  campus: CampusName;
  position: LatLng;
  timetableUrl: string;
  note: string;
  schedule: {
    weekday: string[];
    weekend: string[];
  };
}

export interface TransitDeparture {
  time: string;
  label: string;
  minutesUntil: number;
  isNextDay: boolean;
}

export interface TransitStopDistance {
  stop: TransitStop;
  distanceMeters: number;
}

const TRANSIT_TIME_ZONE = "Asia/Tokyo";
const transitDateFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TRANSIT_TIME_ZONE,
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23"
});

const getTransitDateParts = (date: Date) => {
  const parts = Object.fromEntries(
    transitDateFormatter.formatToParts(date).map((part) => [part.type, part.value])
  );
  return {
    weekday: parts.weekday,
    minutes: Number(parts.hour) * 60 + Number(parts.minute)
  };
};

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const formatClock = (minutes: number) => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  const hour = Math.floor(normalized / 60);
  const minute = normalized % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

export const getTransitServiceDay = (date: Date) => {
  const { weekday } = getTransitDateParts(date);
  return weekday === "Sat" || weekday === "Sun" ? "weekend" : "weekday";
};

export const getUpcomingDepartures = (
  stop: TransitStop,
  date: Date,
  count = 2
): TransitDeparture[] => {
  const serviceDay = getTransitServiceDay(date);
  const tomorrowDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const nextDay = getTransitServiceDay(tomorrowDate);
  const { minutes: nowMinutes } = getTransitDateParts(date);
  const today = stop.schedule[serviceDay].map((time) => toMinutes(time));
  const tomorrow = stop.schedule[nextDay].map((time) => toMinutes(time) + 1440);

  return [...today, ...tomorrow]
    .filter((minutes) => minutes >= nowMinutes)
    .slice(0, count)
    .map((minutes) => {
      const minutesUntil = minutes - nowMinutes;
      return {
        time: formatClock(minutes),
        label: minutesUntil === 0 ? "まもなく" : `${minutesUntil}分後`,
        minutesUntil,
        isNextDay: minutes >= 1440
      };
    });
};

export const getNearestTransitStops = (
  stops: TransitStop[],
  position: LatLng,
  options?: { mode?: TransitMode; campus?: CampusName; limit?: number }
): TransitStopDistance[] => {
  const limit = options?.limit ?? 3;
  return stops
    .filter((stop) => {
      if (options?.mode && stop.mode !== options.mode) return false;
      if (options?.campus && stop.campus !== options.campus) return false;
      return true;
    })
    .map((stop) => ({
      stop,
      distanceMeters: metersBetween(position, stop.position)
    }))
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, limit);
};

export const formatStopDistance = (distanceMeters: number) =>
  distanceMeters < 120 ? "すぐ近く" : formatDistance(distanceMeters);
