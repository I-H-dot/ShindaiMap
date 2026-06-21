# データについて

神大Mapは、施設名、カテゴリ、案内文、座標などの静的データを同梱しています。

## 構成

- `../src/data/officialFacilities.json`: 公式地図番号に対応する座標データ
- `../src/data/aedLocations.json`: AED設置場所一覧に対応する建物代表座標データ
- `../src/data/mapFeatures.json`: 公式キャンパスマップ画像のアイコンから変換した駐輪場、ATM、階段、傾斜道などの座標データ
- `../src/data/transitStops.json`: バス停・鉄道駅の座標、時刻表リンク、検索用メタデータ
- `../src/data/officialFacilities.ts`: 公式地図番号データをアプリ用の施設データに変換する薄い変換層
- `../src/data/facilities.ts`: JSON化した公式データをアプリ用の施設データに統合する薄い合成層
- `../src/data/generated/trainTimetables.ts`: 月次取得で生成する鉄道時刻表データ

座標データは`src/data/*.json`に分離して管理します。公式地図番号のピンは`officialFacilities.json`、AEDは`aedLocations.json`、キャンパスマップ画像のアイコン由来POIは`mapFeatures.json`、交通カードと地図に出すバス停・鉄道駅は`transitStops.json`を編集してください。各レコードには施設ID、名称、キャンパス、緯度、経度、出典区分、任意の公式地図番号や設置場所情報だけを記述します。仮置きのローカル座標データは`facilities`の出力に含めず、共通の説明文や検索タグはTypeScript側で組み立てます。

## 出典メタデータ

`src/data`の施設/AED/交通データは、変換後の`Facility`または`TransitStop`で次の出典メタデータを必ず持ちます。

- `sourceType`: 出典種別。現在は`official-page`、`official-pdf`、`official-campus-map`、`official-map-image`、`official-transit`、`generated-transit`、`field-survey`、`community-report`を使えます。
- `sourceName`: ユーザーに表示する出典名。
- `sourceUrl`: 公式ページ、PDF、停留所ページ、駅ページなど、確認に使ったURL。公開URLがない現地確認だけ任意です。
- `verifiedAt`: ShindaiMap側でその出典を確認した日付。`YYYY-MM-DD`で記録します。
- `confidence`: 位置や設置情報への信頼度。`high`は公式番号・公式停留所地図などの直接根拠、`medium`は公式画像からの座標変換や建物代表点、`low`は限定的な根拠、`unverified`は表示前の未確認候補に使います。
- `sourceNote`: RMSE、建物代表点、基準日など、画面にも出してよい短い補足。

既存JSONは、`sourceArea`、`positionSourceUrl`、`positionSourceName`、`updatedAt`などから`src/data/sourceMetadata.ts`と各変換層がメタデータを補完します。公式データを差し替えるときは、可能ならJSONレコード側に`sourceType`、`sourceName`、`sourceUrl`、`verifiedAt`、`confidence`を明示してください。個別レコードに明示した値は既定値より優先されます。

`updatedAt`と`source`は既存コードとの互換用に残します。新しい実装やUIでは、原則として`verifiedAt`、`sourceName`、`sourceUrl`、`confidence`を参照してください。

`mapFeatures.json`は手書きではなく、公式画像上のピクセル座標と番号付き施設ピンの制御点から[`../scripts/generate-map-features.py`](../scripts/generate-map-features.py)で生成します。アイコンを追加・修正する場合は、同スクリプト内の`FEATURES`に画像上の中心座標を追加し、生成後の`transformRmseMeters`を確認してください。

AEDは公開されている神戸大学AED設置場所一覧に記載されたものを`aedLocations.json`へ入れます。座標は公式番号施設に対応するものは施設代表点を使い、公式番号施設に対応しないものはAEDマップ画像上のアイコン中心を公式番号ピン制御点で座標変換します。2025年3月24日現在の公開一覧と楠地区キャンパスマップには楠地区のAED設置場所が載っていないため、楠地区のAEDピンは未確認データとして追加しません。

