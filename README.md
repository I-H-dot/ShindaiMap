# 神大Map

[![CI](https://github.com/I-H-dot/ShindaiMap/actions/workflows/ci.yml/badge.svg)](https://github.com/I-H-dot/ShindaiMap/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[神大Mapを開く](https://i-h-dot.github.io/ShindaiMap/)

神戸大学の公式地図番号、教室、図書館、トイレ、休憩場所、ラーニングコモンズ、ATM、ポスト、バス停などを1画面で探すためのWebマップです。

> [!IMPORTANT]
> 神大Mapは有志による非公式プロジェクトです。神戸大学が運営・保証するサービスではありません。重要な移動や施設利用の前には、大学の公式案内も確認してください。

## 主な機能

- 施設名、別名、タグによる検索
- キャンパス・カテゴリによる絞り込み
- 施設の選択と外部地図リンク
- 現在地表示と徒歩ルート案内、音声案内、ルート逸脱時の再検索
- 神戸市バス、JR、阪急電鉄、阪神電鉄、神戸市営地下鉄、ポートライナーの最寄り交通カード
- キャンパス最寄りのバス停の目安時刻表示と、月次更新の駅方面別時刻表
- Google Maps APIキー未設定時のフォールバック地図
- Gitで管理する静的施設データ
- GitHub Issueによる情報修正の受付
- カテゴリ別の静的ページ

## 技術スタック

- Astro + TypeScript
- React
- Google Maps JavaScript API（任意）
- Vitest

## セットアップ

必要な環境はNode.js 22以上です。

```bash
git clone https://github.com/I-H-dot/ShindaiMap.git
cd ShindaiMap
npm ci
npm run dev
```

同梱した静的データとフォールバック地図だけで動作します。ブラウザで`http://localhost:4321`を開いてください。
交通カードのバス発車時刻は目安です。電車は生成済みの月次時刻表データがある方面だけアプリ内に表示し、未取得の方面は公式時刻表リンクへ誘導します。

## 環境変数

| 変数 | 必須 | 用途 |
| --- | --- | --- |
| `SITE_ORIGIN` | 本番のみ | canonical URLとサイトマップの生成元 |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | 任意 | Google Maps JavaScript API |

Google Mapsを表示する場合だけ、`.env.example`を`.env`へコピーしてAPIキーを設定してください。

## データ更新

公式地図番号、AED、画像由来POI、交通拠点の座標は`src/data/*.json`で管理し、TypeScript側でアプリ用データへ変換します。鉄道時刻表は`npm run scrape:train-timetables`で[`src/data/generated/trainTimetables.ts`](src/data/generated/trainTimetables.ts)を生成します。変更後は`npm run check`を実行してください。データの出典と取り扱いは[`data/README.md`](data/README.md)を参照してください。

## 検証

```bash
npm run check
```

このコマンドでテスト、型チェック、静的ビルドを実行します。CIでも同じ検証を行います。

## デプロイ

`main`ブランチへプッシュすると、GitHub ActionsがGitHub Pagesへ自動デプロイします。

公開先は`https://i-h-dot.github.io/ShindaiMap/`です。初回だけGitHubリポジトリの`Settings > Pages > Build and deployment > Source`で`GitHub Actions`を選択してください。

Google Maps APIキーを設定しなくてもフォールバック地図で動作します。公開手順と任意のGoogle Maps設定は[`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)を参照してください。

## コントリビューション

IssueやPull Requestを歓迎します。作業前に[`CONTRIBUTING.md`](CONTRIBUTING.md)と[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)を確認してください。脆弱性は公開Issueではなく[`SECURITY.md`](SECURITY.md)の手順で報告してください。

公開リポジトリへ切り替える前に、メンテナーは[`docs/PUBLISHING.md`](docs/PUBLISHING.md)のチェックリストも確認してください。

## ライセンス

ソースコードは[MIT License](LICENSE)で公開します。施設名、出典元コンテンツ、商標などの第三者権利はMIT Licenseの対象ではありません。詳細は[`data/README.md`](data/README.md)を参照してください。
