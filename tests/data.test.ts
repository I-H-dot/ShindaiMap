import { describe, expect, it } from "vitest";
import { categories } from "../src/data/categories";
import { officialFacilities } from "../src/data/officialFacilities";
import { facilities } from "../src/data/facilities";
import type { FacilityCategory } from "../src/lib/types";

describe("seed data", () => {
  it("has unique facility ids", () => {
    const ids = facilities.map((facility) => facility.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers all core facility categories", () => {
    const categoryIds = new Set(categories.map((category) => category.id));
    const usedCategoryIds = new Set(facilities.map((facility) => facility.category));

    const requiredCategories: FacilityCategory[] = [
      "toilet",
      "bench",
      "learning",
      "library",
      "classroom",
      "route",
      "atm",
      "post",
      "bus"
    ];

    for (const required of requiredCategories) {
      expect(categoryIds.has(required)).toBe(true);
      expect(usedCategoryIds.has(required)).toBe(true);
    }
  });

  it("loads official map pins from the static coordinate data", () => {
    expect(officialFacilities).toHaveLength(218);
    expect(facilities.length).toBeGreaterThan(officialFacilities.length);
    expect(facilities.some((facility) => facility.category === "official")).toBe(true);

    for (const facility of officialFacilities) {
      expect(Number.isFinite(facility.position.lat)).toBe(true);
      expect(Number.isFinite(facility.position.lng)).toBe(true);
      expect(facility.position.lat).toBeGreaterThanOrEqual(-90);
      expect(facility.position.lat).toBeLessThanOrEqual(90);
      expect(facility.position.lng).toBeGreaterThanOrEqual(-180);
      expect(facility.position.lng).toBeLessThanOrEqual(180);
    }
  });

  it("uses the static coordinate and official number for matched featured places", () => {
    const socialScienceLibrary = facilities.find(
      (facility) => facility.id === "rokkodai-social-library"
    );

    expect(socialScienceLibrary?.officialMapNumber).toBe("32");
    expect(socialScienceLibrary?.position).toEqual({
      lat: 34.729193,
      lng: 135.2340875
    });
  });

});
