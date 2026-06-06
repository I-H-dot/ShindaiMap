import Fuse from "fuse.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faBars,
  faBook,
  faBookOpen,
  faBuilding,
  faBus,
  faCircleQuestion,
  faCouch,
  faCrosshairs,
  faEnvelope,
  faFilter,
  faLayerGroup,
  faLocationArrow,
  faMagnifyingGlass,
  faMapPin,
  faPaperPlane,
  faRoute,
  faShareNodes,
  faUniversalAccess,
  faUtensils,
  faYenSign
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { categoryMap } from "../data/categories";
import { formatDistance, formatWalkingTime, metersBetween } from "../lib/distance";
import type {
  CampusName,
  CategoryDefinition,
  Facility,
  FacilityCategory,
  LatLng
} from "../lib/types";
import { withBasePath } from "../lib/urls";

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

const icons: Record<string, IconDefinition> = {
  accessibility: faUniversalAccess,
  armchair: faCouch,
  "book-open": faBookOpen,
  library: faBook,
  "building-2": faBuilding,
  route: faRoute,
  "badge-yen": faYenSign,
  mailbox: faEnvelope,
  bus: faBus,
  utensils: faUtensils,
  "circle-help": faCircleQuestion,
  "map-pin": faMapPin
};

const getCategory = (category: FacilityCategory) => categoryMap.get(category);

const categoryColor = (facility: Facility) =>
  getCategory(facility.category)?.color || "#2563eb";

const INITIAL_MAP_ZOOM = 16;
const FOCUSED_FACILITY_ZOOM = 18;
const MAP_FIT_BOUNDS_PADDING = 58;

