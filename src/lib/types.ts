export type FacilityCategory =
  | "aed"
  | "bicycle-parking"
  | "motorcycle-parking"
  | "parking"
  | "stairs"
  | "slope"
  | "atm"
  | "post"
  | "bus"
  | "station"
  | "food"
  | "office"
  | "official";

export type CampusName =
  | "六甲台第1"
  | "六甲台第2"
  | "鶴甲第1"
  | "鶴甲第2"
  | "楠"
  | "深江"
  | "名谷"
  | "その他";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface CategoryDefinition {
  id: FacilityCategory;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
  icon: string;
}

export interface FacilityLink {
  label: string;
  url: string;
}

export type SourceType =
  | "official-page"
  | "official-pdf"
  | "official-campus-map"
  | "official-map-image"
  | "official-transit"
  | "generated-transit"
  | "field-survey"
  | "community-report";

export type SourceConfidence = "high" | "medium" | "low" | "unverified";

export interface SourceMetadata {
  sourceType: SourceType;
  sourceName: string;
  sourceUrl?: string;
  verifiedAt: string;
  confidence: SourceConfidence;
  sourceNote?: string;
}

export interface Facility {
  id: string;
  name: string;
  category: FacilityCategory;
  campus: CampusName;
  area: string;
  position: LatLng;
  summary: string;
  description: string;
  aliases: string[];
  tags: string[];
  building?: string;
  floor?: string;
  roomExamples?: string[];
  floorGuide?: string[];
  openHours?: string;
  amenities?: string[];
  crowdLevel?: "low" | "medium" | "high" | "varies";
  routeHint?: string;
  links?: FacilityLink[];
  officialMapNumber?: string;
  sourceArea?: string;
  updatedAt: string;
  source: string;
  sourceType: SourceType;
  sourceName: string;
  sourceUrl?: string;
  verifiedAt: string;
  confidence: SourceConfidence;
  sourceNote?: string;
}

export interface FacilityFilters {
  query: string;
  campus: CampusName | "all";
  categories: Set<FacilityCategory>;
}