バス停の座標は`transitStops.json`で管理します。神戸市バスの停留所は、神戸市交通局の停留所情報ページに埋め込まれている公式地図座標を使い、各レコードの`positionSourceUrl`と`positionSourceName`へ出典を残してください。

## 主な参照先

- [神戸大学 六甲台第1キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai1/)
- [神戸大学 六甲台第2キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai2/)
- [神戸大学 鶴甲第1キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto1/)
- [神戸大学 鶴甲第2キャンパス](https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto2/)
- [神戸大学 楠地区](https://www.kobe-u.ac.jp/ja/campus-life/general/access/kusunoki/campusmap/)
- [神戸大学 名谷地区](https://www.kobe-u.ac.jp/ja/campus-life/general/access/myodani/campusmap/)
- [神戸大学 深江地区](https://www.kobe-u.ac.jp/ja/campus-life/general/access/fukae/campusmap/)
- [神戸大学 その他の地区](https://www.kobe-u.ac.jp/ja/campus-life/general/access/other/)
- [神戸大学海洋政策科学部 アクセス](https://www.ocean.kobe-u.ac.jp/access)
- [神戸大学AED設置場所一覧](https://www.kobe-u.ac.jp/sites/default/files/doc-page/2025-03/aed_all_20240324.pdf)
- [神戸市交通局 停留所一覧](https://kotsu.city.kobe.lg.jp/bus/bus-stop-list/)

このプロジェクトは神戸大学の非公式プロジェクトです。施設名、公式ページの文章・画像、ロゴ、商標などの第三者権利は、リポジトリのMIT Licenseによって再許諾されるものではありません。

## 交通時刻データ

交通カードのバス発車時刻は、代表的な運行間隔から作った目安です。鉄道の発車時刻は、取得元の再利用条件を満たすことを確認したうえで、月次生成データとしてアプリ内表示します。生成済みデータがない方面は、駅ページまたは方面別の公式時刻表リンクへ誘導します。

鉄道時刻をアプリ内表示へ追加・更新する場合は、次のいずれかを満たしてください。

- 事業者またはデータ提供元から、アプリ内表示・加工・再配布が許可されたデータを使う。
- ODPTやGTFSなど、対象事業者の時刻表データを利用できるライセンスとAPIキーを明記する。
- 出典、ライセンス、確認日、更新方法をPull Requestに記載する。

月次取得は[`../scraiping/trainScheduleGetter.py`](../scraiping/trainScheduleGetter.py)で実行します。GitHub Actionsの[`../.github/workflows/update-train-timetables.yml`](../.github/workflows/update-train-timetables.yml)が毎月1日に生成ファイルを更新します。手元で更新する場合は`npm run scrape:train-timetables`を実行してください。

## 変更方針

- 公開情報または現地確認に基づき、出典と確認日をPull Requestへ記載してください。
- データを追加・差し替えたレコードには、`sourceType`、`sourceName`、`sourceUrl`、`verifiedAt`、`confidence`を確認し、既定値で十分でない場合はJSON側で明示してください。
- `confidence`を`high`にできるのは、公式番号、公式AED一覧、公式停留所地図、事業者駅ページなど、対象物と位置が直接確認できる場合だけです。画像変換、建物代表点、時刻表生成データは根拠を`sourceNote`へ残してください。
- 公式キャンパスマップ画像から座標を更新する場合は、`scripts/audit-official-map-data.py`で公式番号表との差分と画像上の検出根拠を確認してください。
- 駐輪場、駐車場、階段、急な傾斜道などの画像アイコン由来POIを更新する場合は、`scripts/generate-map-features.py`で再生成し、JSONに画像ピクセルと変換RMSEを残してください。
- 個人情報、非公開の研究室情報、立入制限区域の詳細などは追加しないでください。
- 災害時の避難経路やバリアフリー経路など、安全に関わる情報は公式情報を優先してください。
- 座標データを更新した後は`npm run check`を実行してください。
