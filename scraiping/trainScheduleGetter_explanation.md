# trainScheduleGetter.py 説明

`trainScheduleGetter.py` は、ShindaiMapで使う鉄道駅の時刻表をYahoo!路線情報から取得し、アプリが読み込めるTypeScriptデータへ変換するスクリプトです。

主な出力先は `src/data/generated/trainTimetables.ts` です。`--html-file` を指定した場合は、保存済みHTMLを1件だけ解析して、正規化済みの時刻リストをJSONとして標準出力します。

## 全体像

- `TRAIN_TARGETS` に、取得対象の駅と方面を定義する。
- `SERVICE_DAYS` に、平日・土曜・日曜祝日の取得種別を定義する。
- 通常実行では、駅、方面、曜日種別の組み合わせごとにYahoo!路線情報の印刷用時刻表ページを取得する。
- 取得したHTMLは、まずNext.jsの `__NEXT_DATA__` から時刻を抽出する。
- `__NEXT_DATA__` が使えない場合は、`TimetableHTMLParser` でHTML表を直接解析する。
- 全駅分の時刻表をpayloadにまとめ、TypeScriptの定数として書き出す。

## クラス図

```mermaid
classDiagram
    direction LR

    class DirectionTarget {
        <<dataclass_frozen>>
        +str app_label
        +int direction_id
    }

    class StopTarget {
        <<dataclass_frozen>>
        +str app_stop_id
        +str station_name
        +int station_id
        +tuple~DirectionTarget~ directions
    }

    class HTMLParser {
        <<standard_library>>
    }

    class TimetableHTMLParser {
        +list~str~ times
        -bool _in_tbody
        -bool _in_hour_cell
        -bool _in_minute
        -list~str~ _hour_buffer
        -list~str~ _minute_buffer
        -int_or_None _current_hour
        -bool _seen_late_hour
        +handle_starttag(tag, attrs)
        +handle_data(data)
        +handle_endtag(tag)
    }

    class TRAIN_TARGETS {
        <<constant_tuple>>
        +list~StopTarget~ values
    }

    HTMLParser <|-- TimetableHTMLParser
    StopTarget "1" *-- "0..*" DirectionTarget : directions
    TRAIN_TARGETS o-- StopTarget : contains
```

## 通常実行時の処理フロー

```mermaid
flowchart TD
    A["python scraiping/trainScheduleGetter.py"] --> B["main(): argparseで引数を解析"]
    B --> C{"--html-file の指定がある?"}

    C -- "Yes" --> D["指定HTMLファイルを読み込む"]
    D --> E["parse_timetable_times(html)"]
    E --> F["正規化済み時刻リストをJSONで標準出力"]
    F --> Z["終了"]

    C -- "No" --> G["build_payload(delay, timeout)"]
    G --> H["TRAIN_TARGETS の各駅を処理"]
    H --> I["駅に紐づく各方面を処理"]
    I --> J["SERVICE_DAYS の各曜日種別を処理"]
    J --> K["timetable_url() で取得URLを生成"]
    K --> L["fetch_html() でYahoo!路線情報のHTMLを取得"]
    L --> M["parse_timetable_times() で時刻を抽出"]
    M --> N{"時刻を取得できた?"}
    N -- "No" --> O["RuntimeErrorで停止"]
    N -- "Yes" --> P["schedule[service_key] に時刻リストを保存"]
    P --> Q["delay秒待機"]
    Q --> R{"残りの曜日種別がある?"}
    R -- "Yes" --> J
    R -- "No" --> S["holidayをweekendにもコピー"]
    S --> T["stop_payload[direction_label] に保存"]
    T --> U{"残りの方面がある?"}
    U -- "Yes" --> I
    U -- "No" --> V["stops[app_stop_id] に保存"]
    V --> W{"残りの駅がある?"}
    W -- "Yes" --> H
    W -- "No" --> X["updatedAt/source/sourceUrlPattern/stops を持つpayloadを返す"]
    X --> Y["render_typescript(payload)"]
    Y --> AA["出力先ディレクトリを作成"]
    AA --> AB["trainTimetables.ts にTypeScript定数を書き込む"]
    AB --> Z
```

## HTML解析フロー

```mermaid
flowchart TD
    A["parse_timetable_times(html)"] --> B["parse_next_data_times(html)"]
    B --> C{"__NEXT_DATA__ が見つかり、時刻を抽出できた?"}
    C -- "Yes" --> D["hourTimeTable から hour/minute を読む"]
    D --> E["to_clock(hour, minute) で HH:MM に変換"]
    E --> F["sort_unique_times() で重複排除して時刻順に並べる"]
    F --> Z["時刻リストを返す"]

    C -- "No" --> G["parse_table_times(html)"]
    G --> H["TimetableHTMLParser.feed(html)"]
    H --> I["tbody内の td.col1 から時を読む"]
    I --> J["dt から分を読む"]
    J --> K["0時が23時以降に出た場合は24時として扱う"]
    K --> L["to_clock() で HH:MM に変換し times に追加"]
    L --> M["sort_unique_times() で重複排除して時刻順に並べる"]
    M --> Z
```

## 主要な関数の役割

| 関数 | 役割 |
| --- | --- |
| `progress()` | 進捗メッセージを標準エラーに出す。 |
| `to_clock()` | 時・分の数値を `HH:MM` 形式にする。 |
| `sort_unique_times()` | 時刻文字列の重複を消し、分換算で昇順に並べる。 |
| `parse_next_data_times()` | HTML内のNext.js JSONから時刻表を抽出する。 |
| `parse_table_times()` | HTML表を `TimetableHTMLParser` で解析する。 |
| `parse_timetable_times()` | Next.js JSON解析を優先し、失敗時にHTML表解析へフォールバックする。 |
| `timetable_url()` | 駅ID、方面ID、曜日種別からYahoo!路線情報の印刷用URLを組み立てる。 |
| `fetch_html()` | User-AgentなどのHTTPヘッダーを付けてHTMLを取得する。 |
| `build_payload()` | 全駅・全方面・全曜日種別を取得して、出力用payloadを作る。 |
| `render_typescript()` | payloadをTypeScriptの `generatedTrainTimetables` 定数へ整形する。 |
| `main()` | CLI引数を処理し、HTML単体解析またはTypeScript生成を実行する。 |

## 出力データ構造

```text
payload
├── updatedAt: UTCの生成日時
├── source: "Yahoo!路線情報"
├── sourceUrlPattern: 取得元URLのパターン
└── stops
    └── [app_stop_id]
        └── [direction_label]
            ├── weekday: 平日時刻リスト
            ├── saturday: 土曜時刻リスト
            ├── holiday: 日曜・祝日時刻リスト
            └── weekend: holidayと同じ時刻リスト
```

`weekend` は既存のアプリ側コードが参照できるように、`holiday` と同じ内容をコピーしています。
