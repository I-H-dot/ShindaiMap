#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Audit official campus-map records and reproduce image-based coordinates.

This script intentionally keeps downloaded official images in ``.cache``.
They are public reference materials, but they are not part of this MIT-licensed
repository.

日本語: 公式キャンパスマップの番号表とローカル座標データの差分を確認し、
画像上のピン位置から追加座標を再計算するための補助スクリプトです。
公式画像は ``.cache`` にのみ保存し、リポジトリには含めません。
"""

from __future__ import annotations

import argparse
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urljoin

import cv2
import numpy as np
import requests
from bs4 import BeautifulSoup


ROOT = Path(__file__).resolve().parents[1]
OFFICIAL_FACILITIES_JSON_PATH = ROOT / "src/data/officialFacilities.json"
CACHE_DIR = ROOT / ".cache/official-map-sources"


@dataclass(frozen=True)
class OfficialPage:
    key: str
    campus: str
    source_area: str
    url: str


OFFICIAL_PAGES = (
    OfficialPage(
        key="rokkodai1",
        campus="六甲台第1",
        source_area="六甲台第1キャンパス",
        url="https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai1/",
    ),
    OfficialPage(
        key="rokkodai2",
        campus="六甲台第2",
        source_area="六甲台第2キャンパス",
        url="https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai2/",
    ),
    OfficialPage(
        key="tsurukabuto1",
        campus="鶴甲第1",
        source_area="鶴甲第1キャンパス",
        url="https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto1/",
    ),
    OfficialPage(
        key="tsurukabuto2",
        campus="鶴甲第2",
        source_area="鶴甲第2キャンパス",
        url="https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto2/",
    ),
    OfficialPage(
        key="kusunoki",
        campus="楠",
        source_area="楠キャンパス",
        url="https://www.kobe-u.ac.jp/ja/campus-life/general/access/kusunoki/campusmap/",
    ),
    OfficialPage(
        key="myodani",
        campus="名谷",
        source_area="名谷キャンパス",
        url="https://www.kobe-u.ac.jp/ja/campus-life/general/access/myodani/campusmap/",
    ),
    OfficialPage(
        key="fukae",
        campus="深江",
        source_area="深江キャンパス",
        url="https://www.kobe-u.ac.jp/ja/campus-life/general/access/fukae/campusmap/",
    ),
)


ROKKODAI2_IMAGE_URL = (
    "https://www.kobe-u.ac.jp/sites/default/files/img-announcement/"
    "2025-12/02-b3_liujiatai2ki_yanhasu.jpg"
)

# Pixel centers detected from the 2025-12 六甲台第2 official map image.
# They are limited to nearby control points around No.104 to avoid global
# distortion from the illustrated campus-map perspective.
ROKKODAI2_LOCAL_CONTROL_PIXELS = {
    "75": (3575.0409, 2603.9421),
    "76": (3722.4860, 2779.9622),
    "77": (3742.1788, 2977.6392),
    "83": (3115.7628, 3041.7510),
    "84": (3116.1832, 3231.4518),
    "85": (3325.0717, 3364.0517),
    "86": (3437.1285, 3550.2795),
    "96": (2682.0035, 3486.6573),
    "97": (2953.1773, 3541.5941),
    "98": (2746.3059, 3785.6706),
    "102": (3559.2195, 3808.3230),
    "103": (3941.4524, 3745.3042),
}

ROKKODAI2_NO_104_PIXEL = (3920.8615, 3121.0632)


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def fetch_text(url: str) -> str:
    response = requests.get(url, timeout=30)
    response.raise_for_status()
    return response.content.decode("utf-8", errors="replace")


def extract_page_records(page: OfficialPage) -> dict[str, str]:
    soup = BeautifulSoup(fetch_text(page.url), "html.parser")
    records: dict[str, str] = {}

    for item in soup.select("main li"):
        text = normalize_text(item.get_text(" ", strip=True))
        match = re.match(r"^\[([^\]]+)\]\s*(.+)$", text)
        if match:
            records[match.group(1)] = match.group(2)

    return records


def extract_page_images(page: OfficialPage) -> list[str]:
    soup = BeautifulSoup(fetch_text(page.url), "html.parser")
    return [
        urljoin(page.url, image["src"])
        for image in soup.select("main img[src]")
    ]


def load_local_official_records() -> list[dict[str, object]]:
    return json.loads(OFFICIAL_FACILITIES_JSON_PATH.read_text())


def audit_page_records() -> dict[str, object]:
    local_records = load_local_official_records()
    by_source: dict[str, dict[str, str]] = {}

    for record in local_records:
        source_area = str(record.get("sourceArea", ""))
        map_number = record.get("officialMapNumber")
        if isinstance(map_number, str):
            by_source.setdefault(source_area, {})[map_number] = str(record["name"])

    audit: dict[str, object] = {}
    for page in OFFICIAL_PAGES:
        official = extract_page_records(page)
        local = by_source.get(page.source_area, {})
        official_numbers = set(official)
        local_numbers = set(local)
        name_mismatches = {
            number: {"official": official[number], "local": local[number]}
            for number in sorted(official_numbers & local_numbers, key=sort_number)
            if normalize_text(official[number]) != normalize_text(local[number])
        }
        audit[page.key] = {
            "sourceArea": page.source_area,
            "officialCount": len(official),
            "localCount": len(local),
            "missingLocalNumbers": sorted(official_numbers - local_numbers, key=sort_number),
            "extraLocalNumbers": sorted(local_numbers - official_numbers, key=sort_number),
            "nameMismatches": name_mismatches,
            "imageUrls": extract_page_images(page),
        }

    return audit


def sort_number(value: str) -> tuple[int, str]:
    first_number = re.search(r"\d+", value)
    return (int(first_number.group(0)) if first_number else 9999, value)


def feature_vector(x: float, y: float) -> list[float]:
    return [1.0, x, y, x * x, x * y, y * y]


def calculate_rokkodai2_no_104() -> dict[str, object]:
    local_records = {
        str(record["officialMapNumber"]): record
        for record in load_local_official_records()
        if record.get("sourceArea") == "六甲台第2キャンパス"
        and isinstance(record.get("officialMapNumber"), str)
    }

    labels = [
        number
        for number in ROKKODAI2_LOCAL_CONTROL_PIXELS
        if number in local_records
    ]
    x_matrix = np.array(
        [feature_vector(*ROKKODAI2_LOCAL_CONTROL_PIXELS[number]) for number in labels],
        dtype=float,
    )
    lat_values = np.array([float(local_records[number]["lat"]) for number in labels])
    lng_values = np.array([float(local_records[number]["lng"]) for number in labels])

    lat_coefficients = np.linalg.lstsq(x_matrix, lat_values, rcond=None)[0]
    lng_coefficients = np.linalg.lstsq(x_matrix, lng_values, rcond=None)[0]
    predicted = np.array(feature_vector(*ROKKODAI2_NO_104_PIXEL))
    predicted_lat = float(predicted @ lat_coefficients)
    predicted_lng = float(predicted @ lng_coefficients)

    residuals = []
    for row, lat, lng, number in zip(x_matrix, lat_values, lng_values, labels):
        predicted_control_lat = float(row @ lat_coefficients)
        predicted_control_lng = float(row @ lng_coefficients)
        dy = (predicted_control_lat - lat) * 111_320
        dx = (
            (predicted_control_lng - lng)
            * 111_320
            * math.cos(math.radians(lat))
        )
        residuals.append({"number": number, "meters": math.hypot(dx, dy)})

    rmse = math.sqrt(sum(item["meters"] ** 2 for item in residuals) / len(residuals))

    return {
        "pixel": {"x": ROKKODAI2_NO_104_PIXEL[0], "y": ROKKODAI2_NO_104_PIXEL[1]},
        "lat": round(predicted_lat, 7),
        "lng": round(predicted_lng, 7),
        "controlPoints": labels,
        "controlRmseMeters": round(rmse, 2),
        "maxResidualMeters": round(max(item["meters"] for item in residuals), 2),
    }


def detect_red_marker_centers(image_path: Path) -> list[dict[str, float]]:
    image = cv2.imread(str(image_path))
    if image is None:
        raise RuntimeError(f"cannot read image: {image_path}")

    hsv_image = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    red_low = cv2.inRange(hsv_image, np.array([0, 80, 80]), np.array([15, 255, 255]))
    red_high = cv2.inRange(hsv_image, np.array([165, 80, 80]), np.array([179, 255, 255]))
    mask = red_low | red_high
    _, _, stats, centroids = cv2.connectedComponentsWithStats(mask, 8)
    centers = []

    for index in range(1, len(stats)):
        x, y, width, height, area = [int(value) for value in stats[index]]
        if 200 < area < 50_000 and 20 < width < 250 and 20 < height < 250:
            centers.append(
                {
                    "x": round(float(centroids[index][0]), 4),
                    "y": round(float(centroids[index][1]), 4),
                    "width": width,
                    "height": height,
                    "area": area,
                }
            )

    return sorted(centers, key=lambda item: (item["y"], item["x"]))


def download(url: str, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    path.write_bytes(response.content)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--audit", action="store_true", help="compare official pages with local JSON data")
    parser.add_argument("--rokkodai2-104", action="store_true", help="recalculate No.104 from local control points")
    parser.add_argument("--detect-rokkodai2-red", action="store_true", help="detect red marker centers in the cached map image")
    parser.add_argument("--download-rokkodai2", action="store_true", help="download the current official Rokko 2 image into .cache")
    args = parser.parse_args()

    if args.download_rokkodai2:
        download(ROKKODAI2_IMAGE_URL, CACHE_DIR / "rokkodai2.jpg")

    output: dict[str, object] = {}
    if args.audit:
        output["audit"] = audit_page_records()
    if args.rokkodai2_104:
        output["rokkodai2No104"] = calculate_rokkodai2_no_104()
    if args.detect_rokkodai2_red:
        output["rokkodai2RedMarkers"] = detect_red_marker_centers(CACHE_DIR / "rokkodai2.jpg")

    print(json.dumps(output, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
