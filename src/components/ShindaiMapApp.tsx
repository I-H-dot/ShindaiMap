import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faBicycle,
  faBook,
  faBookOpen,
  faBuilding,
  faBus,
  faCircleQuestion,
  faCompass,
  faCouch,
  faCrosshairs,
  faEnvelope,
  faFilter,
  faHeartPulse,
  faLayerGroup,
  faLocationArrow,
  faMagnifyingGlass,
  faMapPin,
  faMotorcycle,
  faPaperPlane,
  faPlay,
  faRoute,
  faShareNodes,
  faSquareParking,
  faStairs,
  faStop,
  faTrain,
  faTriangleExclamation,
  faUniversalAccess,
  faUtensils,
  faVolumeHigh,
  faVolumeXmark,
  faYenSign
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { categoryMap } from "../data/categories";
import { transitStops } from "../data/transit";
import { formatDistance, formatWalkingTime, metersBetween } from "../lib/distance";
import {
  formatStopDistance,
  getTransitDirections,
  getTransitTimetableLinks,
  getNearestTransitStops,
  getUpcomingDepartures,
  type TransitMode,
  type TransitStopDistance
} from "../lib/transit";
import type {
  CampusName,
  CategoryDefinition,
  Facility,
  FacilityCategory,
  LatLng
} from "../lib/types";
import { countFacilitiesByCategory, searchFacilities } from "../lib/search";
import { withBasePath } from "../lib/urls";
import UiTuneKit from "./UiTuneKit";

type MobilePanelState = "expanded" | "closed";

interface Props {
  initialFacilities: Facility[];
  categories: CategoryDefinition[];
  campusCenters: Record<CampusName, { lat: number; lng: number; label: string }>;
}

interface RouteInfo {
  distanceText: string;
  durationText: string;
  mode: "google" | "estimate";
}

interface NavigationStep {
  instruction: string;
  distanceText: string;
  durationText: string;
  endLocation: LatLng;
}

interface NavigationState {
  active: boolean;
  destinationName: string;
  statusText: string;
  distanceText: string;
  durationText: string;
  nextInstruction: string;
  offRoute: boolean;
  recalculating: boolean;
}

interface TouchStartState {
  x: number;
  y: number;
  scrollTop: number;
}

interface PointerStartState extends TouchStartState {
  pointerId: number;
}

type DeviceOrientationEventWithCompass = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
};

type DeviceOrientationEventConstructorWithPermission = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<PermissionState>;
};

type LegacyMarkerOptions = {
  map: google.maps.Map;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  title: string;
  icon: google.maps.Icon | google.maps.Symbol;
  label?: string | google.maps.MarkerLabel;
  zIndex: number;
};

type LegacyMarker = google.maps.MVCObject & {
  setMap(map: google.maps.Map | null): void;
  setPosition(position: google.maps.LatLng | google.maps.LatLngLiteral): void;
  setIcon(icon: google.maps.Icon | google.maps.Symbol | string | null): void;
  setZIndex(zIndex: number | null): void;
};

type LegacyDirectionsRenderer = google.maps.MVCObject & {
  setDirections(directions: google.maps.DirectionsResult): void;
  setMap(map: google.maps.Map | null): void;
};

type LegacyDirectionsService = {
  route(
    request: google.maps.DirectionsRequest,
    callback: (
      result: google.maps.DirectionsResult | null,
      status: google.maps.DirectionsStatus
    ) => void
  ): void;
};

// Keep legacy Maps constructors behind one typed boundary until route rendering moves to Routes API.
const getLegacyMapsApi = () =>
  google.maps as unknown as {
    Marker: new (options: LegacyMarkerOptions) => LegacyMarker;
    DirectionsRenderer: new (options: {
      suppressMarkers: boolean;
      preserveViewport: boolean;
    }) => LegacyDirectionsRenderer;
    DirectionsService: new () => LegacyDirectionsService;
  };

const icons: Record<string, IconDefinition> = {
  accessibility: faUniversalAccess,
  "heart-pulse": faHeartPulse,
  bicycle: faBicycle,
  motorcycle: faMotorcycle,
  armchair: faCouch,
  "book-open": faBookOpen,
  library: faBook,
  "building-2": faBuilding,
  route: faRoute,
  "square-parking": faSquareParking,
  stairs: faStairs,
  "triangle-exclamation": faTriangleExclamation,
  "badge-yen": faYenSign,
  mailbox: faEnvelope,
  bus: faBus,
  train: faTrain,
  utensils: faUtensils,
  "circle-help": faCircleQuestion,
  "map-pin": faMapPin
};

const getCategory = (category: FacilityCategory) => categoryMap.get(category);

const categoryColor = (facility: Facility) =>
  getCategory(facility.category)?.color || "#2563eb";

const isMobileViewport = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 620px)").matches;

const INITIAL_MAP_ZOOM = 16;
const FOCUSED_FACILITY_ZOOM = 18;
const MAP_FIT_BOUNDS_PADDING = 58;
const OFF_ROUTE_THRESHOLD_METERS = 45;
const STEP_ARRIVAL_THRESHOLD_METERS = 24;
const DESTINATION_ARRIVAL_THRESHOLD_METERS = 28;
const REROUTE_COOLDOWN_MS = 12000;
const NAVIGATION_CAMERA_ZOOM = 19;
const MIN_HEADING_MOVE_METERS = 3;

const cleanRouteInstruction = (instruction: string) => {
  if (typeof document === "undefined") {
    return instruction.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }

  const element = document.createElement("div");
  element.innerHTML = instruction;
  return element.textContent?.replace(/\s+/g, " ").trim() || "道なりに進む";
};

const toProjectedMeters = (point: LatLng, origin: LatLng) => {
  const averageLat = ((point.lat + origin.lat) / 2) * (Math.PI / 180);
  return {
    x: (point.lng - origin.lng) * 111320 * Math.cos(averageLat),
    y: (point.lat - origin.lat) * 110540
  };
};

const distanceToSegmentMeters = (point: LatLng, start: LatLng, end: LatLng) => {
  const projectedPoint = toProjectedMeters(point, start);
  const projectedEnd = toProjectedMeters(end, start);
  const segmentLengthSquared =
    projectedEnd.x * projectedEnd.x + projectedEnd.y * projectedEnd.y;

  if (segmentLengthSquared === 0) {
    return metersBetween(point, start);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      (projectedPoint.x * projectedEnd.x + projectedPoint.y * projectedEnd.y) /
        segmentLengthSquared
    )
  );
  const closest = {
    x: projectedEnd.x * t,
    y: projectedEnd.y * t
  };
  return Math.hypot(projectedPoint.x - closest.x, projectedPoint.y - closest.y);
};

const distanceToRoutePathMeters = (point: LatLng, path: LatLng[]) => {
  if (path.length === 0) return Number.POSITIVE_INFINITY;
  if (path.length === 1) return metersBetween(point, path[0]);

  let shortest = Number.POSITIVE_INFINITY;
  for (let index = 1; index < path.length; index += 1) {
    shortest = Math.min(
      shortest,
      distanceToSegmentMeters(point, path[index - 1], path[index])
    );
  }
  return shortest;
};

const normalizeHeading = (heading: number) => ((heading % 360) + 360) % 360;

const isUsableHeading = (heading: number | null | undefined): heading is number =>
  typeof heading === "number" && Number.isFinite(heading) && heading >= 0;

const getBearingDegrees = (from: LatLng, to: LatLng) => {
  const fromLat = (from.lat * Math.PI) / 180;
  const toLat = (to.lat * Math.PI) / 180;
  const deltaLng = ((to.lng - from.lng) * Math.PI) / 180;
  const y = Math.sin(deltaLng) * Math.cos(toLat);
  const x =
    Math.cos(fromLat) * Math.sin(toLat) -
    Math.sin(fromLat) * Math.cos(toLat) * Math.cos(deltaLng);

  return normalizeHeading((Math.atan2(y, x) * 180) / Math.PI);
};

const transitModeLabel = (mode: TransitMode) => (mode === "bus" ? "バス" : "電車");

interface TransitDepartureCardProps {
  title: string;
  stopDistance: TransitStopDistance | null;
  now: Date | null;
  statusText?: string;
  className?: string;
  modeOptions?: Array<{
    mode: TransitMode;
    label: string;
    stopDistance: TransitStopDistance | null;
  }>;
  selectedMode?: TransitMode;
  onModeChange?: (mode: TransitMode) => void;
}

