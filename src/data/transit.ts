import type { CampusName } from "../lib/types";
import type {
  TransitMode,
  TransitOperator,
  TransitSchedule,
  TransitStop
} from "../lib/transit";
import { generatedTrainTimetables } from "./generated/trainTimetables";
import transitStopRecordsData from "./transitStops.json";

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const toClock = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
};

const everyMinutes = (start: string, end: string, intervalMinutes: number) => {
  const times: string[] = [];
  for (
    let minute = toMinutes(start);
    minute <= toMinutes(end);
    minute += intervalMinutes
  ) {
    times.push(toClock(minute));
  }
  return times;
};

const schedule = (
  ...ranges: Array<[start: string, end: string, intervalMinutes: number]>
) => {
  const times = ranges.flatMap(([start, end, interval]) =>
    everyMinutes(start, end, interval)
  );
  return [...new Set(times)].sort((a, b) => toMinutes(a) - toMinutes(b));
};

const bus36Weekday = schedule(
  ["06:10", "08:58", 8],
  ["09:05", "15:55", 12],
  ["16:00", "19:50", 10],
  ["20:05", "22:45", 20]
);

const bus36Weekend = schedule(
  ["06:30", "08:50", 14],
  ["09:05", "18:55", 15],
  ["19:15", "22:30", 25]
);

const bus16Weekday = schedule(
  ["06:40", "08:58", 7],
  ["09:05", "14:55", 10],
  ["15:00", "19:48", 12],
  ["20:05", "22:35", 25]
);

const bus16Weekend = schedule(
  ["06:55", "09:00", 15],
  ["09:15", "18:45", 18],
  ["19:05", "22:05", 30]
);

const localBusWeekday = schedule(
  ["06:30", "09:00", 12],
  ["09:15", "16:45", 20],
  ["17:00", "20:00", 15],
  ["20:20", "22:20", 30]
);

const localBusWeekend = schedule(
  ["07:00", "09:00", 20],
  ["09:20", "18:40", 30],
  ["19:10", "21:40", 30]
);

const jrWeekday = schedule(
  ["05:25", "06:55", 10],
  ["07:00", "09:30", 6],
  ["09:38", "16:58", 8],
  ["17:05", "20:35", 7],
  ["20:45", "23:55", 12]
);

const jrWeekend = schedule(
  ["05:35", "08:35", 12],
  ["08:45", "20:45", 10],
  ["21:00", "23:50", 15]
);

const hankyuWeekday = schedule(
  ["05:20", "06:50", 12],
  ["07:00", "09:20", 8],
  ["09:30", "16:50", 10],
  ["17:00", "20:30", 8],
  ["20:40", "23:50", 12]
);

const hankyuWeekend = schedule(
  ["05:30", "08:30", 12],
  ["08:40", "20:40", 10],
  ["20:55", "23:45", 15]
);

const hanshinWeekday = schedule(
  ["05:20", "06:50", 12],
  ["07:00", "09:20", 8],
  ["09:30", "16:50", 10],
  ["17:00", "20:20", 8],
  ["20:35", "23:50", 15]
);

const hanshinWeekend = schedule(
  ["05:35", "08:35", 12],
  ["08:45", "20:45", 10],
  ["21:00", "23:45", 15]
);

const subwayWeekday = schedule(
  ["05:25", "06:55", 10],
  ["07:00", "09:10", 6],
  ["09:20", "16:50", 8],
  ["17:00", "20:20", 7],
  ["20:30", "23:45", 12]
);

const subwayWeekend = schedule(
  ["05:35", "08:35", 12],
  ["08:45", "20:45", 10],
  ["21:00", "23:40", 15]
);

const portlinerWeekday = schedule(
  ["05:25", "06:55", 8],
  ["07:00", "09:20", 5],
  ["09:27", "16:57", 7],
  ["17:05", "20:20", 6],
  ["20:30", "23:50", 10]
);

const portlinerWeekend = schedule(
  ["05:35", "08:35", 10],
  ["08:42", "20:42", 8],
  ["20:55", "23:45", 12]
);

const campusPriority: Record<CampusName, string[]> = {
  六甲台第1: ["citybus-shindai-main-gate", "hankyu-rokko"],
  六甲台第2: ["citybus-shindai-honbu-kogakubu", "hankyu-rokko"],
  鶴甲第1: ["citybus-kokusai-bunka", "hankyu-rokko"],
  鶴甲第2: ["citybus-hattatsu-kagaku", "hankyu-rokko"],
  楠: ["citybus-daigaku-byoin", "subway-okurayama"],
  深江: ["citybus-fukae-campus", "hanshin-fukae"],
  名谷: ["citybus-myodani", "subway-myodani"],
  その他: ["portliner-minatojima", "jr-rokkomichi"]
};

const trainDirectionSchedules = (stopId: string) => generatedTrainTimetables.stops[stopId];

type TransitScheduleKey =
  | "bus36"
  | "bus16"
  | "localBus"
  | "jr"
  | "hankyu"
  | "hanshin"
  | "subway"
  | "portliner";

interface TransitStopRecord {
  id: string;
  name: string;
  mode: TransitMode;
  operator: TransitOperator;
  line: string;
  direction: string;
  campus: CampusName;
  position: { lat: number; lng: number };
  timetableUrl: string;
  timetableLinks?: Array<{
    label: string;
    url: string;
    direction?: string;
  }>;
  note: string;
  scheduleKey: TransitScheduleKey;
}

const transitStopRecords = transitStopRecordsData as TransitStopRecord[];

const transitScheduleMap: Record<TransitScheduleKey, TransitSchedule> = {
  bus36: { weekday: bus36Weekday, weekend: bus36Weekend },
  bus16: { weekday: bus16Weekday, weekend: bus16Weekend },
  localBus: { weekday: localBusWeekday, weekend: localBusWeekend },
  jr: { weekday: jrWeekday, weekend: jrWeekend },
  hankyu: { weekday: hankyuWeekday, weekend: hankyuWeekend },
  hanshin: { weekday: hanshinWeekday, weekend: hanshinWeekend },
  subway: { weekday: subwayWeekday, weekend: subwayWeekend },
  portliner: { weekday: portlinerWeekday, weekend: portlinerWeekend }
};

const transitStopSeed = transitStopRecords.map((record): TransitStop => ({
  id: record.id,
  name: record.name,
  mode: record.mode,
  operator: record.operator,
  line: record.line,
  direction: record.direction,
  campus: record.campus,
  position: record.position,
  timetableUrl: record.timetableUrl,
  timetableLinks: record.timetableLinks,
  note: record.note,
  schedule: transitScheduleMap[record.scheduleKey],
  ...(record.mode === "train"
    ? { directionSchedules: trainDirectionSchedules(record.id) }
    : {})
}));

export const transitStops: TransitStop[] = [...transitStopSeed].sort((a, b) => {
  const aPriority = campusPriority[a.campus].indexOf(a.id);
  const bPriority = campusPriority[b.campus].indexOf(b.id);
  return (aPriority === -1 ? 99 : aPriority) - (bPriority === -1 ? 99 : bPriority);
});
