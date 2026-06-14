import { describe, expect, it } from "vitest";
import { categories } from "../src/data/categories";
import { facilities } from "../src/data/facilities";
import { searchFacilities } from "../src/lib/search";
import type { FacilityCategory } from "../src/lib/types";

const allCategories = new Set(categories.map((category) => category.id));

describe("facility filtering", () => {
  it("finds official numbered facilities by alias and campus", () => {
    const results = searchFacilities(facilities, {
      query: "公式地図No.32",
      campus: "六甲台第1",
      categories: allCategories
    });

    expect(results.some((facility) => facility.id === "official-rokkodai-1-32")).toBe(true);
  });

  it("respects category filters", () => {
    const categories = new Set<FacilityCategory>(["stairs"]);
    const results = searchFacilities(facilities, {
      query: "",
      campus: "all",
      categories
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((facility) => facility.category === "stairs")).toBe(true);
  });

  it("uses the same fuzzy search path as the app", () => {
    const results = searchFacilities(facilities, {
      query: "バリュースクール",
      campus: "六甲台第2",
      categories: allCategories
    });

    expect(
      results.some((facility) => facility.id === "official-rokkodai-2-104")
    ).toBe(true);
  });
});
