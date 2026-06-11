# -*- coding: utf-8 -*-
"""Fetch and normalize monthly train timetables for ShindaiMap.

The scraper targets the train stations used by the app and writes TypeScript
data that can be imported at build time.

日本語: ShindaiMap用の鉄道時刻表を取得し、ビルド時に読み込める
TypeScriptデータとして出力します。
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from html import unescape
from html.parser import HTMLParser
from pathlib import Path
from typing import Iterable, Sequence, TypeAlias
from urllib.request import Request, urlopen


ENCODING = "utf-8"
SOURCE_NAME = "Yahoo!路線情報"
SOURCE_URL_TEMPLATE = (
    "https://transit.yahoo.co.jp/timetable/"
    "{station_id}/{direction_id}/print?kind={day_kind}"
)
USER_AGENT = (
    "ShindaiMap monthly timetable updater "
    "(+https://github.com/I-H-dot/ShindaiMap)"
)
REQUEST_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept-Language": "ja,en;q=0.8",
}
DEFAULT_OUTPUT_PATH = (
    Path(__file__).resolve().parents[1] /
    "src/data/generated/trainTimetables.ts"
)
NEXT_DATA_SCRIPT_RE = re.compile(
    r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>',
    flags=re.DOTALL,
)
NUMBER_RE = re.compile(r"\d+")

Schedule: TypeAlias = dict[str, list[str]]
StopPayload: TypeAlias = dict[str, Schedule]
StopsPayload: TypeAlias = dict[str, StopPayload]
Payload: TypeAlias = dict[str, object]


STATION_IDS = {
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

DIRECTION_IDS = {
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

SERVICE_DAY_IDS = {
    "平日": 1,
    "土曜": 2,
    "日曜・祝日": 4,
}


@dataclass(frozen=True)
class DirectionTarget:
    """One app-facing train direction and its Yahoo timetable direction ID.

    日本語: アプリ上の方面ラベルとYahoo側の方面IDを表します。
    """

    app_label: str
    direction_id: int


@dataclass(frozen=True)
class StopTarget:
    """One train station target for timetable generation.

    日本語: 時刻表生成対象の駅と、その取得方面を表します。
    """

    app_stop_id: str
    station_name: str
    station_id: int
    directions: tuple[DirectionTarget, ...]


@dataclass(frozen=True)
class ServiceDayTarget:
    """One service-day variant in Yahoo timetable query parameters.

    日本語: 平日・土曜・日曜祝日などの運行日種別を表します。
    """

    key: str
    label: str
    day_kind: int


@dataclass
class ScrapeProgress:
    """Mutable progress counter shared across station and direction loops.

    日本語: 駅・方面・曜日種別をまたいだ取得進捗を
    管理します。
    """

    total_requests: int
    completed_requests: int = 0
    started_at: float = field(default_factory=time.monotonic)

    @property
    def next_request_number(self) -> int:
        """Return the one-based request number for the next fetch.

        日本語: 次に取得する1始まりのリクエスト番号を
        返します。
        """

        return self.completed_requests + 1

    @property
    def elapsed_seconds(self) -> float:
        """Return elapsed seconds since the scrape started.

        日本語: スクレイピング開始からの経過秒数を返します。
        """

        return time.monotonic() - self.started_at

    def mark_completed(self) -> None:
        """Increment the completed request counter.

        日本語: 完了済みリクエスト数を1件分進めます。
        """

        self.completed_requests += 1


def make_direction_target(
    app_label: str,
    source_label: str | None = None,
) -> DirectionTarget:
    """Create a direction target.

    日本語: アプリ表示用ラベルとYahoo側の方面IDを結び付けます。

    ``source_label`` is used when the app label is intentionally different from
    the label used in Yahoo timetable direction IDs.

    日本語: ``source_label`` は、アプリ表示ラベルとYahoo側ラベルが
    異なる場合に指定します。
    """

    direction_label = source_label or app_label
    return DirectionTarget(
        app_label=app_label,
        direction_id=DIRECTION_IDS[direction_label],
    )


def make_stop_target(
    app_stop_id: str,
    station_name: str,
    directions: tuple[DirectionTarget, ...],
) -> StopTarget:
    """Create a stop target from the shared station ID map.

    日本語: 共通の駅ID定義から、取得対象駅の定義を作ります。
    """

    return StopTarget(
        app_stop_id=app_stop_id,
        station_name=station_name,
        station_id=STATION_IDS[station_name],
        directions=directions,
    )


TRAIN_TARGETS: tuple[StopTarget, ...] = (
    make_stop_target(
        app_stop_id="jr-rokkomichi",
        station_name="六甲道",
        directions=(
            make_direction_target(
                "尼崎・大阪・京都方面",
                "米原・京都方面",
            ),
            make_direction_target(
                "三ノ宮・姫路方面",
                "西明石・網干方面",
            ),
        ),
    ),
    make_stop_target(
        app_stop_id="hankyu-rokko",
        station_name="六甲",
        directions=(
            make_direction_target("大阪梅田・西宮北口方面"),
            make_direction_target("神戸三宮・新開地方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="hanshin-mikage",
        station_name="御影(阪神)",
        directions=(
            make_direction_target("大阪梅田・尼崎方面"),
            make_direction_target("高速神戸・山陽姫路方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="hanshin-fukae",
        station_name="深江(兵庫県)",
        directions=(
            make_direction_target("大阪梅田・尼崎方面"),
            make_direction_target("高速神戸・御影方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="hanshin-shinzaike",
        station_name="新在家",
        directions=(
            make_direction_target("大阪梅田・尼崎方面"),
            make_direction_target("高速神戸・神戸三宮方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="kobekosoku-kosokukobe",
        station_name="高速神戸",
        directions=(
            make_direction_target("梅田(阪神)・神戸三宮(阪神)方面"),
            make_direction_target("梅田(阪急)・神戸三宮(阪急)方面"),
            make_direction_target("山陽姫路・新開地方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="jr-kobe",
        station_name="神戸",
        directions=(
            make_direction_target(
                "尼崎・大阪・京都方面",
                "米原・京都方面",
            ),
            make_direction_target("西明石・網干方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="subway-myodani",
        station_name="名谷",
        directions=(
            make_direction_target("谷上・新神戸方面"),
            make_direction_target("西神中央方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="subway-okurayama",
        station_name="大倉山",
        directions=(
            make_direction_target("谷上・新神戸方面"),
            make_direction_target("西神中央方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="portliner-minatojima",
        station_name="みなとじま",
        directions=(
            make_direction_target("三宮方面"),
            make_direction_target("神戸空港方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="portliner-keisan-kagaku-center",
        station_name="計算科学センター",
        directions=(
            make_direction_target("三宮方面"),
            make_direction_target("神戸空港方面"),
        ),
    ),
    make_stop_target(
        app_stop_id="portliner-iryo-center",
        station_name="医療センター",
        directions=(
            make_direction_target("三宮方面"),
            make_direction_target("神戸空港・計算科学センター方面"),
        ),
    ),
)

SERVICE_DAYS = (
    ServiceDayTarget("weekday", "平日", SERVICE_DAY_IDS["平日"]),
    ServiceDayTarget("saturday", "土曜", SERVICE_DAY_IDS["土曜"]),
    ServiceDayTarget("holiday", "日曜・祝日", SERVICE_DAY_IDS["日曜・祝日"]),
)


def log_progress(message: str) -> None:
    """Write progress logs to stderr so stdout stays usable for JSON output.

    日本語: JSON用の標準出力を汚さないよう、
    進捗を標準エラーに出します。
    """

    print(message, file=sys.stderr, flush=True)


def find_duplicates(values: Iterable[str]) -> list[str]:
    """Return sorted duplicate strings from an iterable.

    日本語: 文字列の列から、重複値だけをソートして返します。
    """

    seen: set[str] = set()
    duplicates: set[str] = set()

    for value in values:
        if value in seen:
            duplicates.add(value)
        seen.add(value)

    return sorted(duplicates)


def validate_train_targets() -> None:
    """Validate static timetable target definitions before network access.

    日本語: 取得前に、駅・方面の静的定義の不足や
    重複を検証します。
    """

    station_names = [target.station_name for target in TRAIN_TARGETS]
    app_stop_ids = [target.app_stop_id for target in TRAIN_TARGETS]
    target_station_names = set(station_names)

    errors: list[str] = []
    missing_station_names = sorted(set(STATION_IDS) - target_station_names)
    unknown_station_names = sorted(target_station_names - set(STATION_IDS))
    duplicate_station_names = find_duplicates(station_names)
    duplicate_app_stop_ids = find_duplicates(app_stop_ids)

    if missing_station_names:
        errors.append(
            "TRAIN_TARGETS に未登録の STATION_IDS 駅: "
            + ", ".join(missing_station_names)
        )
    if unknown_station_names:
        errors.append(
            "STATION_IDS に存在しない TRAIN_TARGETS 駅: "
            + ", ".join(unknown_station_names)
        )
    if duplicate_station_names:
        errors.append(
            "TRAIN_TARGETS の station_name 重複: "
            + ", ".join(duplicate_station_names)
        )
    if duplicate_app_stop_ids:
        errors.append(
            "TRAIN_TARGETS の app_stop_id 重複: "
            + ", ".join(duplicate_app_stop_ids)
        )

    if errors:
        message = "時刻表取得対象の定義に問題があります: "
        raise RuntimeError(message + "; ".join(errors))


def has_css_class(
    attrs: list[tuple[str, str | None]],
    expected_class_name: str,
) -> bool:
    """Return true when an HTML start-tag has the expected CSS class.

    日本語: HTML開始タグの属性に指定CSSクラスが
    含まれるかを返します。
    """

    class_name = dict(attrs).get("class", "") or ""
    return expected_class_name in class_name.split()


class TimetableHTMLParser(HTMLParser):
    """Fallback parser for Yahoo print tables when Next.js JSON is unavailable.

    日本語: Next.js JSONが使えない場合に、Yahoo印刷用HTML表から
    時刻を抽出するフォールバックパーサーです。
    """

    def __init__(self) -> None:
        """Initialize parser state for one HTML document.

        日本語: 1つのHTML文書を解析するための状態を
        初期化します。
        """

        super().__init__()
        self.times: list[str] = []
        self._current_hour: int | None = None
        self._hour_buffer: list[str] = []
        self._minute_buffer: list[str] = []
        self._in_hour_cell = False
        self._in_minute = False
        self._in_tbody = False
        self._seen_late_hour = False

    def handle_starttag(
        self,
        tag: str,
        attrs: list[tuple[str, str | None]],
    ) -> None:
        """Update parser state when an HTML start tag is encountered.

        日本語: HTML開始タグを見て、時刻セルや分セルの
        状態を更新します。
        """

        if tag == "tbody":
            self._in_tbody = True
            return

        if not self._in_tbody:
            return

        if tag == "td" and has_css_class(attrs, "col1"):
            self._in_hour_cell = True
            self._hour_buffer = []
            return

        if tag == "dt" and self._current_hour is not None:
            self._in_minute = True
            self._minute_buffer = []

    def handle_data(self, data: str) -> None:
        """Collect text data for the active hour or minute cell.

        日本語: 解析中の時セルまたは分セルの文字列を
        蓄積します。
        """

        if self._in_hour_cell:
            self._hour_buffer.append(data)
        if self._in_minute:
            self._minute_buffer.append(data)

    def handle_endtag(self, tag: str) -> None:
        """Finalize parser state when an HTML end tag is encountered.

        日本語: HTML終了タグを見て、時刻セルや分セルの
        結果を確定します。
        """

        if tag == "tbody":
            self._in_tbody = False
            self._current_hour = None
            return

        if tag == "tr" and self._in_tbody:
            self._current_hour = None
            return

        if tag == "td" and self._in_hour_cell:
            self._finish_hour_cell()
            return

        if tag == "dt" and self._in_minute:
            self._finish_minute_cell()

    def _finish_hour_cell(self) -> None:
        """Finalize the current hour cell.

        日本語: 現在の時セルを確定し、24時台表記も補正します。
        """

        hour = first_number("".join(self._hour_buffer))
        if hour is None:
            self._current_hour = None
        else:
            self._current_hour = 24 if hour == 0 and self._seen_late_hour else hour
            self._seen_late_hour = self._seen_late_hour or hour >= 23

        self._in_hour_cell = False

    def _finish_minute_cell(self) -> None:
        """Finalize the current minute cell and append a time when possible.

        日本語: 現在の分セルを確定し、時があれば
        時刻リストへ追加します。
        """

        minute = first_number("".join(self._minute_buffer))
        if minute is not None and self._current_hour is not None:
            self.times.append(to_clock(self._current_hour, minute))

        self._in_minute = False


def first_number(text: str) -> int | None:
    """Extract the first integer from text.

    日本語: 文字列から最初に現れる整数を取り出します。
    """

    match = NUMBER_RE.search(text)
    return int(match.group(0)) if match else None


def to_clock(hour: int, minute: int) -> str:
    """Convert hour and minute values to an HH:MM clock string.

    日本語: 時と分の数値を ``HH:MM`` 形式の文字列に変換します。
    """

    return f"{hour:02d}:{minute:02d}"


def minutes_since_midnight(time_value: str) -> int:
    """Convert an HH:MM clock string to minutes since midnight.

    日本語: ``HH:MM`` 形式の時刻を、深夜0時からの
    経過分にします。
    """

    hour, minute = [int(part) for part in time_value.split(":")]
    return hour * 60 + minute


def sort_unique_times(times: Iterable[str]) -> list[str]:
    """Deduplicate and sort timetable values chronologically.

    日本語: 時刻文字列の重複を取り除き、時刻順に並べます。
    """

    return sorted(set(times), key=minutes_since_midnight)


def parse_next_data_times(html: str) -> list[str]:
    """Extract timetable values from the embedded Next.js JSON payload.

    日本語: HTML内のNext.js JSONから時刻表データを抽出します。
    """

    match = NEXT_DATA_SCRIPT_RE.search(html)
    if not match:
        return []

    data = json.loads(unescape(match.group(1)))
    timetable_item = data.get("props", {}).get("pageProps", {}).get(
        "timetableItem",
        {},
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
    """Extract timetable values from the printable HTML table fallback.

    日本語: 印刷用HTMLテーブルから時刻表データを抽出します。
    """

    parser = TimetableHTMLParser()
    parser.feed(html)
    return sort_unique_times(parser.times)


def parse_timetable_times(html: str) -> list[str]:
    """Extract normalized timetable values from Yahoo timetable HTML.

    日本語: Yahoo時刻表HTMLから正規化済み時刻リストを
    抽出します。
    """

    return parse_next_data_times(html) or parse_table_times(html)


def timetable_url(station_id: int, direction_id: int, day_kind: int) -> str:
    """Build the Yahoo print timetable URL for one station/direction/day.

    日本語: 1駅・1方面・1曜日種別のYahoo印刷用URLを
    組み立てます。
    """

    return SOURCE_URL_TEMPLATE.format(
        station_id=station_id,
        direction_id=direction_id,
        day_kind=day_kind,
    )


def fetch_html(url: str, timeout: int) -> str:
    """Fetch one timetable HTML page.

    日本語: 指定URLから時刻表HTMLを1ページ取得します。
    """

    request = Request(url, headers=REQUEST_HEADERS)
    with urlopen(request, timeout=timeout) as response:
        return response.read().decode(ENCODING, errors="replace")


def count_directions() -> int:
    """Return the number of configured stop-direction pairs.

    日本語: 設定済みの駅・方面ペア数を返します。
    """

    return sum(len(stop.directions) for stop in TRAIN_TARGETS)


def count_timetable_requests() -> int:
    """Return the total number of Yahoo pages needed for one full scrape.

    日本語: 全件取得に必要なYahoo時刻表ページ数を返します。
    """

    return count_directions() * len(SERVICE_DAYS)


def fetch_service_day_times(
    stop: StopTarget,
    direction: DirectionTarget,
    service_day: ServiceDayTarget,
    timeout: int,
    scrape_progress: ScrapeProgress,
) -> list[str]:
    """Fetch and parse one station/direction/service-day timetable.

    日本語: 1駅・1方面・1曜日種別の時刻表を
    時刻リストに変換します。
    """

    url = timetable_url(
        station_id=stop.station_id,
        direction_id=direction.direction_id,
        day_kind=service_day.day_kind,
    )
    request_number = scrape_progress.next_request_number

    log_progress(
        f"[{request_number}/{scrape_progress.total_requests}] 取得開始: "
        f"{stop.station_name} / {direction.app_label} / {service_day.label}"
    )

    try:
        html = fetch_html(url, timeout=timeout)
        times = parse_timetable_times(html)
    except Exception as exc:
        log_progress(
            f"[{request_number}/{scrape_progress.total_requests}] 取得失敗: "
            f"{stop.station_name} / {direction.app_label} / "
            f"{service_day.label} ({exc})"
        )
        raise

    if not times:
        raise RuntimeError(
            f"時刻を取得できませんでした: {stop.station_name} "
            f"{direction.app_label} {service_day.label} {url}"
        )

    scrape_progress.mark_completed()
    log_progress(
        f"[{scrape_progress.completed_requests}/"
        f"{scrape_progress.total_requests}] 取得完了: "
        f"{stop.station_name} / {direction.app_label} / {service_day.label} "
        f"{len(times)}件 ({scrape_progress.elapsed_seconds:.1f}s)"
    )

    return times


def fetch_direction_schedule(
    stop: StopTarget,
    direction: DirectionTarget,
    delay_seconds: float,
    timeout: int,
    scrape_progress: ScrapeProgress,
) -> Schedule:
    """Fetch weekday, Saturday, and holiday schedules for one direction.

    日本語: 1方面について、平日・土曜・日曜祝日の
    時刻表を取得します。
    """

    schedule: Schedule = {}

    for service_day in SERVICE_DAYS:
        schedule[service_day.key] = fetch_service_day_times(
            stop=stop,
            direction=direction,
            service_day=service_day,
            timeout=timeout,
            scrape_progress=scrape_progress,
        )
        time.sleep(delay_seconds)

    # Existing app code can fall back to `weekend`; keep it as holiday data.
    schedule["weekend"] = schedule["holiday"]
    return schedule


def fetch_stop_payload(
    stop: StopTarget,
    delay_seconds: float,
    timeout: int,
    scrape_progress: ScrapeProgress,
) -> StopPayload:
    """Fetch all configured direction schedules for one station.

    日本語: 1つの駅に設定された全方面の時刻表を取得します。
    """

    log_progress(f"探索対象駅: {stop.station_name} ({stop.app_stop_id})")
    stop_payload: StopPayload = {}

    for direction in stop.directions:
        stop_payload[direction.app_label] = fetch_direction_schedule(
            stop=stop,
            direction=direction,
            delay_seconds=delay_seconds,
            timeout=timeout,
            scrape_progress=scrape_progress,
        )

    log_progress(f"駅の取得完了: {stop.station_name}")
    return stop_payload


def build_payload(delay_seconds: float, timeout: int) -> Payload:
    """Fetch every configured timetable and build the generated data payload.

    日本語: 設定済みの全時刻表を取得し、生成用payloadを
    作ります。
    """

    validate_train_targets()
    scrape_progress = ScrapeProgress(total_requests=count_timetable_requests())

    log_progress(
        f"時刻表取得を開始します: {len(TRAIN_TARGETS)}駅 / "
        f"{count_directions()}方面 / {scrape_progress.total_requests}ページ"
    )

    stops: StopsPayload = {}
    for stop in TRAIN_TARGETS:
        stops[stop.app_stop_id] = fetch_stop_payload(
            stop=stop,
            delay_seconds=delay_seconds,
            timeout=timeout,
            scrape_progress=scrape_progress,
        )

    log_progress(
        f"すべての時刻表取得が完了しました "
        f"({scrape_progress.elapsed_seconds:.1f}s)"
    )

    return {
        "updatedAt": datetime.now(tz=timezone.utc).isoformat(timespec="seconds"),
        "source": SOURCE_NAME,
        "sourceUrlPattern": SOURCE_URL_TEMPLATE,
        "stops": stops,
    }


def render_typescript(payload: Payload) -> str:
    """Render the generated payload as a typed TypeScript module.

    日本語: 生成payloadを型付きTypeScriptモジュール文字列に
    整形します。
    """

    body = json.dumps(payload, ensure_ascii=False, indent=2)
    return (
        'import type { GeneratedTrainTimetables } from "../../lib/transit";\n\n'
        "// This file is generated by scraiping/trainScheduleGetter.py.\n"
        "// Do not edit timetable values by hand.\n"
        f"export const generatedTrainTimetables: GeneratedTrainTimetables = {body};\n"
    )


def parse_args(argv: Sequence[str] | None = None) -> argparse.Namespace:
    """Parse CLI arguments.

    日本語: コマンドライン引数を解析します。
    """

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_PATH),
        help="Generated TypeScript output path.",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.75,
        help="Delay between requests.",
    )
    parser.add_argument(
        "--timeout",
        type=int,
        default=15,
        help="HTTP timeout seconds.",
    )
    parser.add_argument(
        "--html-file",
        help="Parse one saved timetable HTML file and print normalized times as JSON.",
    )
    return parser.parse_args(argv)


def run_html_file_mode(html_file: str) -> int:
    """Parse one saved HTML file and write normalized times to stdout.

    日本語: 保存済みHTMLを1件解析し、正規化時刻を
    標準出力します。
    """

    log_progress(f"保存済みHTMLを解析します: {html_file}")
    html = Path(html_file).read_text(encoding=ENCODING)
    print(json.dumps(parse_timetable_times(html), ensure_ascii=False, indent=2))
    log_progress("保存済みHTMLの解析が完了しました")
    return 0


def run_generation_mode(output: str, delay: float, timeout: int) -> int:
    """Fetch live timetables and write the generated TypeScript file.

    日本語: ライブ時刻表を取得し、生成TypeScriptファイルを
    書き出します。
    """

    payload = build_payload(delay_seconds=delay, timeout=timeout)
    output_path = Path(output)

    log_progress(f"生成ファイルを書き込みます: {output_path}")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(render_typescript(payload), encoding=ENCODING)
    log_progress(f"生成完了: {output_path}")
    return 0


def main(argv: Sequence[str] | None = None) -> int:
    """CLI entrypoint.

    日本語: CLI実行時の入口です。
    """

    args = parse_args(argv)

    if args.html_file:
        return run_html_file_mode(args.html_file)

    return run_generation_mode(
        output=args.output,
        delay=args.delay,
        timeout=args.timeout,
    )


if __name__ == "__main__":
    raise SystemExit(main())