const TransitDepartureCard = ({
  title,
  stopDistance,
  now,
  statusText,
  className = "",
  modeOptions,
  selectedMode,
  onModeChange
}: TransitDepartureCardProps) => {
  const [selectedDirections, setSelectedDirections] = useState<Record<string, string>>({});

  const activeModeOption =
    modeOptions?.find((option) => option.mode === selectedMode && option.stopDistance) ||
    modeOptions?.find((option) => option.stopDistance);
  const activeStopDistance = activeModeOption?.stopDistance || stopDistance;

  if (!activeStopDistance || !now) return null;

  const { stop, distanceMeters } = activeStopDistance;
  const directions = getTransitDirections(stop);
  const selectedDirection = selectedDirections[stop.id];
  const activeDirection =
    selectedDirection && directions.includes(selectedDirection)
      ? selectedDirection
      : directions[0] || stop.direction;
  const departures = getUpcomingDepartures(stop, now, 2, activeDirection);
  const icon = stop.mode === "bus" ? faBus : faTrain;
  const canShowDepartures =
    stop.mode !== "train" || Boolean(stop.directionSchedules?.[activeDirection]);
  const officialLinks = getTransitTimetableLinks(stop, activeDirection);
  const primaryOfficialLink = officialLinks[0] || {
    label: "公式時刻表",
    url: stop.timetableUrl
  };

  return (
    <section className={`transit-card ${className}`} aria-label={title}>
      <div className="transit-card-heading">
        <div>
          <p>{title}</p>
          <h2>
            <FontAwesomeIcon icon={icon} />
            {stop.name}
          </h2>
        </div>
        {modeOptions && onModeChange ? (
          <div className="transit-mode-switch" aria-label="時刻表の種類">
            {modeOptions.map((option) => (
              <button
                key={option.mode}
                type="button"
                className={option.mode === activeModeOption?.mode ? "is-active" : ""}
                aria-pressed={option.mode === activeModeOption?.mode}
                disabled={!option.stopDistance}
                onClick={() => onModeChange(option.mode)}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : (
          <span>{formatStopDistance(distanceMeters)}</span>
        )}
      </div>
      <div className="transit-operator-line">
        {stop.operator} {stop.line}
      </div>
      <div className="transit-direction-list" aria-label="方面">
        {directions.map((direction) => (
          <button
            key={direction}
            className={direction === activeDirection ? "is-active" : ""}
            type="button"
            aria-pressed={direction === activeDirection}
            onClick={() =>
              setSelectedDirections((currentDirections) => ({
                ...currentDirections,
                [stop.id]: direction
              }))
            }
          >
            {direction}
          </button>
        ))}
      </div>
      {canShowDepartures ? (
        <div className="departure-grid">
          {departures.map((departure, index) => (
            <div key={`${stop.id}-${departure.time}-${index}`} className="departure-item">
              <span>{index === 0 ? "先発" : "次発"}</span>
              <strong>{departure.time}</strong>
              <small className="departure-direction">{departure.direction}</small>
              <small>
                {departure.label}
                {departure.isNextDay ? "・翌日" : ""}
              </small>
            </div>
          ))}
        </div>
      ) : (
        <div className="transit-official-only">
          <strong>{activeDirection}の公式時刻表で確認してください</strong>
          <span>鉄道の発車時刻は月次取得データがある方面だけアプリ内に表示します。</span>
          <div className="transit-official-link-list">
            {officialLinks.map((link) => (
              <a key={`${stop.id}-${link.label}`} href={link.url} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
      <div className="transit-card-footer">
        <span>
          {transitModeLabel(stop.mode)} / {statusText || "現在地から最寄りを表示"}
        </span>
        <a href={primaryOfficialLink.url} target="_blank" rel="noreferrer">
          {primaryOfficialLink.label}
        </a>
      </div>
    </section>
  );
};

interface CampusTransitRowProps {
  title: string;
  stopDistance: TransitStopDistance | null;
  now: Date | null;
}

const CampusTransitRow = ({ title, stopDistance, now }: CampusTransitRowProps) => {
  const [selectedDirections, setSelectedDirections] = useState<Record<string, string>>({});

  if (!stopDistance || !now) return null;

  const { stop, distanceMeters } = stopDistance;
  const directions = getTransitDirections(stop);
  const selectedDirection = selectedDirections[stop.id];
  const activeDirection =
    selectedDirection && directions.includes(selectedDirection)
      ? selectedDirection
      : directions[0] || stop.direction;
  const departures = getUpcomingDepartures(stop, now, 2, activeDirection);
  const icon = stop.mode === "bus" ? faBus : faTrain;
  const canShowDepartures =
    stop.mode !== "train" || Boolean(stop.directionSchedules?.[activeDirection]);
  const officialLinks = getTransitTimetableLinks(stop, activeDirection);
  const primaryOfficialLink = officialLinks[0] || {
    label: "公式時刻表",
    url: stop.timetableUrl
  };

  return (
    <div className="campus-transit-row">
      <div className="campus-transit-main">
        <FontAwesomeIcon icon={icon} />
        <div>
          <strong>
            {title}: {stop.name}
          </strong>
          <span>
            {stop.operator} {stop.line} / {formatStopDistance(distanceMeters)}
          </span>
          <div className="campus-transit-direction-list" aria-label="方面">
            {directions.map((direction) => (
              <button
                key={direction}
                className={direction === activeDirection ? "is-active" : ""}
                type="button"
                aria-pressed={direction === activeDirection}
                onClick={() =>
                  setSelectedDirections((currentDirections) => ({
                    ...currentDirections,
                    [stop.id]: direction
                  }))
                }
              >
                {direction}
              </button>
            ))}
          </div>
        </div>
      </div>
      {canShowDepartures ? (
        <div className="campus-transit-times">
          {departures.map((departure, index) => (
            <span key={`${stop.id}-${departure.time}-${index}`}>
              <strong>
                {index === 0 ? "先発" : "次発"} {departure.time}
              </strong>
              <small>{departure.direction}</small>
            </span>
          ))}
        </div>
      ) : (
        <p className="campus-transit-official-only">
          {activeDirection}の取得済み時刻がないため、公式時刻表で確認してください。
        </p>
      )}
      <a href={primaryOfficialLink.url} target="_blank" rel="noreferrer">
        {primaryOfficialLink.label}
      </a>
    </div>
  );
};

const getCoordinateBounds = (positions: LatLng[]) => {
  const lats = positions.map((position) => position.lat);
  const lngs = positions.map((position) => position.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latPad = Math.max((maxLat - minLat) * 0.22, 0.001);
  const lngPad = Math.max((maxLng - minLng) * 0.22, 0.001);

  return {
    minLat: minLat - latPad,
    maxLat: maxLat + latPad,
    minLng: minLng - lngPad,
    maxLng: maxLng + lngPad
  };
};

const getFallbackPointPosition = (position: LatLng, referencePositions: LatLng[]) => {
  const bounds = getCoordinateBounds(
    referencePositions.length > 0 ? referencePositions : [position]
  );
  const left =
    ((position.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 86 + 7;
  const top =
    (1 - (position.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 82 +
    9;

  return {
    left: `${Math.max(4, Math.min(96, left))}%`,
    top: `${Math.max(4, Math.min(96, top))}%`
  };
};

const getFallbackPosition = (facility: Facility, facilities: Facility[]) => {
  return getFallbackPointPosition(
    facility.position,
    facilities.map((item) => item.position)
  );
};

const isCampusViewportFacility = (facility: Facility) => {
  const { lat, lng } = facility.position;
  return lat >= 34.55 && lat <= 34.78 && lng >= 135.05 && lng <= 135.32;
};

const LOCATION_REQUEST_OPTIONS: PositionOptions[] = [
  { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 },
  { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
];

const LOCATION_WATCH_TIMEOUT_MS = 10000;
const GEOLOCATION_ERROR_CODES = {
  permissionDenied: 1,
  positionUnavailable: 2,
  timeout: 3
} as const;

const geolocationErrorCode = (error: unknown) => {
  if (!error || typeof error !== "object" || !("code" in error)) return null;
  const code = Number((error as GeolocationPositionError).code);
  return Number.isFinite(code) ? code : null;
};

const isPermissionDeniedError = (error: unknown) =>
  geolocationErrorCode(error) === GEOLOCATION_ERROR_CODES.permissionDenied;

const toLatLng = (position: GeolocationPosition): LatLng => ({
  lat: position.coords.latitude,
  lng: position.coords.longitude
});

const getGeolocationPosition = (options: PositionOptions) =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });

const watchGeolocationPositionOnce = (options: PositionOptions) =>
  new Promise<GeolocationPosition>((resolve, reject) => {
    let lastError: unknown = null;
    let settled = false;
    let watchId: number | null = null;
    let timeoutId: number | null = null;
    const cleanup = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(position);
      },
      (error) => {
        lastError = error;
        if (!isPermissionDeniedError(error)) return;

        settled = true;
        cleanup();
        reject(error);
      },
      options
    );

    timeoutId = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(lastError || new Error("Timed out while watching current position"));
    }, LOCATION_WATCH_TIMEOUT_MS);
  });

const getBestEffortGeolocationPosition = async () => {
  let lastError: unknown = null;

  for (const options of LOCATION_REQUEST_OPTIONS) {
    try {
      return await getGeolocationPosition(options);
    } catch (error) {
      lastError = error;
      if (isPermissionDeniedError(error)) throw error;
    }
  }

  try {
    return await watchGeolocationPositionOnce(LOCATION_REQUEST_OPTIONS[1]);
  } catch (error) {
    throw lastError || error;
  }
};

const currentLocationErrorMessage = (error: unknown) => {
  const code = geolocationErrorCode(error);

  if (code === GEOLOCATION_ERROR_CODES.permissionDenied) {
    return "位置情報が許可されていません";
  }

  if (code === GEOLOCATION_ERROR_CODES.positionUnavailable) {
    return "現在地を特定できませんでした。macOSの位置情報サービスとWi-Fiを確認してください";
  }

  if (code === GEOLOCATION_ERROR_CODES.timeout) {
    return "現在地の取得がタイムアウトしました。少し待ってから再試行してください";
  }

  return "現在地を取得できませんでした";
};

export default function ShindaiMapApp({
  initialFacilities,
  categories,
  campusCenters
}: Props) {
  const allCategoryIds = useMemo(
    () => categories.map((category) => category.id),
    [categories]
  );
  const facilities = initialFacilities;
  const [query, setQuery] = useState("");
  const [campus, setCampus] = useState<CampusName | "all">("all");
  const [selectedCategories, setSelectedCategories] = useState(
    () => new Set<FacilityCategory>(allCategoryIds)
  );
  const [selectedId, setSelectedId] = useState("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [navigationState, setNavigationState] = useState<NavigationState | null>(null);
  const [navigationHeading, setNavigationHeading] = useState<number | null>(null);
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(true);
  const [transitPosition, setTransitPosition] = useState<LatLng | null>(null);
  const [currentLocationVisible, setCurrentLocationVisible] = useState(false);
  const [transitStatusText, setTransitStatusText] =
    useState("現在地から最寄りを確認中");
  const [desktopTransitMode, setDesktopTransitMode] = useState<TransitMode>("bus");
  const [now, setNow] = useState<Date | null>(null);
  const [mapMessage, setMapMessage] = useState("Google Maps APIキーを確認中");
  const [googleMapReady, setGoogleMapReady] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [mobilePanelState, setMobilePanelState] =
    useState<MobilePanelState>("expanded");
  const [isMobileViewportActive, setIsMobileViewportActive] = useState(false);
  const [urlStateReady, setUrlStateReady] = useState(false);
  const isMobilePanelClosed = isMobileViewportActive && mobilePanelState === "closed";

  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const selectedPanelTouchRef = useRef<TouchStartState | null>(null);
  const selectedPanelPointerRef = useRef<PointerStartState | null>(null);
  const selectedPanelRef = useRef<HTMLElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<LegacyDirectionsRenderer | null>(null);
  const markersByIdRef = useRef<Map<string, LegacyMarker>>(new Map());
  const currentLocationMarkerRef = useRef<LegacyMarker | null>(null);
  const navigationWatchIdRef = useRef<number | null>(null);
  const navigationDestinationRef = useRef<Facility | null>(null);
  const navigationRoutePathRef = useRef<LatLng[]>([]);
  const navigationStepsRef = useRef<NavigationStep[]>([]);
  const routePreviewOriginRef = useRef<LatLng | null>(null);
  const lastKnownNavigationPositionRef = useRef<LatLng | null>(null);
  const deviceHeadingRef = useRef<number | null>(null);
  const activeNavigationStepIndexRef = useRef(0);
  const navigationRequestIdRef = useRef(0);
  const selectedFacilityIdRef = useRef(selectedId);
  const lastRerouteAtRef = useRef(0);
  const lastSpokenInstructionRef = useRef("");
  const shouldFocusSelectedPanelRef = useRef(false);
  const voiceGuidanceEnabledRef = useRef(true);

  const focusSelectedPanel = () => {
    if (typeof window === "undefined" || isMobileViewport()) return;

    window.requestAnimationFrame(() => {
      const panel = selectedPanelRef.current;
      if (!panel) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      panel.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
      panel.focus({ preventScroll: true });
    });
  };

  const campusNames = useMemo(
    () => Object.keys(campusCenters) as CampusName[],
    [campusCenters]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get("query");
    const campusParam = params.get("campus");
    const categoryParam = params.get("category");
    const facilityId = params.get("facility");

    if (queryParam !== null) {
      setQuery(queryParam);
    }

    if (campusParam === "all" || campusNames.includes(campusParam as CampusName)) {
      setCampus(campusParam as CampusName | "all");
    }

    if (categoryParam) {
      const categoryIds = categoryParam
        .split(",")
        .filter((id): id is FacilityCategory => categoryMap.has(id as FacilityCategory));
      if (categoryIds.length > 0) {
        setSelectedCategories(new Set(categoryIds));
      }
    }

    if (facilityId && facilities.some((facility) => facility.id === facilityId)) {
      setSelectedId(facilityId);
    }

    setUrlStateReady(true);
  }, [campusNames, facilities]);

  useEffect(() => {
    voiceGuidanceEnabledRef.current = voiceGuidanceEnabled;
  }, [voiceGuidanceEnabled]);

  useEffect(() => {
    const syncNow = () => {
      setNow(new Date());
    };
    syncNow();
    const timer = window.setInterval(syncNow, 30000);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setTransitStatusText("現在地を使えないため選択キャンパス基準");
      return;
    }

    let alive = true;

    const syncCurrentPosition = async () => {
      try {
        const position = await getBestEffortGeolocationPosition();
        if (!alive) return;

        updateCurrentLocationMarker(toLatLng(position));
        setTransitStatusText("現在地から最寄りを表示");
      } catch {
        if (alive) {
          setTransitStatusText("現在地未取得のため選択キャンパス基準");
        }
      }
    };

    void syncCurrentPosition();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (navigationWatchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(navigationWatchIdRef.current);
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!navigationState?.active || typeof window === "undefined") return;
    if (!("DeviceOrientationEvent" in window)) return;

    const handleOrientation = (event: Event) => {
      const heading = extractDeviceHeading(event as DeviceOrientationEventWithCompass);
      if (!isUsableHeading(heading)) return;

      const normalizedHeading = normalizeHeading(heading);
      deviceHeadingRef.current = normalizedHeading;
      setNavigationHeading(normalizedHeading);

      if (lastKnownNavigationPositionRef.current) {
        applyNavigationCamera(lastKnownNavigationPositionRef.current, normalizedHeading);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    window.addEventListener("deviceorientationabsolute", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("deviceorientationabsolute", handleOrientation);
    };
  }, [navigationState?.active]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 620px)");
    const syncMobileViewport = () => {
      setIsMobileViewportActive(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setMobilePanelState("expanded");
      }
    };

    syncMobileViewport();
    mediaQuery.addEventListener("change", syncMobileViewport);
    return () => {
      mediaQuery.removeEventListener("change", syncMobileViewport);
    };
  }, []);

  const filteredFacilities = useMemo(
    () =>
      searchFacilities(facilities, {
        query,
        campus,
        categories: selectedCategories
      }),
    [campus, facilities, query, selectedCategories]
  );

  const selectedFacility =
    filteredFacilities.find((facility) => facility.id === selectedId) ||
    filteredFacilities[0] ||
    null;

  useEffect(() => {
    selectedFacilityIdRef.current = selectedFacility?.id || "";
  }, [selectedFacility?.id]);

  useEffect(() => {
    if (!selectedFacility || !shouldFocusSelectedPanelRef.current) return;

    shouldFocusSelectedPanelRef.current = false;
    focusSelectedPanel();
  }, [selectedFacility?.id]);

  const mapFacilities = useMemo(() => {
    return filteredFacilities;
  }, [filteredFacilities]);

  const mapBoundsFacilities = useMemo(() => {
    const localFacilities = mapFacilities.filter(isCampusViewportFacility);
    return localFacilities.length > 0 ? localFacilities : mapFacilities;
  }, [mapFacilities]);

  const countsByCategory = useMemo(
    () => countFacilitiesByCategory(facilities, campus),
    [campus, facilities]
  );

  const categoryOptions = useMemo(
    () => categories.filter((category) => (countsByCategory.get(category.id) || 0) > 0),
    [categories, countsByCategory]
  );

  const filteredCountsByCategory = useMemo(
    () => countFacilitiesByCategory(filteredFacilities, "all"),
    [filteredFacilities]
  );

  const visibleCategorySummary = useMemo(() => {
    const summaries = categories
      .map((category) => ({
        category,
        count: filteredCountsByCategory.get(category.id) || 0
      }))
      .filter(({ count }) => count > 0)
      .sort(
        (a, b) =>
          b.count - a.count || a.category.label.localeCompare(b.category.label, "ja")
      )
      .slice(0, 3)
      .map(({ category, count }) => `${category.shortLabel}${count}件`);

    return summaries.join("、");
  }, [categories, filteredCountsByCategory]);

  const resultSummaryText =
    filteredFacilities.length === 0
      ? "表示中: 0件"
      : `表示中: ${filteredFacilities.length}件${
          visibleCategorySummary ? `、${visibleCategorySummary}` : ""
        }`;

  useEffect(() => {
    if (!urlStateReady) return;

    const url = new URL(window.location.href);
    const trimmedQuery = query.trim();
    const allCategoriesSelected =
      selectedCategories.size === allCategoryIds.length &&
      allCategoryIds.every((categoryId) => selectedCategories.has(categoryId));

    if (trimmedQuery) {
      url.searchParams.set("query", trimmedQuery);
    } else {
      url.searchParams.delete("query");
    }

    if (campus === "all") {
      url.searchParams.delete("campus");
    } else {
      url.searchParams.set("campus", campus);
    }

    if (allCategoriesSelected) {
      url.searchParams.delete("category");
    } else {
      const categoryIds = allCategoryIds.filter((categoryId) =>
        selectedCategories.has(categoryId)
      );
      if (categoryIds.length > 0) {
        url.searchParams.set("category", categoryIds.join(","));
      } else {
        url.searchParams.delete("category");
      }
    }

    if (selectedId && facilities.some((facility) => facility.id === selectedId)) {
      url.searchParams.set("facility", selectedId);
    } else {
      url.searchParams.delete("facility");
    }

    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (nextUrl !== currentUrl) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [
    allCategoryIds,
    campus,
    facilities,
    query,
    selectedCategories,
    selectedId,
    urlStateReady
  ]);

  const focusMapOnFacility = (facility: Facility, zoom = FOCUSED_FACILITY_ZOOM) => {
    const map = googleMapRef.current;
    if (!map) return;

    map.panTo(facility.position);
    map.setZoom(Math.max(map.getZoom() || zoom, zoom));
  };

  const getMarkerIcon = (facility: Facility, isSelected: boolean) => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: categoryColor(facility),
    fillOpacity: 0.94,
    strokeColor: "#ffffff",
    strokeWeight: isSelected ? 4 : 2,
    scale: isSelected ? 11 : 8
  });

  const selectFacility = (
    facility: Facility,
    options?: { zoomMap?: boolean; focusPanel?: boolean }
  ) => {
    setSelectedId(facility.id);
    setRouteInfo(null);
    stopNavigation({ silent: true });
    setMobileMenuOpen(false);
    setMobilePanelState("expanded");
    if (options?.focusPanel) {
      shouldFocusSelectedPanelRef.current = true;
      focusSelectedPanel();
    }
    if (options?.zoomMap) {
      focusMapOnFacility(facility);
    }
  };

  const toggleMobilePanel = () => {
    setMobilePanelState((state) => (state === "expanded" ? "closed" : "expanded"));
  };

  const applyMobilePanelSwipe = (
    start: TouchStartState,
    clientX: number,
    clientY: number
  ) => {
    const deltaY = clientY - start.y;
    const deltaX = clientX - start.x;
    const isVerticalSwipe = Math.abs(deltaY) > 48 && Math.abs(deltaY) > Math.abs(deltaX);
    if (!isVerticalSwipe) return;

    if (deltaY < 0) {
      setMobilePanelState("expanded");
      return;
    }

    if (start.scrollTop <= 4) {
      setMobilePanelState("closed");
    }
  };

  const handleMobilePanelTouchStart = (event: React.TouchEvent<HTMLElement>) => {
    if (!isMobileViewport()) return;
    if (event.touches.length !== 1) return;

    const touch = event.touches[0];
    selectedPanelTouchRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      scrollTop: event.currentTarget.scrollTop
    };
  };

  const handleMobilePanelTouchMove = (event: React.TouchEvent<HTMLElement>) => {
    if (!isMobileViewport()) return;
    const start = selectedPanelTouchRef.current;
    if (!start || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const deltaY = touch.clientY - start.y;
    const deltaX = touch.clientX - start.x;

    if (
      deltaY > 0 &&
      Math.abs(deltaY) > Math.abs(deltaX) &&
      event.currentTarget.scrollTop <= 0 &&
      event.nativeEvent.cancelable
    ) {
      event.preventDefault();
    }
  };

  const handleMobilePanelTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    const start = selectedPanelTouchRef.current;
    selectedPanelTouchRef.current = null;
    if (!isMobileViewport()) return;
    if (!start || event.changedTouches.length !== 1) return;

    const touch = event.changedTouches[0];
    applyMobilePanelSwipe(start, touch.clientX, touch.clientY);
  };

  const handleMobilePanelPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!isMobileViewport() || event.pointerType === "touch") return;

    event.currentTarget.setPointerCapture(event.pointerId);
    selectedPanelPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      scrollTop: event.currentTarget.scrollTop,
      pointerId: event.pointerId
    };
  };

  const handleMobilePanelPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (!isMobileViewport() || event.pointerType === "touch") return;

    const start = selectedPanelPointerRef.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const deltaY = event.clientY - start.y;
    const deltaX = event.clientX - start.x;
    if (
      deltaY > 0 &&
      Math.abs(deltaY) > Math.abs(deltaX) &&
      event.currentTarget.scrollTop <= 0 &&
      event.nativeEvent.cancelable
    ) {
      event.preventDefault();
    }
  };

  const handleMobilePanelPointerUp = (event: React.PointerEvent<HTMLElement>) => {
    const start = selectedPanelPointerRef.current;
    selectedPanelPointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!isMobileViewport() || event.pointerType === "touch") return;
    if (!start || start.pointerId !== event.pointerId) return;

    applyMobilePanelSwipe(start, event.clientX, event.clientY);
  };

  const handleMobilePanelPointerCancel = (event: React.PointerEvent<HTMLElement>) => {
    selectedPanelPointerRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const showCurrentLocationOnMap = async () => {
    if (!navigator.geolocation) {
      setMapMessage("現在地を取得できないブラウザです");
      return;
    }

    setMapMessage("現在地を取得中");

    try {
      const position = await getBestEffortGeolocationPosition();
      const displayedOnGoogleMap = updateCurrentLocationMarker(toLatLng(position), {
        panMap: true
      });
      setMapMessage(
        displayedOnGoogleMap ? "現在地を表示中" : "ローカル用地図で現在地を表示中"
      );
    } catch (error) {
      if (transitPosition && !isPermissionDeniedError(error)) {
        const displayedOnGoogleMap = updateCurrentLocationMarker(transitPosition, {
          panMap: true
        });
        setMapMessage(
          displayedOnGoogleMap
            ? "直近の現在地を表示中（現在地を更新できませんでした）"
            : "ローカル用地図で直近の現在地を表示中"
        );
        return;
      }

      setMapMessage(currentLocationErrorMessage(error));
    }
  };

  useEffect(() => {
    const apiKey = import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

    if (!apiKey) {
      setMapMessage("Google Maps APIキー未設定のため、ローカル用地図で表示中");
      return;
    }

    if (!mapElementRef.current || googleMapRef.current) return;

    let alive = true;
    import("@googlemaps/js-api-loader")
      .then(({ importLibrary, setOptions }) => {
        setOptions({
          key: apiKey,
          v: "weekly"
        });
        return Promise.all([
          importLibrary("maps"),
          importLibrary("marker"),
          importLibrary("routes")
        ]);
      })
      .then(() => {
        if (!alive || !mapElementRef.current) return;

        const center = campusCenters["六甲台第2"];
        const map = new google.maps.Map(mapElementRef.current, {
          center,
          zoom: INITIAL_MAP_ZOOM,
          clickableIcons: false,
          fullscreenControl: false,
          mapTypeControl: false,
          streetViewControl: false,
          gestureHandling: "greedy",
          styles: [
            {
              featureType: "poi.business",
              stylers: [{ visibility: "off" }]
            },
            {
              featureType: "transit",
              elementType: "labels.icon",
              stylers: [{ saturation: -20 }]
            }
          ]
        });

        googleMapRef.current = map;
        const legacyMaps = getLegacyMapsApi();
        directionsRendererRef.current = new legacyMaps.DirectionsRenderer({
          suppressMarkers: false,
          preserveViewport: false
        });
        directionsRendererRef.current.setMap(map);
        setGoogleMapReady(true);
        setMapMessage("Google Mapsで表示中");
      })
      .catch(() => {
        setGoogleMapReady(false);
        setMapMessage("Google Mapsを読み込めないため、ローカル用地図で表示中");
      });

    return () => {
      alive = false;
    };
  }, [campusCenters]);

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>(".map-shell");
    if (!shell) return;

    let touchStart: Pick<TouchStartState, "x" | "y"> | null = null;

    const findScrollContainer = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      return target.closest<HTMLElement>(".selected-card, .result-list, .sidebar");
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStart = null;
      if (!isMobileViewport()) return;
      if (event.touches.length !== 1) return;

      const target = event.target;
      if (!(target instanceof Node) || !shell.contains(target)) return;
      if (target instanceof Element && target.closest(".google-map")) return;

      touchStart = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isMobileViewport()) return;
      if (!touchStart) return;
      if (!event.cancelable || event.touches.length !== 1) return;

      const target = event.target;
      if (!(target instanceof Node) || !shell.contains(target)) return;
      if (target instanceof Element && target.closest(".google-map")) return;

      const touch = event.touches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      if (deltaY <= 0 || Math.abs(deltaY) <= Math.abs(deltaX)) return;

      const scrollContainer = findScrollContainer(target);
      const scrollContainerCanMove =
        scrollContainer &&
        scrollContainer.scrollHeight > scrollContainer.clientHeight &&
        scrollContainer.scrollTop > 0;

      if (!scrollContainerCanMove && window.scrollY <= 0) {
        event.preventDefault();
      }
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  const previousBoundsKeyRef = useRef("");
  const hasInitializedDefaultViewportRef = useRef(false);

  useEffect(() => {
    if (!googleMapReady) return;

    const map = googleMapRef.current;
    if (!map || typeof google === "undefined") return;

    const bounds = new google.maps.LatLngBounds();
    for (const facility of mapBoundsFacilities) {
      bounds.extend(facility.position);
    }

    const mapFacilityIds = new Set(mapFacilities.map((facility) => facility.id));

    for (const [facilityId, marker] of markersByIdRef.current) {
      if (!mapFacilityIds.has(facilityId)) {
        marker.setMap(null);
        markersByIdRef.current.delete(facilityId);
      }
    }

    for (const facility of mapFacilities) {
      if (markersByIdRef.current.has(facility.id)) {
        continue;
      }

      const legacyMaps = getLegacyMapsApi();
      const marker = new legacyMaps.Marker({
        map,
        position: facility.position,
        title: facility.name,
        icon: getMarkerIcon(facility, facility.id === selectedFacility?.id),
        label: facility.officialMapNumber
          ? {
              text: facility.officialMapNumber,
              color: "#ffffff",
              fontSize: facility.officialMapNumber.length > 2 ? "9px" : "10px",
              fontWeight: "800"
            }
          : undefined,
        zIndex: facility.id === selectedFacility?.id ? 2 : 1
      });

      marker.addListener("click", () => {
        selectFacility(facility, { zoomMap: true });
      });

      markersByIdRef.current.set(facility.id, marker);
    }

    const boundsKey = mapBoundsFacilities.map((facility) => facility.id).join("|");
    if (previousBoundsKeyRef.current === boundsKey) return;

    previousBoundsKeyRef.current = boundsKey;

    const isDefaultViewport =
      campus === "all" &&
      selectedCategories.size === allCategoryIds.length &&
      !query.trim();

    if (!hasInitializedDefaultViewportRef.current) {
      hasInitializedDefaultViewportRef.current = true;

      if (isDefaultViewport) {
        if (selectedFacility) {
          map.setCenter(selectedFacility.position);
        }
        map.setZoom(INITIAL_MAP_ZOOM);
        return;
      }
    }

    if (mapBoundsFacilities.length === 1) {
      map.setCenter(mapBoundsFacilities[0].position);
      map.setZoom(FOCUSED_FACILITY_ZOOM);
    } else if (mapBoundsFacilities.length > 1) {
      map.fitBounds(bounds, MAP_FIT_BOUNDS_PADDING);
    }
  }, [
    allCategoryIds.length,
    campus,
    googleMapReady,
    mapBoundsFacilities,
    mapFacilities,
    query,
    selectedCategories,
    selectedFacility
  ]);

  useEffect(() => {
    if (typeof google === "undefined") return;

    for (const facility of mapFacilities) {
      const marker = markersByIdRef.current.get(facility.id);
      if (!marker) continue;
      const isSelected = facility.id === selectedFacility?.id;
      marker.setIcon(getMarkerIcon(facility, isSelected));
      marker.setZIndex(isSelected ? 2 : 1);
    }
  }, [mapFacilities, selectedFacility?.id]);

  useEffect(() => {
    if (!selectedFacility || !googleMapRef.current) return;
    googleMapRef.current.panTo(selectedFacility.position);
  }, [selectedFacility]);

  const showAllCategories = () => {
    setSelectedCategories(new Set(allCategoryIds));
  };

  const showOnlyCategory = (category: FacilityCategory) => {
    setSelectedCategories(new Set([category]));
  };

  const clearRenderedDirections = () => {
    directionsRendererRef.current?.set("directions", null);
  };

  const createNavigationRequest = () => {
    navigationRequestIdRef.current += 1;
    return navigationRequestIdRef.current;
  };

  const isNavigationRequestCurrent = (requestId: number, destination: Facility) =>
    navigationRequestIdRef.current === requestId &&
    selectedFacilityIdRef.current === destination.id;

  const stopNavigation = (options?: { keepPanel?: boolean; silent?: boolean }) => {
    createNavigationRequest();
    setRouteLoading(false);

    if (navigationWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(navigationWatchIdRef.current);
      navigationWatchIdRef.current = null;
    }

    navigationDestinationRef.current = null;
    navigationRoutePathRef.current = [];
    navigationStepsRef.current = [];
    routePreviewOriginRef.current = null;
    lastKnownNavigationPositionRef.current = null;
    deviceHeadingRef.current = null;
    activeNavigationStepIndexRef.current = 0;
    lastSpokenInstructionRef.current = "";

    if (!options?.keepPanel) {
      setNavigationState(null);
      setNavigationHeading(null);
      clearRenderedDirections();
      googleMapRef.current?.setHeading(0);
      googleMapRef.current?.setTilt(0);
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };

  const estimateRoute = (origin: LatLng, destination: Facility) => {
    const meters = metersBetween(origin, destination.position);
    setRouteInfo({
      distanceText: formatDistance(meters),
      durationText: formatWalkingTime(meters),
      mode: "estimate"
    });
  };

  const getJapaneseSpeechVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

    const voices = window.speechSynthesis.getVoices();
    return (
      voices.find((voice) => voice.lang.toLowerCase() === "ja-jp") ||
      voices.find((voice) => voice.lang.toLowerCase().startsWith("ja")) ||
      null
    );
  };

  const createNavigationUtterance = (message: string) => {
    const utterance = new SpeechSynthesisUtterance(message);
    const japaneseVoice = getJapaneseSpeechVoice();
    utterance.lang = japaneseVoice?.lang || "ja-JP";
    utterance.voice = japaneseVoice;
    utterance.rate = 1;
    utterance.pitch = 1;
    return utterance;
  };

  const speakNavigation = (message: string) => {
    if (!voiceGuidanceEnabledRef.current) return;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const trimmed = message.trim();
    if (!trimmed || lastSpokenInstructionRef.current === trimmed) return;

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    const utterance = createNavigationUtterance(trimmed);
    lastSpokenInstructionRef.current = trimmed;
    window.speechSynthesis.speak(utterance);
  };

  const requestDeviceOrientationAccess = async () => {
    if (typeof window === "undefined" || !("DeviceOrientationEvent" in window)) {
      return false;
    }

    const orientationEvent =
      window.DeviceOrientationEvent as DeviceOrientationEventConstructorWithPermission;

    if (!orientationEvent.requestPermission) {
      return true;
    }

    try {
      return (await orientationEvent.requestPermission()) === "granted";
    } catch {
      return false;
    }
  };

  const extractDeviceHeading = (event: DeviceOrientationEventWithCompass) => {
    if (isUsableHeading(event.webkitCompassHeading)) {
      return normalizeHeading(event.webkitCompassHeading);
    }

    if (event.absolute && isUsableHeading(event.alpha)) {
      return normalizeHeading(360 - event.alpha);
    }

    return null;
  };

  const applyNavigationCamera = (currentPosition: LatLng, heading: number | null) => {
    const map = googleMapRef.current;
    if (!map || typeof google === "undefined") return;

    map.panTo(currentPosition);
    map.setZoom(Math.max(map.getZoom() || NAVIGATION_CAMERA_ZOOM, NAVIGATION_CAMERA_ZOOM));
    map.setTilt(0);

    if (isUsableHeading(heading)) {
      map.setHeading(normalizeHeading(heading));
    }
  };

  const inferNavigationHeading = (
    currentPosition: LatLng,
    destination: Facility,
    gpsHeading?: number | null
  ) => {
    if (isUsableHeading(deviceHeadingRef.current)) {
      return normalizeHeading(deviceHeadingRef.current);
    }

    if (isUsableHeading(gpsHeading)) {
      return normalizeHeading(gpsHeading);
    }

    const previousPosition = lastKnownNavigationPositionRef.current;
    if (
      previousPosition &&
      metersBetween(previousPosition, currentPosition) >= MIN_HEADING_MOVE_METERS
    ) {
      return getBearingDegrees(previousPosition, currentPosition);
    }

    const nextStep = navigationStepsRef.current[activeNavigationStepIndexRef.current];
    return getBearingDegrees(currentPosition, nextStep?.endLocation || destination.position);
  };

  const updateCurrentLocationMarker = (
    currentPosition: LatLng,
    options?: { panMap?: boolean }
  ) => {
    setTransitPosition(currentPosition);
    setCurrentLocationVisible(true);
    setTransitStatusText("現在地から最寄りを表示");

    if (!googleMapRef.current || typeof google === "undefined") return false;

    if (!currentLocationMarkerRef.current) {
      const legacyMaps = getLegacyMapsApi();
      currentLocationMarkerRef.current = new legacyMaps.Marker({
        map: googleMapRef.current,
        position: currentPosition,
        title: "現在地",
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: "#2563eb",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 4,
          scale: 10
        },
        zIndex: 4
      });
    } else {
      currentLocationMarkerRef.current.setPosition(currentPosition);
      currentLocationMarkerRef.current.setMap(googleMapRef.current);
    }

    if (options?.panMap) {
      googleMapRef.current.panTo(currentPosition);
      googleMapRef.current.setZoom(Math.max(googleMapRef.current.getZoom() || 18, 18));
    }

    return true;
  };

  useEffect(() => {
    if (!googleMapReady || !transitPosition || !currentLocationVisible) return;

    updateCurrentLocationMarker(transitPosition);
  }, [
    currentLocationVisible,
    googleMapReady,
    transitPosition?.lat,
    transitPosition?.lng
  ]);

  const extractRouteDetails = (result: google.maps.DirectionsResult) => {
    const route = result.routes[0];
    const leg = route?.legs[0];
    const path =
      route?.overview_path?.map((point) => ({
        lat: point.lat(),
        lng: point.lng()
      })) || [];
    const steps =
      leg?.steps?.map((step) => ({
        instruction: cleanRouteInstruction(step.instructions || "道なりに進む"),
        distanceText: step.distance?.text || "",
        durationText: step.duration?.text || "",
        endLocation: {
          lat: step.end_location.lat(),
          lng: step.end_location.lng()
        }
      })) || [];

    return {
      distanceText: leg?.distance?.text || "-",
      durationText: leg?.duration?.text || "-",
      path,
      steps
    };
  };

  const requestWalkingRoute = (origin: LatLng, destination: Facility) => {
    if (
      !googleMapRef.current ||
      typeof google === "undefined" ||
      !directionsRendererRef.current
    ) {
      return Promise.resolve(null);
    }

    const legacyMaps = getLegacyMapsApi();
    const service = new legacyMaps.DirectionsService();
    return new Promise<
      (ReturnType<typeof extractRouteDetails> & {
        directionsResult: google.maps.DirectionsResult;
      }) | null
    >((resolve) => {
      service.route(
        {
          origin,
          destination: destination.position,
          travelMode: google.maps.TravelMode.WALKING
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            resolve({
              ...extractRouteDetails(result),
              directionsResult: result
            });
            return;
          }
          resolve(null);
        }
      );
    });
  };

  const finishNavigation = () => {
    createNavigationRequest();

    if (navigationWatchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(navigationWatchIdRef.current);
      navigationWatchIdRef.current = null;
    }

    const destination = navigationDestinationRef.current;
    navigationDestinationRef.current = null;
    navigationRoutePathRef.current = [];
    navigationStepsRef.current = [];
    activeNavigationStepIndexRef.current = 0;
    lastKnownNavigationPositionRef.current = null;
    deviceHeadingRef.current = null;
    setNavigationState((state) =>
      state
        ? {
            ...state,
            active: false,
            statusText: "目的地周辺に到着しました",
            distanceText: "0m",
            durationText: "0分",
            nextInstruction: "到着しました",
            offRoute: false,
            recalculating: false
          }
        : state
    );
    setNavigationHeading(null);
    googleMapRef.current?.setHeading(0);
    googleMapRef.current?.setTilt(0);
    speakNavigation(`${destination?.name || "目的地"}周辺に到着しました。`);
  };

  const startNavigationRoute = async (
    origin: LatLng,
    destination: Facility,
    reason: "start" | "reroute",
    requestId = createNavigationRequest()
  ) => {
    navigationDestinationRef.current = destination;
    setNavigationState((state) =>
      state
        ? {
            ...state,
            destinationName: destination.name,
            statusText: reason === "reroute" ? "ルートを再検索中" : "案内を開始中",
            recalculating: true
          }
        : {
            active: true,
            destinationName: destination.name,
            statusText: reason === "reroute" ? "ルートを再検索中" : "案内を開始中",
            distanceText: "-",
            durationText: "-",
            nextInstruction: "現在地を確認中",
            offRoute: false,
            recalculating: true
          }
    );

    const routeDetails = await requestWalkingRoute(origin, destination);
    if (
      !isNavigationRequestCurrent(requestId, destination) ||
      navigationDestinationRef.current?.id !== destination.id
    ) {
      return;
    }

    if (!routeDetails) {
      const meters = metersBetween(origin, destination.position);
      estimateRoute(origin, destination);
      navigationRoutePathRef.current = [];
      navigationStepsRef.current = [];
      activeNavigationStepIndexRef.current = 0;
      setNavigationState({
        active: true,
        destinationName: destination.name,
        statusText: "概算案内中",
        distanceText: formatDistance(meters),
        durationText: formatWalkingTime(meters),
        nextInstruction: "Google Mapsの経路を取得できないため、地図上の目的地へ進んでください",
        offRoute: false,
        recalculating: false
      });
      speakNavigation(
        `${destination.name}まで概算案内を開始します。地図上の目的地へ進んでください。`
      );
      return;
    }

    directionsRendererRef.current?.setDirections(routeDetails.directionsResult);
    navigationRoutePathRef.current = routeDetails.path;
    navigationStepsRef.current = routeDetails.steps;
    activeNavigationStepIndexRef.current = 0;
    setRouteInfo({
      distanceText: routeDetails.distanceText,
      durationText: routeDetails.durationText,
      mode: "google"
    });
    const firstInstruction = routeDetails.steps[0]?.instruction || "道なりに進む";
    setNavigationState({
      active: true,
      destinationName: destination.name,
      statusText: reason === "reroute" ? "修正版ルートで案内中" : "案内中",
      distanceText: routeDetails.distanceText,
      durationText: routeDetails.durationText,
      nextInstruction: firstInstruction,
      offRoute: false,
      recalculating: false
    });
    speakNavigation(
      reason === "reroute"
        ? `ルートを修正しました。${firstInstruction}`
        : `${destination.name}まで案内を開始します。${firstInstruction}`
    );
  };

  const updateNavigationProgress = (
    currentPosition: LatLng,
    gpsHeading?: number | null
  ) => {
    const destination = navigationDestinationRef.current;
    if (!destination) return;

    updateCurrentLocationMarker(currentPosition);
    const heading = inferNavigationHeading(currentPosition, destination, gpsHeading);
    setNavigationHeading(heading);
    applyNavigationCamera(currentPosition, heading);

    const metersToDestination = metersBetween(currentPosition, destination.position);
    if (metersToDestination <= DESTINATION_ARRIVAL_THRESHOLD_METERS) {
      finishNavigation();
      return;
    }

    const routePath = navigationRoutePathRef.current;
    const steps = navigationStepsRef.current;
    const routeDistance =
      routePath.length > 0
        ? distanceToRoutePathMeters(currentPosition, routePath)
        : 0;
    const offRoute =
      routePath.length > 0 && routeDistance > OFF_ROUTE_THRESHOLD_METERS;

    if (offRoute && Date.now() - lastRerouteAtRef.current > REROUTE_COOLDOWN_MS) {
      lastRerouteAtRef.current = Date.now();
      setNavigationState((state) =>
        state
          ? {
              ...state,
              statusText: "ルートから外れたため再検索中",
              offRoute: true,
              recalculating: true
            }
          : state
      );
      speakNavigation("ルートを外れたため、再検索します。");
      void startNavigationRoute(currentPosition, destination, "reroute");
      return;
    }

    let nextStepIndex = activeNavigationStepIndexRef.current;
    while (
      nextStepIndex < steps.length &&
      metersBetween(currentPosition, steps[nextStepIndex].endLocation) <=
        STEP_ARRIVAL_THRESHOLD_METERS
    ) {
      nextStepIndex += 1;
    }

    if (nextStepIndex !== activeNavigationStepIndexRef.current) {
      activeNavigationStepIndexRef.current = nextStepIndex;
      const nextInstruction =
        steps[nextStepIndex]?.instruction || "目的地周辺です。周囲を確認してください";
      speakNavigation(nextInstruction);
    }

    const nextStep =
      steps[activeNavigationStepIndexRef.current] ||
      ({
        instruction: "目的地周辺です。周囲を確認してください",
        distanceText: "",
        durationText: "",
        endLocation: destination.position
      } satisfies NavigationStep);

    setNavigationState((state) =>
      state
        ? {
            ...state,
            statusText: offRoute ? "ルートから外れています" : "案内中",
            distanceText: formatDistance(metersToDestination),
            durationText: formatWalkingTime(metersToDestination),
            nextInstruction: nextStep.instruction,
            offRoute,
            recalculating: false
          }
        : state
    );
    lastKnownNavigationPositionRef.current = currentPosition;
  };

  const startNavigationWatch = () => {
    if (!navigator.geolocation) return;

    if (navigationWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(navigationWatchIdRef.current);
    }

    navigationWatchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        updateNavigationProgress(currentPosition, position.coords.heading);
      },
      () => {
        setNavigationState((state) =>
          state
            ? {
                ...state,
                statusText: "現在地を更新できません",
                recalculating: false
              }
            : state
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  };

  const showRouteFromCurrentLocation = () => {
    if (!selectedFacility || routeLoading) return;

    const destination = selectedFacility;
    const fallbackOrigin = campusCenters[destination.campus];
    stopNavigation({ silent: true });
    const requestId = createNavigationRequest();

    const showEstimatedRoute = (origin: LatLng, statusText: string) => {
      if (!isNavigationRequestCurrent(requestId, destination)) return;

      routePreviewOriginRef.current = origin;
      setRouteLoading(false);
      estimateRoute(origin, destination);
      setMapMessage(statusText);
    };

    setRouteLoading(true);
    setRouteInfo(null);
    setNavigationState(null);
    setNavigationHeading(null);
    setMapMessage("現在地からルートを表示中");

    if (!navigator.geolocation) {
      showEstimatedRoute(fallbackOrigin, "現在地を取得できないため概算ルートを表示中");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isNavigationRequestCurrent(requestId, destination)) return;

        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        routePreviewOriginRef.current = origin;
        updateCurrentLocationMarker(origin, { panMap: true });
        const routeDetails = await requestWalkingRoute(origin, destination);

        if (!isNavigationRequestCurrent(requestId, destination)) return;

        setRouteLoading(false);
        if (!routeDetails) {
          estimateRoute(origin, destination);
          setMapMessage("Google Mapsの経路を取得できないため概算ルートを表示中");
          return;
        }

        directionsRendererRef.current?.setDirections(routeDetails.directionsResult);
        setRouteInfo({
          distanceText: routeDetails.distanceText,
          durationText: routeDetails.durationText,
          mode: "google"
        });
        setMapMessage("ルートを表示中");
      },
      () => {
        showEstimatedRoute(
          fallbackOrigin,
          "現在地を取得できなかったため概算ルートを表示中"
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  };

  const startVoiceNavigation = () => {
    if (!selectedFacility) return;

    const destination = selectedFacility;
    const fallbackOrigin = routePreviewOriginRef.current || campusCenters[destination.campus];
    stopNavigation({ keepPanel: true, silent: true });
    const requestId = createNavigationRequest();

    setVoiceGuidanceEnabled(true);
    voiceGuidanceEnabledRef.current = true;
    setNavigationHeading(null);
    setMobileMenuOpen(false);
    setMobilePanelState("closed");
    setNavigationState({
      active: true,
      destinationName: destination.name,
      statusText: "案内を開始中",
      distanceText: routeInfo?.distanceText || "-",
      durationText: routeInfo?.durationText || "-",
      nextInstruction: "現在地を確認中",
      offRoute: false,
      recalculating: true
    });
    setMapMessage("音声案内を開始中");
    void requestDeviceOrientationAccess();
    speakNavigation("音声案内を開始します。");

    if (!navigator.geolocation) {
      const meters = metersBetween(fallbackOrigin, destination.position);
      estimateRoute(fallbackOrigin, destination);
      setNavigationState({
        active: false,
        destinationName: destination.name,
        statusText: "現在地を取得できないため案内を開始できません",
        distanceText: formatDistance(meters),
        durationText: formatWalkingTime(meters),
        nextInstruction: "現在地を使えるブラウザで案内を開始できます",
        offRoute: false,
        recalculating: false
      });
      speakNavigation("現在地を取得できないため、案内を開始できません。");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (!isNavigationRequestCurrent(requestId, destination)) return;

        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        const heading = inferNavigationHeading(origin, destination, position.coords.heading);

        routePreviewOriginRef.current = origin;
        lastKnownNavigationPositionRef.current = origin;
        setNavigationHeading(heading);
        updateCurrentLocationMarker(origin, { panMap: true });
        applyNavigationCamera(origin, heading);
        void startNavigationRoute(origin, destination, "start", requestId);
        startNavigationWatch();
        setMapMessage("音声案内中");
      },
      () => {
        if (!isNavigationRequestCurrent(requestId, destination)) return;

        const meters = metersBetween(fallbackOrigin, destination.position);
        estimateRoute(fallbackOrigin, destination);
        setNavigationState({
          active: false,
          destinationName: destination.name,
          statusText: "現在地を取得できなかったため案内を開始できません",
          distanceText: formatDistance(meters),
          durationText: formatWalkingTime(meters),
          nextInstruction: "位置情報を許可すると案内を開始できます",
          offRoute: false,
          recalculating: false
        });
        setMapMessage("現在地を取得できませんでした");
        speakNavigation("現在地を取得できませんでした。位置情報を許可してください。");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 5000 }
    );
  };

  const shareSelectedFacility = async () => {
    if (!selectedFacility) return;

    const url = new URL(
      withBasePath(`/?facility=${selectedFacility.id}`),
      window.location.origin
    );
    const title = `${selectedFacility.name} | 神大Map`;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: selectedFacility.name,
          url: url.toString()
        });
        setShareMessage("共有しました。");
        return;
      }

      await navigator.clipboard.writeText(url.toString());
      setShareMessage("リンクをコピーしました。");
    } catch {
      setShareMessage(url.toString());
    }
  };

  const selectedCategory = selectedFacility ? getCategory(selectedFacility.category) : null;
  const nearestCampusCenter = selectedFacility
    ? campusCenters[selectedFacility.campus]
    : campusCenters["六甲台第2"];
  const campusDistance = selectedFacility
    ? metersBetween(nearestCampusCenter, selectedFacility.position)
    : 0;
  const feedbackUrl = selectedFacility
    ? `https://github.com/I-H-dot/ShindaiMap/issues/new?template=facility_report.yml&title=${encodeURIComponent(`[Data]: ${selectedFacility.name}`)}`
    : "https://github.com/I-H-dot/ShindaiMap/issues/new?template=facility_report.yml";
  const fallbackTransitReferencePosition =
    campus !== "all" ? campusCenters[campus] : campusCenters["六甲台第2"];
  const selectedTransitReferencePosition = selectedFacility
    ? selectedFacility.campus === "その他"
      ? selectedFacility.position
      : campusCenters[selectedFacility.campus]
    : fallbackTransitReferencePosition;
  const transitReferencePosition = transitPosition || selectedTransitReferencePosition;
  const currentNearestTransit = useMemo(
    () =>
      getNearestTransitStops(transitStops, transitReferencePosition, { limit: 1 })[0] ||
      null,
    [transitReferencePosition.lat, transitReferencePosition.lng]
  );
  const currentNearestBus = useMemo(
    () =>
      getNearestTransitStops(transitStops, transitReferencePosition, {
        mode: "bus",
        limit: 1
      })[0] || null,
    [transitReferencePosition.lat, transitReferencePosition.lng]
  );
  const currentNearestTrain = useMemo(
    () =>
      getNearestTransitStops(transitStops, transitReferencePosition, {
        mode: "train",
        limit: 1
      })[0] || null,
    [transitReferencePosition.lat, transitReferencePosition.lng]
  );
  const fallbackReferencePositions = useMemo(
    () => mapBoundsFacilities.map((facility) => facility.position),
    [mapBoundsFacilities]
  );
  const campusNearestBus = useMemo(
    () =>
      getNearestTransitStops(transitStops, selectedTransitReferencePosition, {
        mode: "bus",
        limit: 1
      })[0] || null,
    [selectedTransitReferencePosition.lat, selectedTransitReferencePosition.lng]
  );
  const campusNearestTrain = useMemo(
    () =>
      getNearestTransitStops(transitStops, selectedTransitReferencePosition, {
        mode: "train",
        limit: 1
      })[0] || null,
    [selectedTransitReferencePosition.lat, selectedTransitReferencePosition.lng]
  );
  const isNavigationMode = navigationState?.active === true;
  const navigationHeadingText = isUsableHeading(navigationHeading)
    ? `${Math.round(navigationHeading)}°`
    : "進行方向を推定中";

  return (
    <main className={`map-shell ${isNavigationMode ? "is-navigation-mode" : ""}`}>
      <aside
        className={`sidebar ${mobileMenuOpen ? "is-mobile-menu-open" : ""} ${
          query.trim() ? "has-query" : ""
        }`}
        aria-label="神大Map コントロール"
      >
        <div className="brand-row">
          <div className="brand-mark">
            <div className="brand-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faMapPin} />
            </div>
            <div>
              <h1 className="brand-title">神大Map</h1>
              <p className="brand-subtitle">教室・トイレ・ラーコモを1画面で探す</p>
            </div>
          </div>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label="検索メニュー"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>

        <section
          className={`search-card ${mobileMenuOpen ? "is-mobile-open" : ""} ${
            filtersOpen ? "filters-open" : ""
          }`}
          aria-label="検索とキャンパス選択"
        >
          <div className="search-toolbar">
            <div className="search-box">
              <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setSelectedId("");
                }}
                placeholder="施設・教室を検索"
                aria-label="施設や教室を検索"
              />
            </div>
            <button
              className="mobile-filter-toggle"
              type="button"
              aria-label="フィルター"
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <FontAwesomeIcon icon={faFilter} />
              <span>フィルター</span>
            </button>
            <div className="control-grid">
              <label className="field-label">
                キャンパス
                <select
                  value={campus}
                  onChange={(event) => {
                    setCampus(event.target.value as CampusName | "all");
                    setRouteInfo(null);
                    stopNavigation({ silent: true });
                    setSelectedId("");
                  }}
                >
                  <option value="all">全キャンパス</option>
                  {campusNames.map((campusName) => (
                    <option key={campusName} value={campusName}>
                      {campusCenters[campusName].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-label">
                表示
                <select
                  value={selectedCategories.size === 1 ? [...selectedCategories][0] : "all"}
                  onChange={(event) => {
                    const value = event.target.value as FacilityCategory | "all";
                    if (value === "all") showAllCategories();
                    else showOnlyCategory(value);
                    stopNavigation({ silent: true });
                    setSelectedId("");
                  }}
                >
                  <option value="all">全カテゴリ</option>
                  {categoryOptions.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <TransitDepartureCard
            title="現在地最寄り"
            stopDistance={currentNearestTransit}
            now={now}
            statusText={transitStatusText}
            className="mobile-transit-card"
          />
        </section>

        <p className="result-summary" role="status" aria-live="polite">
          {resultSummaryText}
        </p>

        {selectedFacility && (
          <section
            id="selected-facility-panel"
            ref={selectedPanelRef}
            className={`selected-card is-mobile-panel-${mobilePanelState}`}
            aria-label="選択中の施設"
            tabIndex={-1}
            style={
              { "--facility-color": categoryColor(selectedFacility) } as React.CSSProperties
            }
            onTouchStart={handleMobilePanelTouchStart}
            onTouchMove={handleMobilePanelTouchMove}
            onTouchEnd={handleMobilePanelTouchEnd}
            onPointerDown={handleMobilePanelPointerDown}
            onPointerMove={handleMobilePanelPointerMove}
            onPointerUp={handleMobilePanelPointerUp}
            onPointerCancel={handleMobilePanelPointerCancel}
          >
            <button
              className="mobile-sheet-handle"
              type="button"
              aria-controls="selected-facility-panel"
              aria-expanded={!isMobilePanelClosed}
              aria-label={
                isMobilePanelClosed ? "施設メニューを開く" : "施設メニューを閉じる"
              }
              onClick={toggleMobilePanel}
            />
            <div className="selected-heading">
              <div className="selected-pin" aria-hidden="true">
                <FontAwesomeIcon icon={faMapPin} />
              </div>
              <div>
                <h2>{selectedFacility.name}</h2>
                <div className="selected-meta">
                  <span className="pill">{selectedFacility.campus}</span>
                  <span className="pill">{selectedCategory?.shortLabel}</span>
                  <span
                    className="pill"
                    title={`キャンパス中心から${formatDistance(campusDistance)}`}
                  >
                    {formatWalkingTime(campusDistance)}
                  </span>
                  <span className="pill">{selectedFacility.area}</span>
                  {selectedFacility.officialMapNumber && (
                    <span className="pill">公式No.{selectedFacility.officialMapNumber}</span>
                  )}
                </div>
              </div>
            </div>
            <div
              className="mobile-sheet-content"
              aria-hidden={isMobilePanelClosed}
              inert={isMobilePanelClosed ? true : undefined}
            >
              <div className="action-grid">
                <button
                  className="action-button primary"
                  type="button"
                  onClick={showRouteFromCurrentLocation}
                  disabled={routeLoading}
                >
                  <FontAwesomeIcon icon={faLocationArrow} />
                  {routeLoading ? "ルート取得中" : "ルートを表示"}
                </button>
                <button className="link-button" type="button" onClick={shareSelectedFacility}>
                  <FontAwesomeIcon icon={faShareNodes} />
                  共有
                </button>
              </div>
              {shareMessage && <p className="share-result">{shareMessage}</p>}
              {routeInfo && (
                <div className="route-panel">
                  <div className="route-panel-summary">
                    <FontAwesomeIcon icon={faRoute} />
                    <span>
                      {routeInfo.durationText} / {routeInfo.distanceText}
                      {routeInfo.mode === "estimate" ? "（概算）" : ""}
                    </span>
                  </div>
                  <button type="button" onClick={startVoiceNavigation}>
                    <FontAwesomeIcon icon={faPlay} />
                    案内開始
                  </button>
                </div>
              )}
              {navigationState && !navigationState.active && (
                <div
                  className={`navigation-panel ${
                    navigationState.offRoute ? "is-off-route" : ""
                  }`}
                >
                  <div className="navigation-panel-header">
                    <span>
                      <FontAwesomeIcon icon={faLocationArrow} />
                      {navigationState.statusText}
                    </span>
                    <div className="navigation-controls">
                      <button
                        type="button"
                        onClick={() => setVoiceGuidanceEnabled((enabled) => !enabled)}
                        aria-label={
                          voiceGuidanceEnabled ? "音声案内をオフ" : "音声案内をオン"
                        }
                      >
                        <FontAwesomeIcon
                          icon={voiceGuidanceEnabled ? faVolumeHigh : faVolumeXmark}
                        />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stopNavigation();
                          setRouteInfo(null);
                          setMapMessage("案内を終了しました");
                        }}
                        aria-label="案内を終了"
                      >
                        <FontAwesomeIcon icon={faStop} />
                      </button>
                    </div>
                  </div>
                  <strong>{navigationState.nextInstruction}</strong>
                  <div className="navigation-metrics">
                    <span>{navigationState.durationText}</span>
                    <span>{navigationState.distanceText}</span>
                    <span>{navigationState.destinationName}</span>
                  </div>
                  {navigationState.recalculating && (
                    <p>現在地に合わせてルートを更新しています。</p>
                  )}
                </div>
              )}
              <div className="guide-box campus-transit-guide">
                <h3>キャンパス最寄りの時刻表</h3>
                <CampusTransitRow title="バス" stopDistance={campusNearestBus} now={now} />
                <CampusTransitRow
                  title="電車"
                  stopDistance={campusNearestTrain}
                  now={now}
                />
                <p>アプリ内の発車時刻は目安です。正確な便は公式時刻表を確認してください。</p>
              </div>
            </div>
          </section>
        )}

        <section id="search-results" className="result-list" aria-label="検索結果">
          {filteredFacilities.map((facility) => {
            const isActive = facility.id === selectedFacility?.id;
            const resultCategory = getCategory(facility.category);

            return (
              <article
                key={facility.id}
                className={`result-card ${isActive ? "is-active" : ""}`}
                style={
                  { "--facility-color": categoryColor(facility) } as React.CSSProperties
                }
              >
                <button
                  className="result-select-button"
                  type="button"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() =>
                    selectFacility(facility, { zoomMap: true, focusPanel: true })
                  }
                >
                  <div className="result-top">
                    <h3>{facility.name}</h3>
                    <span className="pill">
                      {facility.officialMapNumber
                        ? `No.${facility.officialMapNumber}`
                        : resultCategory?.shortLabel}
                    </span>
                  </div>
                  <p>
                    {facility.campus} / {facility.area}
                  </p>
                </button>
              </article>
            );
          })}
          {filteredFacilities.length === 0 && (
            <div className="result-card">
              <h3>該当する施設がありません</h3>
              <p>検索語を短くするか、カテゴリを「すべて」に戻してください。</p>
            </div>
          )}
        </section>

        <section id="feedback" className="feedback-card" aria-label="修正提案">
          <div className="section-title-row">
            <h2>
              <FontAwesomeIcon icon={faPaperPlane} />
              情報の追加・修正
            </h2>
          </div>
          <p>施設情報の誤りや追加候補は、GitHub Issueで根拠と確認日を添えて知らせてください。</p>
          <a className="action-button" href={feedbackUrl} target="_blank" rel="noreferrer">
            <FontAwesomeIcon icon={faPaperPlane} />
            GitHub Issueを作成
          </a>
        </section>

        <section className="status-card" aria-label="接続状態">
          <div className="status-line">
            <FontAwesomeIcon icon={faLayerGroup} />
            <span>{mapMessage}</span>
          </div>
        </section>

      </aside>

      <section className="map-stage" aria-label="地図">
        <div ref={mapElementRef} className="google-map" aria-hidden="true" />
        <button
          className="map-locate-button"
          type="button"
          onClick={showCurrentLocationOnMap}
          aria-label="現在地を見る"
          title="現在地を見る"
        >
          <FontAwesomeIcon icon={faCrosshairs} />
        </button>
        <TransitDepartureCard
          title="現在地最寄り"
          stopDistance={
            desktopTransitMode === "bus" ? currentNearestBus : currentNearestTrain
          }
          now={now}
          statusText={transitStatusText}
          className="desktop-transit-card"
          modeOptions={[
            { mode: "bus", label: "バス", stopDistance: currentNearestBus },
            { mode: "train", label: "電車", stopDistance: currentNearestTrain }
          ]}
          selectedMode={desktopTransitMode}
          onModeChange={setDesktopTransitMode}
        />
        {!googleMapReady && (
          <div className="fallback-map">
            <div className="fallback-campus-label">
              <strong>{campus === "all" ? "全キャンパス" : campusCenters[campus].label}</strong>
              <span>
                Google Maps APIキー未設定でも、検索・フィルタ・施設情報・外部地図リンクは確認できます。
              </span>
            </div>
            {mapBoundsFacilities.length > 0 ? (
              mapBoundsFacilities.map((facility) => {
                const icon = icons[getCategory(facility.category)?.icon || "map-pin"] || faMapPin;
                return (
                  <button
                    key={facility.id}
                    type="button"
                    className={`fallback-pin ${
                      facility.id === selectedFacility?.id ? "is-active" : ""
                    }`}
                    style={
                      {
                        ...getFallbackPosition(facility, mapBoundsFacilities),
                        "--facility-color": categoryColor(facility)
                      } as React.CSSProperties
                    }
                    onClick={() => selectFacility(facility, { zoomMap: true })}
                    title={facility.name}
                    aria-label={facility.name}
                  >
                    {facility.officialMapNumber ? (
                      <span className="pin-number">{facility.officialMapNumber}</span>
                    ) : (
                      <FontAwesomeIcon icon={icon} />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="fallback-empty-state" role="status">
                <strong>該当する施設がありません</strong>
                <span>検索語、キャンパス、カテゴリを変更してください。</span>
              </div>
            )}
            {currentLocationVisible && transitPosition && (
              <div
                className="fallback-current-location"
                style={getFallbackPointPosition(transitPosition, fallbackReferencePositions)}
                role="img"
                aria-label="現在地"
                title="現在地"
              >
                <span />
              </div>
            )}
          </div>
        )}
        {isNavigationMode && navigationState && (
          <section
            className={`turn-by-turn-ui ${
              navigationState.offRoute ? "is-off-route" : ""
            }`}
            aria-label="音声案内"
          >
            <div className="turn-instruction-panel">
              <div className="turn-status-row">
                <span>
                  <FontAwesomeIcon icon={faLocationArrow} />
                  {navigationState.statusText}
                </span>
                <span className="heading-chip">
                  <FontAwesomeIcon icon={faCompass} />
                  {navigationHeadingText}
                </span>
              </div>
              <strong>{navigationState.nextInstruction}</strong>
              <div className="turn-metrics">
                <span>{navigationState.durationText}</span>
                <span>{navigationState.distanceText}</span>
                <span>{navigationState.destinationName}</span>
              </div>
              {navigationState.recalculating && (
                <p>現在地に合わせてルートを更新しています。</p>
              )}
            </div>
            <div className="turn-control-bar">
              <button
                type="button"
                onClick={() => setVoiceGuidanceEnabled((enabled) => !enabled)}
                aria-label={voiceGuidanceEnabled ? "音声案内をオフ" : "音声案内をオン"}
              >
                <FontAwesomeIcon
                  icon={voiceGuidanceEnabled ? faVolumeHigh : faVolumeXmark}
                />
                {voiceGuidanceEnabled ? "音声オン" : "音声オフ"}
              </button>
              <button
                type="button"
                onClick={() => {
                  stopNavigation();
                  setRouteInfo(null);
                  setMapMessage("案内を終了しました");
                }}
              >
                <FontAwesomeIcon icon={faStop} />
                終了
              </button>
            </div>
          </section>
        )}

      </section>
      <UiTuneKit />
    </main>
  );
}
