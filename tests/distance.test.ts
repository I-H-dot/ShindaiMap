import { describe, expect, it } from "vitest";
import { estimateWalkingMinutes, formatDistance, metersBetween } from "../src/lib/distance";

describe("distance helpers", () => {
  it("calculates nearby campus distances in meters", () => {
    const meters = metersBetween(
      { lat: 34.72482, lng: 135.23553 },
      { lat: 34.72492, lng: 135.23529 }
    );

    expect(meters).toBeGreaterThan(10);
    expect(meters).toBeLessThan(40);
  });

  it("formats distances and walking estimates", () => {
    expect(formatDistance(420)).toBe("420m");
    expect(formatDistance(1420)).toBe("1.4km");
    expect(estimateWalkingMinutes(800)).toBe(10);
  });
});
