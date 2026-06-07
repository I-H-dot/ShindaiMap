import { describe, expect, it } from "vitest";
import { transitStops } from "../src/data/transit";
import {
  getNearestTransitStops,
  getUpcomingDepartures,
  type TransitOperator
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
    expect(departures[0].minutesUntil).toBeGreaterThanOrEqual(0);
    expect(departures[1].minutesUntil).toBeGreaterThan(departures[0].minutesUntil);
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
