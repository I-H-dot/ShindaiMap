# GitHub Pagesへのデプロイ

神大Mapは、追加のホスティングサービスを契約せず、GitHub Pagesへ自動デプロイします。

## 公開先

- リポジトリ: `https://github.com/IshizukaHiroto/ShindaiMap`
- サイト: `https://ishizukahiroto.github.io/ShindaiMap/`
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
- Website restriction: `https://ishizukahiroto.github.io/ShindaiMap/*`
- API restrictions: Maps JavaScript API

設定したキーはGitHubリポジトリの`Settings > Secrets and variables > Actions > New repository secret`で、`PUBLIC_GOOGLE_MAPS_API_KEY`という名前のSecretとして登録してください。

## ローカルでPages向けビルドを確認する

```bash
GITHUB_ACTIONS=true \
GITHUB_REPOSITORY=IshizukaHiroto/ShindaiMap \
GITHUB_REPOSITORY_OWNER=IshizukaHiroto \
npm run build
```

生成される内部リンクとcanonical URLには`/ShindaiMap/`が付与されます。
