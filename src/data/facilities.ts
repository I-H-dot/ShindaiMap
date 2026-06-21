import type { CampusName, Facility } from "../lib/types";
import { aedFacilities } from "./aedLocations";
import { mapFeatureFacilities } from "./mapFeatures";
import { officialFacilities } from "./officialFacilities";
import { toFacilitySourceFields } from "./sourceMetadata";
import { transitStops } from "./transit";

export const campusCenters: Record<CampusName, { lat: number; lng: number; label: string }> = {
  六甲台第1: { lat: 34.72482, lng: 135.23553, label: "六甲台第1キャンパス" },
  六甲台第2: { lat: 34.72695, lng: 135.23512, label: "六甲台第2キャンパス" },
  鶴甲第1: { lat: 34.73024, lng: 135.22991, label: "鶴甲第1キャンパス" },
  鶴甲第2: { lat: 34.7264, lng: 135.22575, label: "鶴甲第2キャンパス" },
  楠: { lat: 34.68545, lng: 135.1709, label: "楠キャンパス" },
  深江: { lat: 34.71678, lng: 135.29238, label: "深江キャンパス" },
  名谷: { lat: 34.6812, lng: 135.0948, label: "名谷キャンパス" },
  その他: { lat: 34.7265, lng: 135.235, label: "その他の地区" }
};

const transitStopFacilities: Facility[] = transitStops.map((stop) => {
  const isTrain = stop.mode === "train";
  const placeLabel = isTrain ? `${stop.name}駅` : `${stop.name}バス停`;
  const positionSourceLink =
    !isTrain && stop.positionSourceUrl && stop.positionSourceUrl !== stop.timetableUrl
      ? [{ label: `${stop.name} 停留所地図`, url: stop.positionSourceUrl }]
      : [];

  const legacySource = isTrain
    ? `${stop.operator} station information and ShindaiMap train timetable data`
    : `${stop.positionSourceName || `${stop.operator} bus stop information`} and ShindaiMap representative bus timetable data`;

  return {
    id: isTrain ? `station-${stop.id}` : `bus-${stop.id}`,
    name: placeLabel,
    category: isTrain ? "station" : "bus",
    campus: stop.campus,
    area: `${stop.operator} ${stop.line}`,
    position: stop.position,
    summary: `${stop.operator} ${stop.line}の${isTrain ? "駅" : "バス停"}。`,
    description: `ShindaiMapの交通カードで時刻表を表示する交通拠点です。${stop.note}`,
    aliases: [
      stop.name,
      placeLabel,
      stop.operator,
      stop.line,
      stop.id
    ],
    tags: [
      isTrain ? "駅" : "バス停",
      isTrain ? "鉄道" : "バス",
      "時刻表",
      stop.operator,
      stop.line,
      stop.campus
    ],
    routeHint: stop.direction,
    links: [
      { label: `${stop.name} 時刻表`, url: stop.timetableUrl },
      ...positionSourceLink,
      ...(stop.timetableLinks || []).map((link) => ({
        label: link.label,
        url: link.url
      }))
    ],
    ...toFacilitySourceFields(stop, {
      updatedAt: stop.updatedAt || stop.verifiedAt,
      legacySource
    })
  };
});

export const facilities: Facility[] = [
  ...officialFacilities,
  ...aedFacilities,
  ...transitStopFacilities,
  ...mapFeatureFacilities
];

export const campusNames = Object.keys(campusCenters) as CampusName[];
