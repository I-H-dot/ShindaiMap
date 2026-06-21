import { formatDistance, metersBetween } from "./distance";
import type { CampusName, LatLng, SourceMetadata } from "./types";

export type TransitMode = "bus" | "train";

export type TransitOperator =
  | "神戸市バス"
  | "JR"
  | "阪急電鉄"
  | "阪神電鉄"
  | "阪急電鉄・阪神電鉄"
  | "神戸市営地下鉄"
  | "ポートライナー";

export type TransitServiceDay = "weekday" | "saturday" | "holiday";

export interface TransitSchedule {
  weekday: string[];
  weekend: string[];
  saturday?: string[];
  holiday?: string[];
}

export interface GeneratedTrainTimetables {
  updatedAt: string;
  source: string;
  sourceUrlPattern: string;
  stops: Partial<Record<string, Record<string, TransitSchedule>>>;
}

export interface TransitStop extends SourceMetadata {
  id: string;
  name: string;
  mode: TransitMode;
  operator: TransitOperator;
  line: string;
  direction: string;
  campus: CampusName;
  position: LatLng;
  timetableUrl: string;
  timetableLinks?: Array<{
    label: string;
    url: string;
    direction?: string;
  }>;
  positionSourceUrl?: string;
  positionSourceName?: string;
  updatedAt?: string;
  note: string;
  schedule: TransitSchedule;
  directionSchedules?: Record<string, TransitSchedule>;
}

export interface TransitDeparture {
  time: string;
  label: string;
  direction: string;
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

export const getTransitServiceDay = (date: Date): TransitServiceDay => {
  const { weekday } = getTransitDateParts(date);
  if (weekday === "Sat") return "saturday";
  if (weekday === "Sun") return "holiday";
  return "weekday";
};

const getScheduleTimes = (schedule: TransitSchedule, serviceDay: TransitServiceDay) => {
  if (serviceDay === "saturday") return schedule.saturday || schedule.weekend;
  if (serviceDay === "holiday") return schedule.holiday || schedule.weekend;
  return schedule.weekday;
};

export const getTransitDirections = (stop: TransitStop) =>
  stop.direction
    .split("/")
    .map((direction) => direction.trim())
    .filter(Boolean);

export const getTransitTimetableLinks = (stop: TransitStop, direction?: string) => {
  const links = stop.timetableLinks || [];
  const directionLinks = direction
    ? links.filter((link) => link.direction === direction)
    : [];
  const generalLinks = links.filter((link) => !link.direction);

  if (directionLinks.length) return directionLinks;
  if (generalLinks.length) return generalLinks;

  return [{ label: "公式時刻表", url: stop.timetableUrl }];
};

export const getUpcomingDepartures = (
  stop: TransitStop,
  date: Date,
  count = 2,
  direction = stop.direction
): TransitDeparture[] => {
  const serviceDay = getTransitServiceDay(date);
  const yesterdayDate = new Date(date.getTime() - 24 * 60 * 60 * 1000);
  const tomorrowDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  const previousDay = getTransitServiceDay(yesterdayDate);
  const nextDay = getTransitServiceDay(tomorrowDate);
  const { minutes: nowMinutes } = getTransitDateParts(date);
  const schedule = stop.directionSchedules?.[direction] || stop.schedule;
  const yesterdayLateNight = getScheduleTimes(schedule, previousDay)
    .map((time) => toMinutes(time))
    .filter((minutes) => minutes >= 1440)
    .map((minutes) => minutes - 1440);
  const today = getScheduleTimes(schedule, serviceDay).map((time) => toMinutes(time));
  const tomorrow = getScheduleTimes(schedule, nextDay).map((time) => toMinutes(time) + 1440);

  return [...yesterdayLateNight, ...today, ...tomorrow]
    .filter((minutes) => minutes >= nowMinutes)
    .sort((a, b) => a - b)
    .slice(0, count)
    .map((minutes) => {
      const minutesUntil = minutes - nowMinutes;
      return {
        time: formatClock(minutes),
        label: minutesUntil === 0 ? "まもなく" : `${minutesUntil}分後`,
        direction,
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