const getCampusBounds = (facilities: Facility[]) => {
  const positions = facilities.map((facility) => facility.position);
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

const getFallbackPosition = (facility: Facility, facilities: Facility[]) => {
  const bounds = getCampusBounds(facilities);
  const left =
    ((facility.position.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 86 + 7;
  const top =
    (1 - (facility.position.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 82 +
    9;

  return {
    left: `${Math.max(4, Math.min(96, left))}%`,
    top: `${Math.max(4, Math.min(96, top))}%`
  };
};

const isCampusViewportFacility = (facility: Facility) => {
  const { lat, lng } = facility.position;
  return lat >= 34.55 && lat <= 34.78 && lng >= 135.05 && lng <= 135.32;
};

const useUrlInitialSelection = (
  facilities: Facility[],
  setSelectedId: (id: string) => void,
  setSelectedCategories: (categories: Set<FacilityCategory>) => void
) => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const facilityId = params.get("facility");
    const categoryId = params.get("category") as FacilityCategory | null;

    if (facilityId && facilities.some((facility) => facility.id === facilityId)) {
      setSelectedId(facilityId);
    }

    if (categoryId && categoryMap.has(categoryId)) {
      setSelectedCategories(new Set([categoryId]));
    }
  }, [facilities, setSelectedCategories, setSelectedId]);
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
  const [selectedId, setSelectedId] = useState(initialFacilities[0]?.id || "");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [mapMessage, setMapMessage] = useState("Google Maps APIキーを確認中");
  const [googleMapReady, setGoogleMapReady] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const markersByIdRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null);

  useUrlInitialSelection(facilities, setSelectedId, setSelectedCategories);

  const campusNames = useMemo(
    () => Object.keys(campusCenters) as CampusName[],
    [campusCenters]
  );

  const fuse = useMemo(
    () =>
      new Fuse(facilities, {
        threshold: 0.34,
        ignoreLocation: true,
        keys: [
          "name",
          "campus",
          "area",
          "aliases",
          "tags",
          "building",
          "roomExamples",
          "officialMapNumber",
          "sourceArea"
        ]
      }),
    [facilities]
  );

  const searchedFacilities = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return facilities;
    return fuse.search(trimmed).map((result) => result.item);
  }, [facilities, fuse, query]);

  const filteredFacilities = useMemo(
    () =>
      searchedFacilities.filter((facility) => {
        if (campus !== "all" && facility.campus !== campus) return false;
        return selectedCategories.has(facility.category);
      }),
    [campus, searchedFacilities, selectedCategories]
  );

  const selectedFacility =
    filteredFacilities.find((facility) => facility.id === selectedId) ||
    filteredFacilities[0] ||
    null;

  const mapFacilities = useMemo(() => {
    return filteredFacilities;
  }, [filteredFacilities]);

  const mapBoundsFacilities = useMemo(() => {
    const localFacilities = mapFacilities.filter(isCampusViewportFacility);
    return localFacilities.length > 0 ? localFacilities : mapFacilities;
  }, [mapFacilities]);

  const countsByCategory = useMemo(() => {
    const counts = new Map<FacilityCategory, number>();
    for (const facility of facilities) {
      if (campus !== "all" && facility.campus !== campus) continue;
      counts.set(facility.category, (counts.get(facility.category) || 0) + 1);
    }
    return counts;
  }, [campus, facilities]);

  const categoryOptions = useMemo(
    () => categories.filter((category) => (countsByCategory.get(category.id) || 0) > 0),
    [categories, countsByCategory]
  );

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

  const selectFacility = (facility: Facility, options?: { zoomMap?: boolean }) => {
    setSelectedId(facility.id);
    setRouteInfo(null);
    setMobileMenuOpen(false);
    if (options?.zoomMap) {
      focusMapOnFacility(facility);
    }

    const url = new URL(window.location.href);
    url.searchParams.set("facility", facility.id);
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const showCurrentLocationOnMap = () => {
    if (!navigator.geolocation) {
      setMapMessage("現在地を取得できないブラウザです");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        if (googleMapRef.current && typeof google !== "undefined") {
          if (!currentLocationMarkerRef.current) {
            currentLocationMarkerRef.current = new google.maps.Marker({
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

          googleMapRef.current.panTo(currentPosition);
          googleMapRef.current.setZoom(Math.max(googleMapRef.current.getZoom() || 17, 17));
          setMapMessage("現在地を表示中");
          return;
        }

        setMapMessage("Google Maps読み込み後に現在地を表示できます");
      },
      () => {
        setMapMessage("現在地を取得できませんでした");
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
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
        directionsRendererRef.current = new google.maps.DirectionsRenderer({
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

      const marker = new google.maps.Marker({
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

  const estimateRoute = (origin: LatLng, destination: Facility) => {
    const meters = metersBetween(origin, destination.position);
    setRouteInfo({
      distanceText: formatDistance(meters),
      durationText: formatWalkingTime(meters),
      mode: "estimate"
    });
  };

  const routeFromCurrentLocation = () => {
    if (!selectedFacility) return;

    if (!navigator.geolocation) {
      estimateRoute(campusCenters[selectedFacility.campus], selectedFacility);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        focusMapOnFacility(selectedFacility, FOCUSED_FACILITY_ZOOM);

        if (
          googleMapRef.current &&
          typeof google !== "undefined" &&
          directionsRendererRef.current
        ) {
          const service = new google.maps.DirectionsService();
          service.route(
            {
              origin,
              destination: selectedFacility.position,
              travelMode: google.maps.TravelMode.WALKING
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK && result) {
                directionsRendererRef.current?.setDirections(result);
                const leg = result.routes[0]?.legs[0];
                setRouteInfo({
                  distanceText: leg?.distance?.text || "-",
                  durationText: leg?.duration?.text || "-",
                  mode: "google"
                });
              } else {
                estimateRoute(origin, selectedFacility);
              }
            }
          );
          return;
        }

        estimateRoute(origin, selectedFacility);
      },
      () => {
        estimateRoute(campusCenters[selectedFacility.campus], selectedFacility);
      },
      { enableHighAccuracy: true, timeout: 6000, maximumAge: 30000 }
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
    ? `https://github.com/IshizukaHiroto/ShindaiMap/issues/new?template=facility_report.yml&title=${encodeURIComponent(`[Data]: ${selectedFacility.name}`)}`
    : "https://github.com/IshizukaHiroto/ShindaiMap/issues/new?template=facility_report.yml";

  return (
    <main className="map-shell">
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
          <div className="search-box">
            <FontAwesomeIcon icon={faMagnifyingGlass} aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="施設・教室を検索"
              aria-label="施設や教室を検索"
            />
          </div>
          <button
            className="mobile-filter-toggle"
            type="button"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <FontAwesomeIcon icon={faFilter} />
            フィルター
          </button>
          <div className="control-grid">
            <label className="field-label">
              キャンパス
              <select
                value={campus}
                onChange={(event) => {
                  setCampus(event.target.value as CampusName | "all");
                  setRouteInfo(null);
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
        </section>

        {selectedFacility && (
          <section
            className="selected-card"
            style={
              { "--facility-color": categoryColor(selectedFacility) } as React.CSSProperties
            }
          >
            <div className="selected-heading">
              <div className="selected-pin" aria-hidden="true">
                <FontAwesomeIcon icon={faMapPin} />
              </div>
              <div>
                <h2>{selectedFacility.name}</h2>
                <div className="selected-meta">
                  <span className="pill">{selectedFacility.campus}</span>
                  <span className="pill">{selectedCategory?.shortLabel}</span>
                  <span className="pill">{selectedFacility.area}</span>
                  {selectedFacility.officialMapNumber && (
                    <span className="pill">公式No.{selectedFacility.officialMapNumber}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="action-grid">
              <button
                className="action-button primary"
                type="button"
                onClick={routeFromCurrentLocation}
              >
                <FontAwesomeIcon icon={faLocationArrow} />
                ここへ行く
              </button>
              <button className="link-button" type="button" onClick={shareSelectedFacility}>
                <FontAwesomeIcon icon={faShareNodes} />
                共有
              </button>
            </div>
            {shareMessage && <p className="share-result">{shareMessage}</p>}
            {routeInfo && (
              <div className="route-panel">
                <FontAwesomeIcon icon={faRoute} />
                <span>
                  {routeInfo.durationText} / {routeInfo.distanceText}
                  {routeInfo.mode === "estimate" ? "（概算）" : ""}
                </span>
              </div>
            )}
            <div className="guide-box route-guide">
              <h3>案内</h3>
              <ul>
                <li>
                  キャンパス中心から 徒歩 {formatWalkingTime(campusDistance)}
                  （{formatDistance(campusDistance)}）
                </li>
                {selectedFacility.routeHint && <li>{selectedFacility.routeHint}</li>}
              </ul>
            </div>
          </section>
        )}

        <section id="search-results" className="result-list" aria-label="検索結果">
          {filteredFacilities.slice(0, 16).map((facility) => (
            <button
              key={facility.id}
              className={`result-card ${facility.id === selectedFacility?.id ? "is-active" : ""}`}
              type="button"
              onClick={() => selectFacility(facility, { zoomMap: true })}
            >
              <div className="result-top">
                <h3>{facility.name}</h3>
                <span className="pill">
                  {facility.officialMapNumber
                    ? `No.${facility.officialMapNumber}`
                    : getCategory(facility.category)?.shortLabel}
                </span>
              </div>
            </button>
          ))}
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
        {!googleMapReady && (
          <div className="fallback-map">
            <div className="fallback-campus-label">
              <strong>{campus === "all" ? "全キャンパス" : campusCenters[campus].label}</strong>
              <span>
                Google Maps APIキー未設定でも、検索・フィルタ・施設情報・外部地図リンクは確認できます。
              </span>
            </div>
            {mapBoundsFacilities.map((facility) => {
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
            })}
          </div>
        )}

      </section>
    </main>
  );
}
