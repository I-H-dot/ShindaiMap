import type { LatLng } from "./types";

const EARTH_RADIUS_METERS = 6371000;

const toRadians = (value: number) => (value * Math.PI) / 180;

export const metersBetween = (from: LatLng, to: LatLng) => {
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const originLat = toRadians(from.lat);
  const destinationLat = toRadians(to.lat);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(deltaLng / 2) ** 2;

  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const formatDistance = (meters: number) => {
  if (!Number.isFinite(meters)) return "-";
  if (meters < 1000) return `${Math.round(meters / 10) * 10}m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 1 : 0)}km`;
};

export const estimateWalkingMinutes = (meters: number) => {
  if (!Number.isFinite(meters)) return null;
  return Math.max(1, Math.round(meters / 80));
};

export const formatWalkingTime = (meters: number) => {
  const minutes = estimateWalkingMinutes(meters);
  if (!minutes) return "-";
  if (minutes < 60) return `徒歩約${minutes}分`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `徒歩約${hours}時間${rest}分` : `徒歩約${hours}時間`;
};
