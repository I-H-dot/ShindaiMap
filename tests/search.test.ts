import { describe, expect, it } from "vitest";
import { categories } from "../src/data/categories";
import { facilities } from "../src/data/facilities";
import { filterFacilities } from "../src/lib/search";
import type { FacilityCategory } from "../src/lib/types";

const allCategories = new Set(categories.map((category) => category.id));

describe("facility filtering", () => {
  it("finds classrooms by alias and campus", () => {
    const results = filterFacilities(facilities, {
      query: "K棟",
      campus: "鶴甲第1",
      categories: allCategories
    });

    expect(results.some((facility) => facility.id === "tsurukabuto1-k-building")).toBe(true);
  });

  it("respects category filters", () => {
    const categories = new Set<FacilityCategory>(["toilet"]);
    const results = filterFacilities(facilities, {
      query: "",
      campus: "all",
      categories
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((facility) => facility.category === "toilet")).toBe(true);
  });
});
