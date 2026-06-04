# OSS公開チェックリスト

リポジトリを公開へ切り替える前に、メンテナーが一度確認する項目です。

## 外部サービス

- 過去のコミットには、開発時に使っていたFirebase Webアプリ設定とプロジェクトIDが含まれています。公開前にFirebase側で対象設定を無効化し、Git履歴から削除してください。
- 本番用Google Maps APIキーには、HTTPリファラーと利用APIの制限を設定してから、Actions変数`ENABLE_GOOGLE_MAPS=true`で有効化してください。

## GitとGitHub

- Git履歴に含まれるコミット作成者メールアドレスを公開してよいか確認してください。
- GitHubのPrivate vulnerability reporting、Dependabot alerts、secret scanningを有効化してください。
- `main`ブランチを保護し、Pull Requestと`CI`チェックを必須にしてください。
- Actionsの既定権限は読み取りを基本にし、必要なワークフローだけ個別に権限を付与してください。

## 権利と表記

- [`data/README.md`](../data/README.md)に記載した出典と、元データを再配布できる権利を確認してください。
- 神戸大学の名称、商標、公式コンテンツとの関係が誤認されないよう、非公式プロジェクト表記を維持してください。
- MIT Licenseを適用できるコードと、第三者権利が残るデータ・コンテンツを区別してください。

## 最終確認

```bash
npm ci
npm run check
GITHUB_ACTIONS=true GITHUB_REPOSITORY=IshizukaHiroto/ShindaiMap GITHUB_REPOSITORY_OWNER=IshizukaHiroto npm run build
npm audit --audit-level=moderate
```

加えて、追跡対象ファイルとGit履歴の秘密情報スキャンを行い、`.env`、サービスアカウント鍵、個人情報が含まれていないことを確認してください。
