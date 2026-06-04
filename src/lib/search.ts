import type { CampusName, Facility, FacilityCategory, FacilityFilters } from "./types";

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKC")
    .replace(/\s+/g, "");

export const facilitySearchText = (facility: Facility) =>
  normalize(
    [
      facility.name,
      facility.campus,
      facility.area,
      facility.building,
      facility.floor,
      facility.officialMapNumber,
      facility.sourceArea,
      ...(facility.aliases || []),
      ...(facility.tags || []),
      ...(facility.roomExamples || [])
    ]
      .filter(Boolean)
      .join(" ")
  );

export const filterFacilities = (
  facilities: Facility[],
  filters: FacilityFilters
) => {
  const normalizedQuery = normalize(filters.query);

  return facilities.filter((facility) => {
    if (filters.campus !== "all" && facility.campus !== filters.campus) {
      return false;
    }

    if (!filters.categories.has(facility.category)) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return facilitySearchText(facility).includes(normalizedQuery);
  });
};

export const countFacilitiesByCategory = (
  facilities: Facility[],
  campus: CampusName | "all"
) => {
  const counts = new Map<FacilityCategory, number>();

  for (const facility of facilities) {
    if (campus !== "all" && facility.campus !== campus) continue;
    counts.set(facility.category, (counts.get(facility.category) || 0) + 1);
  }

  return counts;
};
