import type { CampusName, Facility, FacilityCategory } from "../lib/types";
import officialFacilityRecordsData from "./officialFacilities.json";

interface OfficialFacilityRecord {
  id: string;
  name: string;
  campus: CampusName;
  lat: number;
  lng: number;
  sourceArea: string;
  officialMapNumber?: string;
}

const officialFacilityRecords = officialFacilityRecordsData as OfficialFacilityRecord[];

const UPDATED_AT = "2026-06-12";

const inferCategory = (record: OfficialFacilityRecord): FacilityCategory => {
  const name = record.name.normalize("NFKC");

  if (name.includes("バス停")) return "bus";
  if (name.includes("ポスト")) return "post";
  if (name.includes("ATM") || name.includes("銀行")) return "atm";
  if (name.includes("守衛") || name.includes("門衛")) return "office";
  if (
    name.includes("食堂") ||
    name.includes("カフェ") ||
    name.includes("ショップ") ||
    name.includes("生協") ||
    name.includes("売店") ||
    name.includes("セブンイレブン") ||
    name.includes("休憩室")
  ) {
    return "food";
  }

  return "official";
};

export const officialFacilities: Facility[] = officialFacilityRecords.map((record) => {
  const category = inferCategory(record);
  const officialLabel = record.officialMapNumber
    ? `公式地図No.${record.officialMapNumber}`
    : "追加座標";
  const numberTags = record.officialMapNumber
    ? [
        record.officialMapNumber,
        `No.${record.officialMapNumber}`,
        `公式地図${record.officialMapNumber}`,
        officialLabel
      ]
    : [];

  return {
    id: record.id,
    name: record.name,
    category,
    campus: record.campus,
    area: record.campus,
    position: { lat: record.lat, lng: record.lng },
    summary: `${record.campus}の${officialLabel}に対応する施設ピン。`,
    description:
      `「${record.sourceArea}」の座標データをもとに配置したピンです。` +
      (record.officialMapNumber
        ? `神戸大学公式地図の番号${record.officialMapNumber}に対応しています。`
        : ""),
    aliases: [record.name, ...numberTags],
    tags: ["公式地図", "座標", record.campus, record.sourceArea, ...numberTags],
    sourceArea: record.sourceArea,
    updatedAt: UPDATED_AT,
    source: `ShindaiMap coordinate data / ${record.sourceArea}`,
    ...(record.officialMapNumber
      ? { officialMapNumber: record.officialMapNumber }
      : {})
  };
});
