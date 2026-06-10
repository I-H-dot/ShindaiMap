import { describe, expect, it } from "vitest";
import { transitStops } from "../src/data/transit";
import {
  getNearestTransitStops,
  getTransitDirections,
  getTransitServiceDay,
  getTransitTimetableLinks,
  getUpcomingDepartures,
  type TransitOperator,
  type TransitStop
} from "../src/lib/transit";

describe("transit helpers", () => {
  it("covers the required bus and train operators", () => {
    const operators = new Set(transitStops.map((stop) => stop.operator));
    const requiredOperators: TransitOperator[] = [
      "神戸市バス",
      "JR",
      "阪急電鉄",
      "阪神電鉄",
      "神戸市営地下鉄",
      "ポートライナー"
    ];

    for (const operator of requiredOperators) {
      expect(operators.has(operator)).toBe(true);
    }
  });

  it("finds the nearest transit stop by current position", () => {
    const nearest = getNearestTransitStops(
      transitStops,
      { lat: 34.72695, lng: 135.23435 },
      { limit: 1 }
    );

    expect(nearest[0]?.stop.id).toBe("citybus-shindai-honbu-kogakubu");
    expect(nearest[0]?.distanceMeters).toBeLessThan(80);
  });

  it("returns first and next departures for a weekday", () => {
    const stop = transitStops.find((candidate) => candidate.id === "hankyu-rokko");
    expect(stop).toBeDefined();

    const departures = getUpcomingDepartures(
      stop!,
      new Date("2026-06-05T09:31:00+09:00"),
      2
    );

    expect(departures).toHaveLength(2);
    expect(departures[0].direction).toBe("大阪梅田・西宮北口方面 / 神戸三宮・新開地方面");
    expect(departures[0].minutesUntil).toBeGreaterThanOrEqual(0);
    expect(departures[1].minutesUntil).toBeGreaterThan(departures[0].minutesUntil);
  });

  it("splits stop directions into display labels", () => {
    const stop = transitStops.find((candidate) => candidate.id === "citybus-shindai-main-gate");
    expect(stop).toBeDefined();

    expect(getTransitDirections(stop!)).toEqual([
      "阪神御影・JR六甲道方面",
      "鶴甲団地方面"
    ]);
  });

  it("uses official JR Rokkomichi direction labels", () => {
    const stop = transitStops.find((candidate) => candidate.id === "jr-rokkomichi");
    expect(stop).toBeDefined();

    expect(getTransitDirections(stop!)).toEqual([
      "尼崎・大阪・京都方面",
      "三ノ宮・姫路方面"
    ]);
  });

  it("returns direction-specific official timetable links", () => {
    const stop = transitStops.find((candidate) => candidate.id === "hankyu-rokko");
    expect(stop).toBeDefined();

    const osakaLinks = getTransitTimetableLinks(stop!, "大阪梅田・西宮北口方面");
    const sannomiyaLinks = getTransitTimetableLinks(stop!, "神戸三宮・新開地方面");

    expect(osakaLinks.map((link) => link.label)).toEqual([
      "大阪梅田・西宮北口方面 平日",
      "大阪梅田・西宮北口方面 土休日"
    ]);
    expect(sannomiyaLinks.map((link) => link.label)).toEqual([
      "神戸三宮・新開地方面 平日",
      "神戸三宮・新開地方面 土休日"
    ]);
  });

  it("can label departures with a selected direction", () => {
    const stop = transitStops.find((candidate) => candidate.id === "citybus-shindai-main-gate");
    expect(stop).toBeDefined();

    const departures = getUpcomingDepartures(
      stop!,
      new Date("2026-06-05T09:31:00+09:00"),
      2,
      "鶴甲団地方面"
    );

    expect(departures[0].direction).toBe("鶴甲団地方面");
    expect(departures[1].direction).toBe("鶴甲団地方面");
  });

  it("uses direction-specific schedules when they are available", () => {
    const stop: TransitStop = {
      id: "test-directional-station",
      name: "方向別駅",
      mode: "train",
      operator: "阪急電鉄",
      line: "テスト線",
      direction: "東方面 / 西方面",
      campus: "六甲台第2",
      position: { lat: 34.7, lng: 135.2 },
      timetableUrl: "https://example.com",
      note: "test",
      schedule: {
        weekday: ["09:10"],
        weekend: ["09:10"]
      },
      directionSchedules: {
        東方面: {
          weekday: ["09:05"],
          weekend: ["09:15"],
          saturday: ["09:17"],
          holiday: ["09:19"]
        },
        西方面: {
          weekday: ["09:20"],
          weekend: ["09:30"],
          saturday: ["09:32"],
          holiday: ["09:34"]
        }
      }
    };

    const eastDepartures = getUpcomingDepartures(
      stop,
      new Date("2026-06-05T09:00:00+09:00"),
      1,
      "東方面"
    );
    const westDepartures = getUpcomingDepartures(
      stop,
      new Date("2026-06-05T09:00:00+09:00"),
      1,
      "西方面"
    );

    expect(eastDepartures[0].time).toBe("09:05");
    expect(westDepartures[0].time).toBe("09:20");
  });

  it("loads generated train timetables for every displayed train direction", () => {
    const trainStops = transitStops.filter((stop) => stop.mode === "train");
    expect(trainStops.length).toBeGreaterThan(0);

    for (const stop of trainStops) {
      const directions = getTransitDirections(stop);
      expect(stop.directionSchedules).toBeDefined();

      for (const direction of directions) {
        const schedule = stop.directionSchedules?.[direction];
        expect(schedule?.weekday.length).toBeGreaterThan(0);
        expect(schedule?.saturday?.length).toBeGreaterThan(0);
        expect(schedule?.holiday?.length).toBeGreaterThan(0);
      }
    }
  });

  it("returns first and next train departures from the selected generated direction", () => {
    const stop = transitStops.find((candidate) => candidate.id === "hankyu-rokko");
    expect(stop).toBeDefined();

    const direction = "神戸三宮・新開地方面";
    const departures = getUpcomingDepartures(
      stop!,
      new Date("2026-06-07T22:20:00+09:00"),
      2,
      direction
    );

    expect(departures).toHaveLength(2);
    expect(departures[0].direction).toBe(direction);
    expect(departures[0].time).toMatch(/^\d{2}:\d{2}$/);
    expect(departures[0].minutesUntil).toBeGreaterThanOrEqual(0);
    expect(departures[1].minutesUntil).toBeGreaterThan(departures[0].minutesUntil);
  });

  it("distinguishes Saturday from Sunday and holiday train schedules", () => {
    expect(getTransitServiceDay(new Date("2026-06-06T09:00:00+09:00"))).toBe(
      "saturday"
    );
    expect(getTransitServiceDay(new Date("2026-06-07T09:00:00+09:00"))).toBe(
      "holiday"
    );

    const stop: TransitStop = {
      id: "test-weekend-station",
      name: "週末駅",
      mode: "train",
      operator: "阪急電鉄",
      line: "テスト線",
      direction: "東方面",
      campus: "六甲台第2",
      position: { lat: 34.7, lng: 135.2 },
      timetableUrl: "https://example.com",
      note: "test",
      schedule: {
        weekday: ["09:05"],
        weekend: ["09:20"],
        saturday: ["09:10"],
        holiday: ["09:30"]
      }
    };

    const saturdayDepartures = getUpcomingDepartures(
      stop,
      new Date("2026-06-06T09:00:00+09:00"),
      1
    );
    const holidayDepartures = getUpcomingDepartures(
      stop,
      new Date("2026-06-07T09:00:00+09:00"),
      1
    );

    expect(saturdayDepartures[0].time).toBe("09:10");
    expect(holidayDepartures[0].time).toBe("09:30");
  });

  it("keeps late-night 24-hour timetable entries in service-day order", () => {
    const stop: TransitStop = {
      id: "test-late-night-station",
      name: "深夜駅",
      mode: "train",
      operator: "阪急電鉄",
      line: "テスト線",
      direction: "東方面",
      campus: "六甲台第2",
      position: { lat: 34.7, lng: 135.2 },
      timetableUrl: "https://example.com",
      note: "test",
      schedule: {
        weekday: ["05:00", "23:50", "24:15"],
        weekend: ["05:30", "24:30"],
        saturday: ["05:20", "24:20"],
        holiday: ["05:30", "24:30"]
      }
    };

    const beforeMidnight = getUpcomingDepartures(
      stop,
      new Date("2026-06-08T23:59:00+09:00"),
      1
    );
    const afterMidnight = getUpcomingDepartures(
      stop,
      new Date("2026-06-09T00:05:00+09:00"),
      1
    );

    expect(beforeMidnight[0].time).toBe("00:15");
    expect(beforeMidnight[0].isNextDay).toBe(true);
    expect(afterMidnight[0].time).toBe("00:15");
    expect(afterMidnight[0].minutesUntil).toBe(10);
  });

  it("rolls over to next-day departures after the last service", () => {
    const stop = transitStops.find((candidate) => candidate.id === "portliner-minatojima");
    expect(stop).toBeDefined();

    const departures = getUpcomingDepartures(
      stop!,
      new Date("2026-06-05T23:59:00+09:00"),
      2
    );

    expect(departures[0].isNextDay).toBe(true);
    expect(departures[0].minutesUntil).toBeGreaterThan(0);
  });
});
