# -*- coding: utf-8 -*-
"""Fetch and normalize monthly train timetables for ShindaiMap.

The scraper targets the small set of train stations used by the app and writes
TypeScript data that can be imported at build time.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable
from urllib.request import Request, urlopen


# 駅IDのキーと値を格納するやつ
stationID = {
    "六甲": 26590,
    "六甲道": 26591,
    "御影(阪神)": 26556,
    "深江(兵庫県)": 26533,
    "新在家": 26402,
    "名谷": 26553,
    "大倉山": 26302,
    "高速神戸": 26352,
    "神戸": 26357,
    "みなとじま": 26393,
    "計算科学センター": 29558,
    "医療センター": 29557,
}

# 各方面を表すやつとの対応
directionID = {
    "神戸空港方面": 5891,
    "神戸空港・計算科学センター方面": 5891,
    "三宮方面": 5890,
    "西明石・網干方面": 1801,
    "米原・京都方面": 1800,
    "大阪梅田・尼崎方面": 4231,
    "高速神戸・神戸三宮方面": 4230,
    "高速神戸・山陽姫路方面": 4230,
    "高速神戸・御影方面": 4230,
    "西神中央方面": 5861,
    "谷上・新神戸方面": 5860,
    "梅田(阪神)・神戸三宮(阪神)方面": 5751,
    "山陽姫路・新開地方面": 5750,
    "梅田(阪急)・神戸三宮(阪急)方面": 5761,
    "大阪梅田・西宮北口方面": 4120,
    "神戸三宮・新開地方面": 4121,
}

# 曜日との対応
dayOfTheWeek = {
    "平日": 1,
    "土曜": 2,
    "日曜・祝日": 4,
}

SOURCE_NAME = "Yahoo!路線情報"
SOURCE_URL_PATTERN = (
    "https://transit.yahoo.co.jp/timetable/{station_id}/{direction_id}/print?kind={day_kind}"
)
USER_AGENT = (
    "ShindaiMap monthly timetable updater "
    "(+https://github.com/I-H-dot/ShindaiMap)"
)


def progress(message: str) -> None:
    print(message, file=sys.stderr, flush=True)


@dataclass(frozen=True)
class DirectionTarget:
    app_label: str
    direction_id: int


@dataclass(frozen=True)
class StopTarget:
    app_stop_id: str
    station_name: str
    station_id: int
    directions: tuple[DirectionTarget, ...]


TRAIN_TARGETS: tuple[StopTarget, ...] = (
    StopTarget(
        app_stop_id="jr-rokkomichi",
        station_name="六甲道",
        station_id=stationID["六甲道"],
        directions=(
            DirectionTarget("尼崎・大阪・京都方面", directionID["米原・京都方面"]),
            DirectionTarget("三ノ宮・姫路方面", directionID["西明石・網干方面"]),
        ),
    ),
    StopTarget(
        app_stop_id="hankyu-rokko",
        station_name="六甲",
        station_id=stationID["六甲"],
        directions=(
            DirectionTarget("大阪梅田・西宮北口方面", directionID["大阪梅田・西宮北口方面"]),
            DirectionTarget("神戸三宮・新開地方面", directionID["神戸三宮・新開地方面"]),
        ),
    ),
    StopTarget(
        app_stop_id="hanshin-mikage",
        station_name="御影(阪神)",
        station_id=stationID["御影(阪神)"],
        directions=(
            DirectionTarget("大阪梅田・尼崎方面", directionID["大阪梅田・尼崎方面"]),
            DirectionTarget("高速神戸・山陽姫路方面", directionID["高速神戸・山陽姫路方面"]),
        ),
    ),
    StopTarget(
        app_stop_id="hanshin-fukae",
        station_name="深江(兵庫県)",
        station_id=stationID["深江(兵庫県)"],
        directions=(
            DirectionTarget("大阪梅田・尼崎方面", directionID["大阪梅田・尼崎方面"]),
            DirectionTarget("高速神戸・御影方面", directionID["高速神戸・御影方面"]),
        ),
    ),
    StopTarget(
        app_stop_id="subway-myodani",
        station_name="名谷",
        station_id=stationID["名谷"],
        directions=(
            DirectionTarget("谷上・新神戸方面", directionID["谷上・新神戸方面"]),
            DirectionTarget("西神中央方面", directionID["西神中央方面"]),
        ),
    ),
    StopTarget(
        app_stop_id="subway-okurayama",
        station_name="大倉山",
        station_id=stationID["大倉山"],
        directions=(
            DirectionTarget("谷上・新神戸方面", directionID["谷上・新神戸方面"]),
            DirectionTarget("西神中央方面", directionID["西神中央方面"]),
        ),
    ),
    StopTarget(
        app_stop_id="portliner-minatojima",
        station_name="みなとじま",
        station_id=stationID["みなとじま"],
        directions=(
            DirectionTarget("三宮方面", directionID["三宮方面"]),
            DirectionTarget("神戸空港方面", directionID["神戸空港方面"]),
        ),
    ),
)

SERVICE_DAYS = (
    ("weekday", "平日", dayOfTheWeek["平日"]),
    ("saturday", "土曜", dayOfTheWeek["土曜"]),
    ("holiday", "日曜・祝日", dayOfTheWeek["日曜・祝日"]),
)


class TimetableHTMLParser(HTMLParser):
    """Fallback parser for the print table when Next.js JSON is unavailable."""

    def __init__(self) -> None:
        super().__init__()
        self.times: list[str] = []
        self._in_tbody = False
        self._in_hour_cell = False
        self._in_minute = False
        self._hour_buffer: list[str] = []
        self._minute_buffer: list[str] = []
        self._current_hour: int | None = None
        self._seen_late_hour = False

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_map = dict(attrs)
        class_name = attrs_map.get("class", "")

        if tag == "tbody":
            self._in_tbody = True
        elif self._in_tbody and tag == "td" and "col1" in class_name:
            self._in_hour_cell = True
            self._hour_buffer = []
        elif self._in_tbody and tag == "dt" and self._current_hour is not None:
            self._in_minute = True
            self._minute_buffer = []

    def handle_data(self, data: str) -> None:
        if self._in_hour_cell:
            self._hour_buffer.append(data)
        if self._in_minute:
            self._minute_buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag == "tbody":
            self._in_tbody = False
            self._current_hour = None
        elif tag == "tr" and self._in_tbody:
            self._current_hour = None
        elif tag == "td" and self._in_hour_cell:
            hour_text = "".join(self._hour_buffer)
            match = re.search(r"\d+", hour_text)
            if match:
                hour = int(match.group(0))
                self._current_hour = 24 if hour == 0 and self._seen_late_hour else hour
                self._seen_late_hour = self._seen_late_hour or hour >= 23
            else:
                self._current_hour = None
            self._in_hour_cell = False
        elif tag == "dt" and self._in_minute:
            minute_text = "".join(self._minute_buffer)
            match = re.search(r"\d+", minute_text)
            if match and self._current_hour is not None:
                self.times.append(to_clock(self._current_hour, int(match.group(0))))
            self._in_minute = False


def to_clock(hour: int, minute: int) -> str:
    return f"{hour:02d}:{minute:02d}"


def sort_unique_times(times: Iterable[str]) -> list[str]:
    def to_minutes(time_value: str) -> int:
        hour, minute = [int(part) for part in time_value.split(":")]
        return hour * 60 + minute

    return sorted(set(times), key=to_minutes)


def parse_next_data_times(html: str) -> list[str]:
    match = re.search(
        r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
        html,
        flags=re.S,
    )
    if not match:
        return []

    data = json.loads(unescape(match.group(1)))
    timetable_item = (
        data.get("props", {}).get("pageProps", {}).get("timetableItem", {})
    )
    hour_table = timetable_item.get("hourTimeTable", [])

    times: list[str] = []
    for hour_entry in hour_table:
        hour = int(hour_entry["hour"])
        for minute_entry in hour_entry.get("minTimeTable", []):
            minute = int(minute_entry["minute"])
            times.append(to_clock(hour, minute))

    return sort_unique_times(times)


def parse_table_times(html: str) -> list[str]:
    parser = TimetableHTMLParser()
    parser.feed(html)
    return sort_unique_times(parser.times)


def parse_timetable_times(html: str) -> list[str]:
    return parse_next_data_times(html) or parse_table_times(html)


def timetable_url(station_id: int, direction_id: int, day_kind: int) -> str:
    return SOURCE_URL_PATTERN.format(
        station_id=station_id,
        direction_id=direction_id,
        day_kind=day_kind,
    )


def fetch_html(url: str, timeout: int) -> str:
    request = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept-Language": "ja,en;q=0.8",
        },
    )
    with urlopen(request, timeout=timeout) as response:
        return response.read().decode("utf-8", errors="replace")


def build_payload(delay_seconds: float, timeout: int) -> dict[str, object]:
    stops: dict[str, dict[str, dict[str, list[str]]]] = {}
    total_requests = sum(len(stop.directions) * len(SERVICE_DAYS) for stop in TRAIN_TARGETS)
    completed_requests = 0
    started_at = time.monotonic()

    progress(
        f"時刻表取得を開始します: {len(TRAIN_TARGETS)}駅 / "
        f"{sum(len(stop.directions) for stop in TRAIN_TARGETS)}方面 / {total_requests}ページ"
    )
    for stop in TRAIN_TARGETS:
        progress(f"探索対象駅: {stop.station_name} ({stop.app_stop_id})")
        stop_payload: dict[str, dict[str, list[str]]] = {}

        for direction in stop.directions:
            schedule: dict[str, list[str]] = {}
            for service_key, service_label, day_kind in SERVICE_DAYS:
                url = timetable_url(stop.station_id, direction.direction_id, day_kind)
                request_number = completed_requests + 1
                progress(
                    f"[{request_number}/{total_requests}] 取得開始: "
                    f"{stop.station_name} / {direction.app_label} / {service_label}"
                )
                try:
                    html = fetch_html(url, timeout=timeout)
                    times = parse_timetable_times(html)
                except Exception as exc:
                    progress(
                        f"[{request_number}/{total_requests}] 取得失敗: "
                        f"{stop.station_name} / {direction.app_label} / {service_label} "
                        f"({exc})"
                    )
                    raise
                if not times:
                    raise RuntimeError(
                        f"時刻を取得できませんでした: {stop.station_name} "
                        f"{direction.app_label} {service_label} {url}"
                    )
                schedule[service_key] = times
                completed_requests += 1
                elapsed = time.monotonic() - started_at
                progress(
                    f"[{completed_requests}/{total_requests}] 取得完了: "
                    f"{stop.station_name} / {direction.app_label} / {service_label} "
                    f"{len(times)}件 ({elapsed:.1f}s)"
                )
                time.sleep(delay_seconds)

            # Existing app code can fall back to `weekend`; keep it as holiday data.
            schedule["weekend"] = schedule["holiday"]
            stop_payload[direction.app_label] = schedule

        stops[stop.app_stop_id] = stop_payload
        progress(f"駅の取得完了: {stop.station_name}")

    progress(f"すべての時刻表取得が完了しました ({time.monotonic() - started_at:.1f}s)")
    return {
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "source": SOURCE_NAME,
        "sourceUrlPattern": SOURCE_URL_PATTERN,
        "stops": stops,
    }


def render_typescript(payload: dict[str, object]) -> str:
    body = json.dumps(payload, ensure_ascii=False, indent=2)
    return (
        'import type { GeneratedTrainTimetables } from "../../lib/transit";\n\n'
        "// This file is generated by scraiping/trainScheduleGetter.py.\n"
        "// Do not edit timetable values by hand.\n"
        f"export const generatedTrainTimetables: GeneratedTrainTimetables = {body};\n"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        default=str(Path(__file__).resolve().parents[1] / "src/data/generated/trainTimetables.ts"),
        help="Generated TypeScript output path.",
    )
    parser.add_argument("--delay", type=float, default=0.75, help="Delay between requests.")
    parser.add_argument("--timeout", type=int, default=15, help="HTTP timeout seconds.")
    parser.add_argument(
        "--html-file",
        help="Parse one saved timetable HTML file and print normalized times as JSON.",
    )
    args = parser.parse_args()

    if args.html_file:
        progress(f"保存済みHTMLを解析します: {args.html_file}")
        html = Path(args.html_file).read_text(encoding="utf-8")
        print(json.dumps(parse_timetable_times(html), ensure_ascii=False, indent=2))
        progress("保存済みHTMLの解析が完了しました")
        return 0

    payload = build_payload(delay_seconds=args.delay, timeout=args.timeout)
    output_path = Path(args.output)
    progress(f"生成ファイルを書き込みます: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(render_typescript(payload), encoding="utf-8")
    progress(f"生成完了: {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
