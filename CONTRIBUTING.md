# コントリビューションガイド

神大MapへのIssueとPull Requestを歓迎します。参加時は[`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)に従ってください。

## Issueを作成する前に

- 既存Issueに同じ内容がないか確認してください。
- 施設情報の修正では、対象施設、根拠となる公開情報、確認日を記載してください。
- セキュリティ上の問題は公開Issueに書かず、[`SECURITY.md`](SECURITY.md)の手順で報告してください。

## 開発環境

```bash
npm ci
npm run dev
```

Google Mapsの確認が必要な場合だけ、`.env.example`を`.env`へコピーして、自分で管理する開発用APIキーを設定してください。

## データ変更

座標データを変更する場合は[`data/README.md`](data/README.md)を確認し、出典と確認日をPull Requestに記載してください。

```bash
npm run check
```

公式地図番号に対応する施設は`src/data/officialFacilities.ts`の座標レコードを直接編集してください。

## Pull Request

1. 変更は1つの目的に絞ってください。
2. 必要なテストを追加または更新してください。
3. `npm run check`が成功することを確認してください。
4. UI変更では、確認した画面幅や操作を説明してください。
5. 新しい依存関係や外部サービスを追加する場合は、必要性と公開リスクを説明してください。

Pull Requestを送ることで、自分がその変更を提供する権利を持ち、プロジェクトのMIT Licenseで提供することに同意したものとみなします。
