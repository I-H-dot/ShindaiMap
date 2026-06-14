import type { CampusName, Facility } from "../lib/types";
import aedLocationRecordsData from "./aedLocations.json";

interface AedLocationRecord {
  id: string;
  name: string;
  campus: CampusName;
  lat: number;
  lng: number;
  installLocation: string;
  sourceArea: string;
  matchedOfficialFacilityId?: string;
  supportsInfant?: boolean;
  outdoor?: boolean;
  positionNote?: string;
}

const aedLocationRecords = aedLocationRecordsData as AedLocationRecord[];

const SOURCE_URL =
  "https://www.kobe-u.ac.jp/sites/default/files/doc-page/2025-03/aed_all_20240324.pdf";
const SOURCE_DATE = "2025-03-24";
const UPDATED_AT = "2026-06-12";

export const aedFacilities: Facility[] = aedLocationRecords.map((record) => {
  const attributes = [
    record.supportsInfant ? "未就学児対応" : null,
    record.outdoor ? "屋外設置" : null
  ].filter((value): value is string => Boolean(value));

  return {
    id: record.id,
    name: record.name,
    category: "aed",
    campus: record.campus,
    area: record.installLocation,
    position: { lat: record.lat, lng: record.lng },
    summary: `${record.campus}のAED設置場所。`,
    description:
      `神戸大学AED設置場所一覧（${SOURCE_DATE}現在）に基づくAEDピンです。` +
      `設置場所: ${record.installLocation}。` +
      (attributes.length ? `対応情報: ${attributes.join("、")}。` : "") +
      (record.positionNote ? ` ${record.positionNote}です。` : ""),
    aliases: [
      record.name,
      "AED",
      record.installLocation,
      record.campus,
      ...(attributes.length ? attributes : [])
    ],
    tags: [
      "AED",
      "救急",
      "公式AED設置場所一覧",
      record.campus,
      ...attributes
    ],
    links: [{ label: "神戸大学AED設置場所一覧", url: SOURCE_URL }],
    sourceArea: record.sourceArea,
    updatedAt: UPDATED_AT,
    source: `Kobe University AED location list (${SOURCE_DATE})`
  };
});
