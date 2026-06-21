import type {
  FacilityLink,
  SourceConfidence,
  SourceMetadata,
  SourceType
} from "../lib/types";

export interface SourceMetadataRecord {
  sourceType?: SourceType;
  sourceName?: string;
  sourceUrl?: string;
  verifiedAt?: string;
  confidence?: SourceConfidence;
  sourceNote?: string;
}

export const officialCampusSourceUrls: Record<string, string> = {
  六甲台第1キャンパス:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai1/",
  六甲台第2キャンパス:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai2/",
  鶴甲第1キャンパス:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto1/",
  鶴甲第2キャンパス:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto2/",
  楠キャンパス:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/kusunoki/campusmap/",
  楠地区キャンパスマップ:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/kusunoki/campusmap/",
  名谷キャンパス:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/myodani/campusmap/",
  名谷地区キャンパスマップ:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/myodani/campusmap/",
  深江キャンパス:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/fukae/campusmap/",
  深江地区キャンパスマップ:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/fukae/campusmap/",
  その他の地区:
    "https://www.kobe-u.ac.jp/ja/campus-life/general/access/other/"
};

export const normalizeDateOnly = (value: string) => value.slice(0, 10);

export const buildSourceMetadata = (
  record: SourceMetadataRecord | undefined,
  defaults: SourceMetadata
): SourceMetadata => {
  const sourceUrl = record?.sourceUrl ?? defaults.sourceUrl;
  const sourceNote = record?.sourceNote ?? defaults.sourceNote;

  return {
    sourceType: record?.sourceType ?? defaults.sourceType,
    sourceName: record?.sourceName ?? defaults.sourceName,
    ...(sourceUrl ? { sourceUrl } : {}),
    verifiedAt: normalizeDateOnly(record?.verifiedAt ?? defaults.verifiedAt),
    confidence: record?.confidence ?? defaults.confidence,
    ...(sourceNote ? { sourceNote } : {})
  };
};

export const toFacilitySourceFields = (
  metadata: SourceMetadata,
  options?: {
    updatedAt?: string;
    legacySource?: string;
  }
) => ({
  sourceType: metadata.sourceType,
  sourceName: metadata.sourceName,
  ...(metadata.sourceUrl ? { sourceUrl: metadata.sourceUrl } : {}),
  verifiedAt: metadata.verifiedAt,
  confidence: metadata.confidence,
  ...(metadata.sourceNote ? { sourceNote: metadata.sourceNote } : {}),
  updatedAt: normalizeDateOnly(options?.updatedAt ?? metadata.verifiedAt),
  source: options?.legacySource ?? metadata.sourceName
});

export const appendSourceLink = (
  links: FacilityLink[] | undefined,
  metadata: SourceMetadata,
  label = metadata.sourceName
) => {
  const baseLinks = links || [];
  if (
    !metadata.sourceUrl ||
    baseLinks.some((link) => link.url === metadata.sourceUrl)
  ) {
    return baseLinks;
  }

  return [...baseLinks, { label, url: metadata.sourceUrl }];
};
