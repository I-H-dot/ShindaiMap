# GitHub Pagesへのデプロイ

神大Mapは、追加のホスティングサービスを契約せず、GitHub Pagesへ自動デプロイします。

## 公開先

- リポジトリ: `https://github.com/I-H-dot/ShindaiMap`
- サイト: `https://i-h-dot.github.io/ShindaiMap/`
- デプロイ元: `main`ブランチ
- ワークフロー: `.github/workflows/deploy.yml`

## 初回だけ必要な操作

1. GitHubでリポジトリを開きます。
2. `Settings > Pages`を開きます。
3. `Build and deployment > Source`で`GitHub Actions`を選択します。
4. リポジトリを公開する場合は、`Settings > General > Danger Zone > Change repository visibility`から`Public`へ変更します。

その後は`main`ブランチへプッシュするたびに自動デプロイされます。進行状況はリポジトリの`Actions`タブにある`Deploy to GitHub Pages`で確認できます。

## Google Mapsを有効にする場合

初回公開では設定不要です。APIキー未設定時は同梱のフォールバック地図で動作します。

Google Mapsを有効にする場合だけ、Google Cloud Consoleでブラウザー用APIキーを作成し、次の制限を設定してください。

- Application restrictions: Websites
- Website restriction: `https://i-h-dot.github.io/ShindaiMap/*`
- API restrictions: Maps JavaScript API

設定したキーはGitHubリポジトリの`Settings > Secrets and variables > Actions > Secrets > New repository secret`で、`PUBLIC_GOOGLE_MAPS_API_KEY`という名前のSecretとして登録してください。

キーの制限を確認した後、同じ画面の`Variables > New repository variable`で次を登録すると、次回デプロイからGoogle Mapsが有効になります。

- Name: `ENABLE_GOOGLE_MAPS`
- Value: `true`

`ENABLE_GOOGLE_MAPS`が未設定または`true`以外の場合、Secretを登録済みでも公開ビルドには含めず、フォールバック地図を使用します。

## ローカルでPages向けビルドを確認する

```bash
GITHUB_ACTIONS=true \
GITHUB_REPOSITORY=I-H-dot/ShindaiMap \
GITHUB_REPOSITORY_OWNER=I-H-dot \
npm run build
```

生成される内部リンクとcanonical URLには`/ShindaiMap/`が付与されます。
