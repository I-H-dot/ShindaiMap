import type { CampusName, Facility, FacilityCategory } from "../lib/types";
import mapFeatureRecordsData from "./mapFeatures.json";

interface MapFeatureRecord {
  id: string;
  name: string;
  category: FacilityCategory;
  campus: CampusName;
  lat: number;
  lng: number;
  sourceArea: string;
  sourceImage: string;
  sourceImagePixel: {
    x: number;
    y: number;
  };
  transformRmseMeters: number;
  note?: string;
}

const mapFeatureRecords = mapFeatureRecordsData as MapFeatureRecord[];

const UPDATED_AT = "2026-06-13";

const categoryLabels: Partial<Record<FacilityCategory, string>> = {
  "bicycle-parking": "駐輪場",
  "motorcycle-parking": "バイク駐輪場",
  parking: "駐車場",
  stairs: "階段",
  slope: "急な傾斜道",
  food: "レストラン・食堂",
  post: "郵便ポスト",
  atm: "ATM",
  office: "守衛室・窓口"
};

export const mapFeatureFacilities: Facility[] = mapFeatureRecords.map((record) => {
  const label = categoryLabels[record.category] ?? record.category;
  const pixelLabel = `画像座標(${record.sourceImagePixel.x}, ${record.sourceImagePixel.y})`;

  return {
    id: record.id,
    name: record.name,
    category: record.category,
    campus: record.campus,
    area: record.sourceArea,
    position: { lat: record.lat, lng: record.lng },
    summary: `${record.campus}の${label}。`,
    description:
      `${record.sourceArea}の公式キャンパスマップ画像から座標変換したピンです。` +
      `元画像: ${record.sourceImage}、${pixelLabel}、制御点RMSE: ${record.transformRmseMeters}m。` +
      (record.note ? ` ${record.note}` : ""),
    aliases: [
      record.name,
      label,
      record.campus,
      record.sourceArea,
      record.sourceImage,
      pixelLabel
    ],
    tags: [
      label,
      "公式キャンパスマップ画像",
      "画像座標",
      record.campus,
      record.sourceArea
    ],
    sourceArea: record.sourceArea,
    updatedAt: UPDATED_AT,
    source: `Kobe University official campus map image / ${record.sourceImage}`
  };
});
