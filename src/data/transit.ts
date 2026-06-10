import type { CampusName } from "../lib/types";
import type { TransitStop } from "../lib/transit";

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

const transitStopSeed = [
  {
    id: "citybus-shindai-honbu-kogakubu",
    name: "神大本部工学部前",
    mode: "bus",
    operator: "神戸市バス",
    line: "36系統",
    direction: "阪神御影・JR六甲道方面 / 鶴甲団地方面",
    campus: "六甲台第2",
    position: { lat: 34.72696, lng: 135.23431 },
    timetableUrl: "https://kotsu.city.kobe.lg.jp/bus/bus-stop-list/bus-119/",
    note: "アプリ内時刻は36系統の代表的な発車間隔から作った目安です。",
    schedule: { weekday: bus36Weekday, weekend: bus36Weekend }
  },
  {
    id: "citybus-shindai-main-gate",
    name: "神大正門前",
    mode: "bus",
    operator: "神戸市バス",
    line: "36系統",
    direction: "阪神御影・JR六甲道方面 / 鶴甲団地方面",
    campus: "六甲台第1",
    position: { lat: 34.72415, lng: 135.23498 },
    timetableUrl:
      "https://www.city.kobe.lg.jp/life/access/transport/bus/jikoku/basjikoku/0360119020.html",
    note: "アプリ内時刻は36系統の代表的な発車間隔から作った目安です。",
    schedule: { weekday: bus36Weekday, weekend: bus36Weekend }
  },
  {
    id: "citybus-kokusai-bunka",
    name: "神大国際文化学研究科前",
    mode: "bus",
    operator: "神戸市バス",
    line: "16・106系統",
    direction: "阪神御影方面 / 六甲ケーブル下方面",
    campus: "鶴甲第1",
    position: { lat: 34.73009, lng: 135.22924 },
    timetableUrl: "https://kotsu.city.kobe.lg.jp/bus/bus-stop-list/bus-129/",
    note: "一部便は曜日・大学休校日で運行条件が変わります。公式時刻表を確認してください。",
    schedule: { weekday: bus16Weekday, weekend: bus16Weekend }
  },
  {
    id: "citybus-hattatsu-kagaku",
    name: "神大人間発達環境学研究科前",
    mode: "bus",
    operator: "神戸市バス",
    line: "16・106系統",
    direction: "阪神御影方面 / 六甲ケーブル下方面",
    campus: "鶴甲第2",
    position: { lat: 34.72622, lng: 135.22603 },
    timetableUrl: "https://kotsu.city.kobe.lg.jp/search-ktb/timetable/",
    note: "停留所名で検索して最新の公式時刻表を確認してください。",
    schedule: { weekday: bus16Weekday, weekend: bus16Weekend }
  },
  {
    id: "citybus-daigaku-byoin",
    name: "大学病院前",
    mode: "bus",
    operator: "神戸市バス",
    line: "9・110・112系統ほか",
    direction: "三宮・神戸駅方面",
    campus: "楠",
    position: { lat: 34.68556, lng: 135.17052 },
    timetableUrl: "https://kotsu.city.kobe.lg.jp/search-ktb/timetable/",
    note: "行先が複数あります。公式検索で目的地方面を選んでください。",
    schedule: { weekday: localBusWeekday, weekend: localBusWeekend }
  },
  {
    id: "citybus-fukae-campus",
    name: "深江駅前",
    mode: "bus",
    operator: "神戸市バス",
    line: "東灘区方面",
    direction: "阪神深江・東灘方面",
    campus: "深江",
    position: { lat: 34.72261, lng: 135.29156 },
    timetableUrl: "https://kotsu.city.kobe.lg.jp/search-ktb/timetable/",
    note: "深江キャンパス周辺のバスは便数が限られるため、鉄道も合わせて確認してください。",
    schedule: { weekday: localBusWeekday, weekend: localBusWeekend }
  },
  {
    id: "citybus-myodani",
    name: "名谷駅前",
    mode: "bus",
    operator: "神戸市バス",
    line: "15系統ほか",
    direction: "名谷駅前発着",
    campus: "名谷",
    position: { lat: 34.67935, lng: 135.09461 },
    timetableUrl:
      "https://www.city.kobe.lg.jp/life/access/transport/bus/jikoku/basjikoku/0150643020.html",
    note: "行先が複数あります。公式検索で目的地方面を選んでください。",
    schedule: { weekday: localBusWeekday, weekend: localBusWeekend }
  },
  {
    id: "jr-rokkomichi",
    name: "六甲道",
    mode: "train",
    operator: "JR",
    line: "JR神戸線",
    direction: "尼崎・大阪・京都方面 / 三ノ宮・姫路方面",
    campus: "六甲台第2",
    position: { lat: 34.71458, lng: 135.23843 },
    timetableUrl: "https://eki.jr-odekake.net/top?id=0610140",
    timetableLinks: [
      {
        label: "尼崎・大阪・京都方面",
        direction: "尼崎・大阪・京都方面",
        url: "https://timetable.jr-odekake.net/cgi-bin/mydia_sp.cgi?EID=0610140&FN=1&MD=3"
      },
      {
        label: "三ノ宮・姫路方面",
        direction: "三ノ宮・姫路方面",
        url: "https://timetable.jr-odekake.net/cgi-bin/mydia_sp.cgi?EID=0610140&FN=0&MD=3"
      }
    ],
    note: "JRおでかけネットで最新時刻表を確認できます。アプリ内には公式時刻を転載していません。",
    schedule: { weekday: jrWeekday, weekend: jrWeekend }
  },
  {
    id: "hankyu-rokko",
    name: "六甲",
    mode: "train",
    operator: "阪急電鉄",
    line: "神戸線",
    direction: "大阪梅田方面 / 神戸三宮方面",
    campus: "六甲台第1",
    position: { lat: 34.71968, lng: 135.23372 },
    timetableUrl: "https://www.hankyu.co.jp/station/rokko.html",
    timetableLinks: [
      {
        label: "大阪梅田方面 平日",
        direction: "大阪梅田方面",
        url: "https://www.hankyu.co.jp/station/html/HK-13_ko_1_w.html"
      },
      {
        label: "大阪梅田方面 土休日",
        direction: "大阪梅田方面",
        url: "https://www.hankyu.co.jp/station/html/HK-13_ko_1_h.html"
      },
      {
        label: "神戸三宮方面 平日",
        direction: "神戸三宮方面",
        url: "https://www.hankyu.co.jp/station/html/HK-13_ko_2_w.html"
      },
      {
        label: "神戸三宮方面 土休日",
        direction: "神戸三宮方面",
        url: "https://www.hankyu.co.jp/station/html/HK-13_ko_2_h.html"
      }
    ],
    note: "阪急電鉄の駅ページで最新時刻表を確認できます。アプリ内には公式時刻を転載していません。",
    schedule: { weekday: hankyuWeekday, weekend: hankyuWeekend }
  },
  {
    id: "hanshin-mikage",
    name: "御影",
    mode: "train",
    operator: "阪神電鉄",
    line: "阪神本線",
    direction: "大阪梅田方面 / 神戸三宮方面",
    campus: "六甲台第2",
    position: { lat: 34.71471, lng: 135.2555 },
    timetableUrl: "https://www.hanshin.co.jp/station/mikage.html",
    timetableLinks: [
      {
        label: "御影駅 公式時刻表",
        url: "https://www.hanshin.co.jp/station/mikage.html"
      }
    ],
    note: "阪神電鉄の駅ページで最新時刻表を確認できます。アプリ内には公式時刻を転載していません。",
    schedule: { weekday: hanshinWeekday, weekend: hanshinWeekend }
  },
  {
    id: "hanshin-fukae",
    name: "深江",
    mode: "train",
    operator: "阪神電鉄",
    line: "阪神本線",
    direction: "大阪梅田方面 / 神戸三宮方面",
    campus: "深江",
    position: { lat: 34.72252, lng: 135.29184 },
    timetableUrl: "https://www.hanshin.co.jp/station/fukae.html",
    timetableLinks: [
      {
        label: "深江駅 公式時刻表",
        url: "https://www.hanshin.co.jp/station/fukae.html"
      }
    ],
    note: "阪神電鉄の駅ページで最新時刻表を確認できます。アプリ内には公式時刻を転載していません。",
    schedule: { weekday: hanshinWeekday, weekend: hanshinWeekend }
  },
  {
    id: "subway-myodani",
    name: "名谷",
    mode: "train",
    operator: "神戸市営地下鉄",
    line: "西神・山手線",
    direction: "三宮・新神戸・谷上方面 / 西神中央方面",
    campus: "名谷",
    position: { lat: 34.67919, lng: 135.09443 },
    timetableUrl: "https://kotsu.city.kobe.lg.jp/subway/timetable1/myodani/",
    timetableLinks: [
      {
        label: "名谷駅 公式時刻表",
        url: "https://kotsu.city.kobe.lg.jp/subway/timetable1/myodani/"
      }
    ],
    note: "神戸市交通局の駅時刻表で最新時刻表を確認できます。アプリ内には公式時刻を転載していません。",
    schedule: { weekday: subwayWeekday, weekend: subwayWeekend }
  },
  {
    id: "subway-okurayama",
    name: "大倉山",
    mode: "train",
    operator: "神戸市営地下鉄",
    line: "西神・山手線",
    direction: "三宮・新神戸・谷上方面 / 西神中央方面",
    campus: "楠",
    position: { lat: 34.68404, lng: 135.1741 },
    timetableUrl: "https://kotsu.city.kobe.lg.jp/subway/timetable1/okurayama/",
    timetableLinks: [
      {
        label: "大倉山駅 公式時刻表",
        url: "https://kotsu.city.kobe.lg.jp/subway/timetable1/okurayama/"
      }
    ],
    note: "楠キャンパスは大倉山駅から徒歩圏です。アプリ内には公式時刻を転載していません。",
    schedule: { weekday: subwayWeekday, weekend: subwayWeekend }
  },
  {
    id: "portliner-minatojima",
    name: "みなとじま（キャンパス前）",
    mode: "train",
    operator: "ポートライナー",
    line: "ポートアイランド線",
    direction: "三宮方面 / 神戸空港方面",
    campus: "その他",
    position: { lat: 34.66686, lng: 135.21136 },
    timetableUrl: "https://www.knt-liner.co.jp/station/804/",
    timetableLinks: [
      {
        label: "みなとじま駅 公式時刻表",
        url: "https://www.knt-liner.co.jp/station/804/"
      }
    ],
    note: "神戸新交通の駅ページで最新時刻表を確認できます。アプリ内には公式時刻を転載していません。",
    schedule: { weekday: portlinerWeekday, weekend: portlinerWeekend }
  }
] satisfies TransitStop[];

export const transitStops: TransitStop[] = [...transitStopSeed].sort((a, b) => {
  const aPriority = campusPriority[a.campus].indexOf(a.id);
  const bPriority = campusPriority[b.campus].indexOf(b.id);
  return (aPriority === -1 ? 99 : aPriority) - (bPriority === -1 ? 99 : bPriority);
});
