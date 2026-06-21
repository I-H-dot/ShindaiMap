import { describe, expect, it } from "vitest";
import { categories } from "../src/data/categories";
import { generatedTrainTimetables } from "../src/data/generated/trainTimetables";
import { officialFacilities } from "../src/data/officialFacilities";
import { campusCenters, facilities } from "../src/data/facilities";
import { transitStops } from "../src/data/transit";
import type { FacilityCategory, SourceConfidence, SourceType } from "../src/lib/types";

const kobeUniversityBounds = {
  minLat: 34.55,
  maxLat: 34.78,
  minLng: 135.05,
  maxLng: 135.32
};

const coordinateExceptionBounds = new Map([
  [
    "official-other-1",
    {
      minLat: 35.65,
      maxLat: 35.7,
      minLng: 139.72,
      maxLng: 139.79
    }
  ]
]);

const isValidDateOnly = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const sourceTypes = new Set<SourceType>([
  "official-page",
  "official-pdf",
  "official-campus-map",
  "official-map-image",
  "official-transit",
  "generated-transit",
  "field-survey",
  "community-report"
]);

const confidenceLevels = new Set<SourceConfidence>([
  "high",
  "medium",
  "low",
  "unverified"
]);

describe("seed data", () => {
  it("has unique facility ids", () => {
    const ids = facilities.map((facility) => facility.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("defines every category used by the generated facility data", () => {
    const categoryIds = new Set(categories.map((category) => category.id));
    const usedCategoryIds = new Set(facilities.map((facility) => facility.category));

    const requiredCategories: FacilityCategory[] = [
      "aed",
      "bicycle-parking",
      "motorcycle-parking",
      "parking",
      "stairs",
      "slope",
      "post",
      "bus",
      "station",
      "food",
      "atm",
      "official",
      "office"
    ];

    for (const used of usedCategoryIds) {
      expect(categoryIds.has(used)).toBe(true);
    }

    for (const required of requiredCategories) {
      expect(categoryIds.has(required)).toBe(true);
      expect(usedCategoryIds.has(required)).toBe(true);
    }
  });

  it("keeps operational metadata and links valid", () => {
    for (const facility of facilities) {
      expect(isValidDateOnly(facility.updatedAt), `${facility.id} has an invalid updatedAt`).toBe(
        true
      );
      expect(campusCenters[facility.campus], `${facility.id} has an unknown campus`).toBeDefined();
      expect(facility.source.trim(), `${facility.id} needs a source`).not.toBe("");
      expect(sourceTypes.has(facility.sourceType), `${facility.id} has an invalid sourceType`)
        .toBe(true);
      expect(facility.sourceName.trim(), `${facility.id} needs a sourceName`).not.toBe("");
      expect(
        isValidDateOnly(facility.verifiedAt),
        `${facility.id} has an invalid verifiedAt`
      ).toBe(true);
      expect(
        confidenceLevels.has(facility.confidence),
        `${facility.id} has an invalid confidence`
      ).toBe(true);

      if (facility.sourceUrl) {
        let parsedSourceUrl: URL;
        expect(() => {
          parsedSourceUrl = new URL(facility.sourceUrl!);
        }, `${facility.id} has an invalid sourceUrl: ${facility.sourceUrl}`).not.toThrow();
        expect(
          ["http:", "https:"],
          `${facility.id} uses an unsupported sourceUrl protocol`
        ).toContain(parsedSourceUrl!.protocol);
      }

      for (const link of facility.links || []) {
        expect(link.label.trim(), `${facility.id} has an empty link label`).not.toBe("");
        let parsedUrl: URL;
        expect(() => {
          parsedUrl = new URL(link.url);
        }, `${facility.id} has an invalid URL: ${link.url}`).not.toThrow();
        expect(["http:", "https:"], `${facility.id} uses an unsupported URL protocol`).toContain(
          parsedUrl!.protocol
        );
      }
    }
  });

  it("keeps facility coordinates near the Kobe University service area", () => {
    for (const facility of facilities) {
      const bounds = coordinateExceptionBounds.get(facility.id) || kobeUniversityBounds;
      expect(facility.position.lat, `${facility.id} latitude is outside the service area`)
        .toBeGreaterThanOrEqual(bounds.minLat);
      expect(facility.position.lat, `${facility.id} latitude is outside the service area`)
        .toBeLessThanOrEqual(bounds.maxLat);
      expect(facility.position.lng, `${facility.id} longitude is outside the service area`)
        .toBeGreaterThanOrEqual(bounds.minLng);
      expect(facility.position.lng, `${facility.id} longitude is outside the service area`)
        .toBeLessThanOrEqual(bounds.maxLng);
    }
  });

  it("does not include legacy local seed-only map pins", () => {
    const unsupportedSourcePatterns = [
      "Local seed data",
      "local seed data",
      "public campus map seed",
      "map seed"
    ];

    for (const facility of facilities) {
      expect(
        unsupportedSourcePatterns.some((pattern) => facility.source.includes(pattern)),
        `${facility.id} should come from official JSON/image/AED/transit data`
      ).toBe(false);
    }
  });

  it("loads official map pins from the static coordinate data", () => {
    expect(officialFacilities).toHaveLength(161);
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

  it("covers the official numbered facilities in the requested campus maps", () => {
    const range = (start: number, end: number) =>
      Array.from({ length: end - start + 1 }, (_, index) => String(start + index));

    const expectedBySource = new Map([
      ["六甲台第1キャンパス", range(26, 42)],
      ["六甲台第2キャンパス", [...range(43, 67), "68-1", "68-2", ...range(69, 104)]],
      ["鶴甲第1キャンパス", range(10, 25)],
      ["鶴甲第2キャンパス", range(1, 9)],
      ["楠キャンパス", range(1, 14)],
      ["名谷キャンパス", range(1, 7)],
      ["深江キャンパス", range(1, 28)]
    ]);

    for (const [sourceArea, expectedNumbers] of expectedBySource) {
      const actualNumbers = officialFacilities
        .filter((facility) => facility.sourceArea === sourceArea)
        .map((facility) => facility.officialMapNumber)
        .sort((a, b) => expectedNumbers.indexOf(a || "") - expectedNumbers.indexOf(b || ""));

      expect(actualNumbers).toEqual(expectedNumbers);
    }
  });

  it("maps every generated train timetable stop to a station pin", () => {
    const generatedStopIds = Object.keys(generatedTrainTimetables.stops);
    const trainStopIds = new Set(
      transitStops
        .filter((stop) => stop.mode === "train")
        .map((stop) => stop.id)
    );
    const stationFacilities = new Map(
      facilities
        .filter((facility) => facility.category === "station")
        .map((facility) => [facility.id, facility])
    );

    for (const stopId of generatedStopIds) {
      expect(trainStopIds.has(stopId)).toBe(true);
      const facility = stationFacilities.get(`station-${stopId}`);
      expect(facility).toBeDefined();
      expect(Number.isFinite(facility?.position.lat)).toBe(true);
      expect(Number.isFinite(facility?.position.lng)).toBe(true);
      expect(facility?.links?.some((link) => link.label.includes("時刻表"))).toBe(true);
    }
  });

  it("maps every transit stop to a map pin", () => {
    const facilityIds = new Set(facilities.map((facility) => facility.id));

    for (const stop of transitStops) {
      const expectedId = stop.mode === "train" ? `station-${stop.id}` : `bus-${stop.id}`;
      expect(facilityIds.has(expectedId)).toBe(true);
    }
  });

  it("keeps source metadata on every transit stop", () => {
    for (const stop of transitStops) {
      expect(stop.sourceType, `${stop.id} needs a transit sourceType`).toBe(
        "official-transit"
      );
      expect(stop.sourceName.trim(), `${stop.id} needs a transit sourceName`).not.toBe("");
      expect(stop.sourceUrl, `${stop.id} needs a transit sourceUrl`).toBeTruthy();
      expect(isValidDateOnly(stop.verifiedAt), `${stop.id} has an invalid verifiedAt`).toBe(
        true
      );
      expect(confidenceLevels.has(stop.confidence), `${stop.id} has an invalid confidence`)
        .toBe(true);
    }
  });

  it("loads AED locations from the static coordinate data", () => {
    const aedFacilities = facilities.filter((facility) => facility.category === "aed");

    const aedCountsByCampus = new Map<string, number>();
    for (const facility of aedFacilities) {
      aedCountsByCampus.set(facility.campus, (aedCountsByCampus.get(facility.campus) || 0) + 1);
    }

    expect(aedFacilities).toHaveLength(37);
    expect(Object.fromEntries([...aedCountsByCampus.entries()].sort())).toEqual({
      六甲台第1: 5,
      六甲台第2: 13,
      名谷: 3,
      深江: 5,
      鶴甲第1: 7,
      鶴甲第2: 4
    });

    for (const facility of aedFacilities) {
      expect(facility.links?.some((link) => link.url.includes("aed_all_20240324.pdf"))).toBe(true);
      expect(Number.isFinite(facility.position.lat)).toBe(true);
      expect(Number.isFinite(facility.position.lng)).toBe(true);
      expect(facility.tags).toContain("AED");
    }
  });

  it("loads image-derived official map feature pins", () => {
    const mapFeatureFacilities = facilities.filter((facility) =>
      facility.source.includes("official campus map image")
    );
    const categories = new Set(mapFeatureFacilities.map((facility) => facility.category));

    expect(mapFeatureFacilities).toHaveLength(68);
    expect(categories.has("bicycle-parking")).toBe(true);
    expect(categories.has("motorcycle-parking")).toBe(true);
    expect(categories.has("parking")).toBe(true);
    expect(categories.has("food")).toBe(true);
    expect(categories.has("post")).toBe(true);
    expect(categories.has("atm")).toBe(true);
    expect(categories.has("stairs")).toBe(true);
    expect(categories.has("slope")).toBe(true);

    for (const facility of mapFeatureFacilities) {
      expect(Number.isFinite(facility.position.lat)).toBe(true);
      expect(Number.isFinite(facility.position.lng)).toBe(true);
      expect(facility.description).toContain("制御点RMSE");
    }
  });

  it("covers the requested map feature categories by district", () => {
    const hasCategoryInCampuses = (
      category: FacilityCategory,
      campuses: string[]
    ) =>
      facilities.some(
        (facility) => facility.category === category && campuses.includes(facility.campus)
      );

    const districtRequirements: Array<{
      label: string;
      campuses: string[];
      categories: FacilityCategory[];
    }> = [
      {
        label: "六甲台地区",
        campuses: ["六甲台第1", "六甲台第2", "鶴甲第1", "鶴甲第2"],
        categories: [
          "motorcycle-parking",
          "food",
          "post",
          "atm",
          "stairs",
          "slope",
          "office",
          "bus",
          "aed"
        ]
      },
      {
        label: "楠地区",
        campuses: ["楠"],
        categories: [
          "bicycle-parking",
          "parking",
          "food",
          "post",
          "stairs",
          "bus"
        ]
      },
      {
        label: "名谷地区",
        campuses: ["名谷"],
        categories: [
          "bus",
          "stairs",
          "slope",
          "bicycle-parking",
          "food",
          "post",
          "aed"
        ]
      },
      {
        label: "深江地区",
        campuses: ["深江"],
        categories: [
          "bus",
          "bicycle-parking",
          "office",
          "motorcycle-parking",
          "food",
          "stairs",
          "aed"
        ]
      }
    ];

    for (const requirement of districtRequirements) {
      for (const category of requirement.categories) {
        expect(
          hasCategoryInCampuses(category, requirement.campuses),
          `${requirement.label} should include ${category}`
        ).toBe(true);
      }
    }
  });

});
