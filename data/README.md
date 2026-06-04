# データについて

神大Mapは、施設名、カテゴリ、案内文、座標などの静的データを同梱しています。

## 構成

- `../src/data/officialFacilities.ts`: 公式地図番号に対応する座標データ
- `../src/data/facilities.ts`: 案内文などを含む手動管理データ

座標データは型付きTypeScriptとして直接管理します。各レコードには施設ID、名称、キャンパス、緯度、経度、出典区分、任意の公式地図番号だけを記述します。共通の説明文や検索タグは同じファイル内で組み立てるため、Excelや生成スクリプトは使用しません。

## 主な参照先

- [神戸大学 六甲台第1キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai1/)
- [神戸大学 六甲台第2キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai2/)
- [神戸大学 鶴甲第1キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto1/)
- [神戸大学 鶴甲第2キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto2/)
- [神戸大学 その他の地区](https://www.kobe-u.ac.jp/ja/campus-life/general/access/other/)
- [神戸大学海洋政策科学部 アクセス](https://www.ocean.kobe-u.ac.jp/access)

このプロジェクトは神戸大学の非公式プロジェクトです。施設名、公式ページの文章・画像、ロゴ、商標などの第三者権利は、リポジトリのMIT Licenseによって再許諾されるものではありません。

## 変更方針

- 公開情報または現地確認に基づき、出典と確認日をPull Requestへ記載してください。
- 個人情報、非公開の研究室情報、立入制限区域の詳細などは追加しないでください。
- 災害時の避難経路やバリアフリー経路など、安全に関わる情報は公式情報を優先してください。
- 座標データを更新した後は`npm run check`を実行してください。
