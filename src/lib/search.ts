import Fuse from "fuse.js";
import type { CampusName, Facility, FacilityCategory, FacilityFilters } from "./types";

const facilitySearchKeys = [
  "name",
  "campus",
  "area",
  "aliases",
  "tags",
  "building",
  "roomExamples",
  "officialMapNumber",
  "sourceArea"
];

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

const fuzzySearchFacilities = (facilities: Facility[], query: string) => {
  const fuse = new Fuse(facilities, {
    threshold: 0.34,
    ignoreLocation: true,
    keys: facilitySearchKeys
  });

  return fuse.search(query).map((result) => result.item);
};

const queryMatches = (facility: Facility, normalizedQuery: string) =>
  facilitySearchText(facility).includes(normalizedQuery);

export const searchFacilities = (
  facilities: Facility[],
  filters: FacilityFilters
) => {
  const trimmedQuery = filters.query.trim();
  const normalizedQuery = normalize(filters.query);

  const searchedFacilities = !trimmedQuery
    ? facilities
    : [
        ...facilities.filter((facility) => queryMatches(facility, normalizedQuery)),
        ...fuzzySearchFacilities(facilities, trimmedQuery)
      ].filter(
        (facility, index, matches) =>
          matches.findIndex((candidate) => candidate.id === facility.id) === index
      );

  return searchedFacilities.filter((facility) => {
    if (filters.campus !== "all" && facility.campus !== filters.campus) {
      return false;
    }

    if (!filters.categories.has(facility.category)) {
      return false;
    }

    return true;
  });
};

export const filterFacilities = searchFacilities;

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
