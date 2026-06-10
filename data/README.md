# データについて

神大Mapは、施設名、カテゴリ、案内文、座標などの静的データを同梱しています。

## 構成

- `../src/data/officialFacilities.ts`: 公式地図番号に対応する座標データ
- `../src/data/facilities.ts`: 案内文などを含む手動管理データ
- `../src/data/generated/trainTimetables.ts`: 月次取得で生成する鉄道時刻表データ

座標データは型付きTypeScriptとして直接管理します。各レコードには施設ID、名称、キャンパス、緯度、経度、出典区分、任意の公式地図番号だけを記述します。共通の説明文や検索タグは同じファイル内で組み立てるため、Excelや生成スクリプトは使用しません。

## 主な参照先

- [神戸大学 六甲台第1キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai1/)
- [神戸大学 六甲台第2キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai2/)
- [神戸大学 鶴甲第1キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto1/)
- [神戸大学 鶴甲第2キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto2/)
- [神戸大学 その他の地区](https://www.kobe-u.ac.jp/ja/campus-life/general/access/other/)
- [神戸大学海洋政策科学部 アクセス](https://www.ocean.kobe-u.ac.jp/access)

このプロジェクトは神戸大学の非公式プロジェクトです。施設名、公式ページの文章・画像、ロゴ、商標などの第三者権利は、リポジトリのMIT Licenseによって再許諾されるものではありません。

## 交通時刻データ

交通カードのバス発車時刻は、代表的な運行間隔から作った目安です。鉄道の発車時刻は、取得元の再利用条件を満たすことを確認したうえで、月次生成データとしてアプリ内表示します。生成済みデータがない方面は、駅ページまたは方面別の公式時刻表リンクへ誘導します。

鉄道時刻をアプリ内表示へ追加・更新する場合は、次のいずれかを満たしてください。

- 事業者またはデータ提供元から、アプリ内表示・加工・再配布が許可されたデータを使う。
- ODPTやGTFSなど、対象事業者の時刻表データを利用できるライセンスとAPIキーを明記する。
- 出典、ライセンス、確認日、更新方法をPull Requestに記載する。

月次取得は[`../scraiping/try.py`](../scraiping/try.py)で実行します。GitHub Actionsの[`../.github/workflows/update-train-timetables.yml`](../.github/workflows/update-train-timetables.yml)が毎月1日に生成ファイルを更新します。手元で更新する場合は`npm run scrape:train-timetables`を実行してください。

## 変更方針

- 公開情報または現地確認に基づき、出典と確認日をPull Requestへ記載してください。
- 個人情報、非公開の研究室情報、立入制限区域の詳細などは追加しないでください。
- 災害時の避難経路やバリアフリー経路など、安全に関わる情報は公式情報を優先してください。
- 座標データを更新した後は`npm run check`を実行してください。
