import type { CampusName, Facility, FacilityCategory } from "../lib/types";
import mapFeatureRecordsData from "./mapFeatures.json";
import {
  appendSourceLink,
  buildSourceMetadata,
  officialCampusSourceUrls,
  toFacilitySourceFields,
  type SourceMetadataRecord
} from "./sourceMetadata";

interface MapFeatureRecord extends SourceMetadataRecord {
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

const sourceMetadataForRecord = (record: MapFeatureRecord) => {
  const sourceUrl = officialCampusSourceUrls[record.sourceArea];

  return buildSourceMetadata(record, {
    sourceType: "official-map-image",
    sourceName: `${record.sourceArea} 公式キャンパスマップ画像`,
    ...(sourceUrl ? { sourceUrl } : {}),
    verifiedAt: UPDATED_AT,
    confidence: "medium",
    sourceNote: `${record.sourceImage} の画像座標を制御点で変換した位置です。RMSE ${record.transformRmseMeters}m。`
  });
};

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
  const sourceMetadata = sourceMetadataForRecord(record);

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
    links: appendSourceLink(undefined, sourceMetadata, `${record.sourceArea} 公式ページ`),
    sourceArea: record.sourceArea,
    ...toFacilitySourceFields(sourceMetadata, {
      updatedAt: UPDATED_AT,
      legacySource: `Kobe University official campus map image / ${record.sourceImage}`
    })
  };
});
