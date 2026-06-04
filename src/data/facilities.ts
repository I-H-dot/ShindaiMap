import type { CampusName, Facility } from "../lib/types";
import { officialFacilities } from "./officialFacilities";

export const campusCenters: Record<CampusName, { lat: number; lng: number; label: string }> = {
  六甲台第1: { lat: 34.72482, lng: 135.23553, label: "六甲台第1キャンパス" },
  六甲台第2: { lat: 34.72695, lng: 135.23512, label: "六甲台第2キャンパス" },
  鶴甲第1: { lat: 34.73024, lng: 135.22991, label: "鶴甲第1キャンパス" },
  鶴甲第2: { lat: 34.7264, lng: 135.22575, label: "鶴甲第2キャンパス" },
  楠: { lat: 34.68545, lng: 135.1709, label: "楠キャンパス" },
  深江: { lat: 34.71678, lng: 135.29238, label: "深江キャンパス" },
  名谷: { lat: 34.6812, lng: 135.0948, label: "名谷キャンパス" },
  その他: { lat: 34.7265, lng: 135.235, label: "その他の地区" }
};

const officialCampusLinks = {
  rokkodai1: "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai1/",
  rokkodai2: "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/rokkodai2/",
  tsurukabuto1: "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto1/",
  tsurukabuto2: "https://www.kobe-u.ac.jp/ja/campus-life/general/access/rokko/tsurukabuto2/",
  fukae: "https://www.ocean.kobe-u.ac.jp/access",
  myodani: "https://www.kobe-u.ac.jp/ja/campus-life/general/access/other/"
};

const featuredFacilities: Facility[] = [
  {
    id: "rokkodai-main-gate",
    name: "神大正門前・六甲台第1入口",
    category: "route",
    campus: "六甲台第1",
    area: "正門",
    position: { lat: 34.72415, lng: 135.23498 },
    summary: "六甲台第1キャンパスへ入るときの主要な目印。",
    description: "市バス36系統の神大正門前から法・経済・経営系の学舎へ向かう入口です。坂道と階段があるため、雨の日や荷物が多い日は時間に余裕を持つと安全です。",
    aliases: ["神大正門前", "正門", "六甲台入口", "法学部入口"],
    tags: ["入口", "バス", "坂道", "六甲台"],
    routeHint: "阪急六甲、JR六甲道、阪神御影方面から市バス36系統で神大正門前下車。",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus access pages and local seed data"
  },
  {
    id: "rokkodai-social-library",
    name: "社会科学系図書館",
    category: "library",
    campus: "六甲台第1",
    area: "六甲台第1 中央",
    position: { lat: 34.72492, lng: 135.23529 },
    summary: "法・経済・経営系の資料を探しやすい図書館。",
    description: "六甲台第1キャンパスの中心にある図書館です。講義の合間に資料確認、自習、レポート作成をしたいときの起点になります。",
    aliases: ["社科図", "社会科学図書館", "六甲台図書館"],
    tags: ["図書館", "自習", "資料", "六甲台"],
    building: "社会科学系図書館",
    floorGuide: ["入口階: カウンター、閲覧席", "上階: 資料・閲覧エリア", "混雑時: 近隣のラーニングコモンズ候補も確認"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus map seed"
  },
  {
    id: "rokkodai-main-building",
    name: "六甲台本館",
    category: "classroom",
    campus: "六甲台第1",
    area: "六甲台第1",
    position: { lat: 34.72461, lng: 135.23576 },
    summary: "経済・経営系の授業や手続きで使う中心的な建物。",
    description: "六甲台第1のランドマークになる建物です。教室番号や学舎名が似ているため、初回は詳細配置を確認してから向かうのがおすすめです。",
    aliases: ["本館", "六甲台本館", "経済本館", "経営本館"],
    tags: ["教室", "経済", "経営", "六甲台"],
    building: "本館",
    floor: "1F-4F",
    roomExamples: ["102", "206", "大会議室"],
    floorGuide: ["1F: 入口、掲示、主要窓口", "2F-4F: 講義室・研究室", "教室番号の先頭は階数の目安"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus map seed"
  },
  {
    id: "rokkodai-second-building",
    name: "第二学舎",
    category: "classroom",
    campus: "六甲台第1",
    area: "法学研究科付近",
    position: { lat: 34.7243, lng: 135.23521 },
    summary: "法学部・法学研究科方面の講義室を探すときの起点。",
    description: "法学系の講義や窓口で使うことが多い建物です。六甲台第1は建物の高低差があるため、移動ルートも一緒に確認してください。",
    aliases: ["法学部", "法学研究科", "第二学舎", "2学舎"],
    tags: ["教室", "法学", "六甲台"],
    building: "第二学舎",
    floorGuide: ["入口階: 事務室・掲示の確認", "上階: 講義室", "神大正門前から徒歩約5分を目安"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus map seed"
  },
  {
    id: "rokkodai-lounge-benches",
    name: "六甲台講堂前ベンチ",
    category: "bench",
    campus: "六甲台第1",
    area: "出光佐三記念六甲台講堂前",
    position: { lat: 34.72525, lng: 135.23613 },
    summary: "眺めがよく、待ち合わせにも使いやすい休憩ポイント。",
    description: "講義前後の待ち合わせや短時間の休憩に向いた場所です。屋外なので雨天や真夏は近くの屋内スペースも確認してください。",
    aliases: ["講堂前", "六甲台講堂", "ベンチ", "待ち合わせ"],
    tags: ["ベンチ", "休憩", "待ち合わせ", "屋外"],
    crowdLevel: "medium",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "rokkodai-coop-atm",
    name: "六甲台生協・ATM周辺",
    category: "atm",
    campus: "六甲台第1",
    area: "六甲台第1 生協周辺",
    position: { lat: 34.72474, lng: 135.23473 },
    summary: "昼休みに使いやすいATM・購買周辺の目印。",
    description: "ATM、購買、食事の用事をまとめて済ませやすいエリアです。現金が必要なイベントや証明書発行前に確認しておくと安心です。",
    aliases: ["ATM", "生協", "購買", "キャッシュコーナー"],
    tags: ["ATM", "生協", "六甲台"],
    openHours: "営業時間は生協・金融機関の案内を確認",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "rokkodai-post-box",
    name: "六甲台郵便ポスト",
    category: "post",
    campus: "六甲台第1",
    area: "正門・生協方面",
    position: { lat: 34.72419, lng: 135.23477 },
    summary: "書類郵送や投函のためのポスト候補。",
    description: "レポート、申請書類、封筒を投函する前に集荷時刻を現地で確認してください。",
    aliases: ["ポスト", "郵便", "投函", "郵便ポスト"],
    tags: ["ポスト", "書類", "六甲台"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "rokkodai-main-toilet",
    name: "六甲台本館トイレ",
    category: "toilet",
    campus: "六甲台第1",
    area: "六甲台本館",
    position: { lat: 34.72455, lng: 135.23567 },
    summary: "講義室移動中に使いやすい本館内トイレ。",
    description: "本館内の講義前後に使いやすいトイレ候補です。混雑時は隣接学舎も候補にしてください。",
    aliases: ["トイレ", "WC", "本館トイレ", "お手洗い"],
    tags: ["トイレ", "本館", "六甲台"],
    building: "本館",
    floorGuide: ["各階のエレベーター・階段付近を確認", "バリアフリー設備は現地掲示を優先"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "rokkodai2-natural-science-library",
    name: "自然科学系図書館",
    category: "library",
    campus: "六甲台第2",
    area: "工学・理学系エリア",
    position: { lat: 34.72682, lng: 135.23525 },
    summary: "理工農系の資料確認と自習に使える図書館。",
    description: "自然科学系の講義や研究で使う資料を探しやすい図書館です。UniTimeの既存マップ画面でも中心的な施設として扱われています。",
    aliases: ["自然科学系図書館", "自然図", "理工図書館", "図書館"],
    tags: ["図書館", "自習", "理学", "工学"],
    building: "自然科学系図書館",
    floorGuide: ["入口階: カウンター、閲覧席", "上階: 資料・閲覧席", "周辺: 情報基盤センター、研究棟"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai2 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus map seed"
  },
  {
    id: "rokkodai2-engineering-building",
    name: "工学部本館・講義室群",
    category: "classroom",
    campus: "六甲台第2",
    area: "工学部エリア",
    position: { lat: 34.7272, lng: 135.23558 },
    summary: "工学部系の授業で使う建物群。",
    description: "工学部の講義室は建物名と教室番号が重要です。初回は授業情報の建物名、階、号室を見てからルートを確認してください。",
    aliases: ["工学部", "工学部本館", "工学講義室", "教室"],
    tags: ["教室", "工学", "六甲台第2"],
    building: "工学部本館周辺",
    roomExamples: ["C2-101", "LR", "多目的室"],
    floorGuide: ["建物記号と教室番号をセットで確認", "坂道移動があるためキャンパス間の連続授業は余裕を持つ"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai2 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "rokkodai2-learning-corner",
    name: "工学系ラーニングスペース",
    category: "learning",
    campus: "六甲台第2",
    area: "自然科学系図書館周辺",
    position: { lat: 34.72662, lng: 135.23545 },
    summary: "課題・レポート作業向けの自習候補。",
    description: "理工系の講義前後に短時間で作業したいときの候補です。正式な開室状況は各施設の掲示を確認してください。",
    aliases: ["ラーコモ", "ラーニングコモンズ", "自習", "学習スペース"],
    tags: ["自習", "ラーコモ", "六甲台第2"],
    crowdLevel: "varies",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai2 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "rokkodai2-information-center",
    name: "情報基盤センター（本館）",
    category: "classroom",
    campus: "六甲台第2",
    area: "自然科学系図書館付近",
    position: { lat: 34.72618, lng: 135.23594 },
    summary: "情報系の手続きや教室確認で目印になる建物。",
    description: "情報基盤センター周辺は自然科学系図書館や工学系施設と近く、初回の位置確認に便利です。",
    aliases: ["情報基盤センター", "情基", "本館", "情報"],
    tags: ["情報", "教室", "六甲台第2"],
    building: "情報基盤センター",
    floorGuide: ["本館・別館の区別に注意", "教室名が長い場合は建物名で先に絞り込む"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai2 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus map seed"
  },
  {
    id: "rokkodai2-bus-stop",
    name: "神大本部工学部前バス停",
    category: "bus",
    campus: "六甲台第2",
    area: "工学部前",
    position: { lat: 34.72696, lng: 135.23431 },
    summary: "六甲台第2へ向かう主要バス停。",
    description: "工学部、理学部、農学部方面へ向かうときの目印です。六甲台第1へ歩く場合は高低差があります。",
    aliases: ["神大本部工学部前", "バス停", "工学部前", "36系統"],
    tags: ["バス", "36系統", "六甲台第2"],
    routeHint: "神戸市バス36系統の利用が中心。",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.rokkodai2 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "tsurukabuto1-kokusai-bus",
    name: "神大国際文化学研究科前バス停",
    category: "bus",
    campus: "鶴甲第1",
    area: "鶴甲第1入口",
    position: { lat: 34.73009, lng: 135.22924 },
    summary: "鶴甲第1キャンパスの最寄りバス停。",
    description: "全学共通授業で鶴甲第1へ向かうときの起点です。市バス16系統・106系統の案内を確認してください。",
    aliases: ["国際文化学研究科前", "鶴甲第1バス停", "バス停", "16系統", "106系統"],
    tags: ["バス", "鶴甲第1", "全学共通"],
    routeHint: "阪急六甲、JR六甲道、阪神御影方面から市バス16または106系統。",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto1 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus access pages"
  },
  {
    id: "tsurukabuto1-learning-commons",
    name: "鶴甲第1 ラーニングコモンズ",
    category: "learning",
    campus: "鶴甲第1",
    area: "K棟・学生利用エリア",
    position: { lat: 34.73038, lng: 135.23019 },
    summary: "全学共通授業の合間に使いやすい学習スペース。",
    description: "1年生の授業が集まりやすい鶴甲第1で、空きコマの作業やグループワークの候補になります。",
    aliases: ["ラーコモ", "ラーニングコモンズ", "鶴甲ラーコモ", "自習"],
    tags: ["ラーコモ", "自習", "鶴甲第1"],
    crowdLevel: "high",
    floorGuide: ["開室状況は現地掲示を優先", "昼休みは混みやすい", "静かな作業は図書館系スペースも候補"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "tsurukabuto1-k-building",
    name: "鶴甲第1 K棟・講義室",
    category: "classroom",
    campus: "鶴甲第1",
    area: "鶴甲第1 中央",
    position: { lat: 34.73055, lng: 135.23031 },
    summary: "全学共通授業で使う教室群の目印。",
    description: "鶴甲第1の授業で迷いやすい建物です。教室番号と棟を確認し、初回はバス停からの移動時間を多めに見てください。",
    aliases: ["K棟", "鶴甲第1教室", "国文", "全学共通"],
    tags: ["教室", "全学共通", "鶴甲第1"],
    building: "K棟周辺",
    roomExamples: ["K202", "K301", "大教室"],
    floorGuide: ["教室番号の先頭は階数の目安", "棟を間違えた場合は中央通路へ戻る", "授業開始直前は階段が混みやすい"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "tsurukabuto1-toilet-central",
    name: "鶴甲第1 中央トイレ",
    category: "toilet",
    campus: "鶴甲第1",
    area: "K棟周辺",
    position: { lat: 34.7305, lng: 135.23008 },
    summary: "全学共通授業の前後に使いやすいトイレ候補。",
    description: "授業前後に混みやすい場所です。時間に余裕がない場合は近い階のトイレを優先してください。",
    aliases: ["トイレ", "WC", "鶴甲トイレ", "お手洗い"],
    tags: ["トイレ", "鶴甲第1"],
    building: "K棟周辺",
    floorGuide: ["各階の階段・エレベーター付近を確認", "バリアフリー設備は現地掲示を優先"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "tsurukabuto1-coop-food",
    name: "鶴甲第1 生協・食堂",
    category: "food",
    campus: "鶴甲第1",
    area: "学生利用エリア",
    position: { lat: 34.73015, lng: 135.2305 },
    summary: "昼食、購買、授業間の補給に使う場所。",
    description: "全学共通授業の時間帯は混雑しやすい食堂・購買エリアです。昼休み前後は早めの移動がおすすめです。",
    aliases: ["生協", "食堂", "購買", "鶴甲食堂"],
    tags: ["食堂", "生協", "鶴甲第1"],
    crowdLevel: "high",
    openHours: "営業時間は生協公式案内を確認",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "tsurukabuto1-bench-courtyard",
    name: "鶴甲第1 中庭ベンチ",
    category: "bench",
    campus: "鶴甲第1",
    area: "中庭",
    position: { lat: 34.7307, lng: 135.23003 },
    summary: "空きコマの短い休憩や待ち合わせに使える屋外ベンチ。",
    description: "全学共通授業の移動待ちに使いやすい場所です。日差しや雨の状況に応じて屋内スペースも候補にしてください。",
    aliases: ["ベンチ", "中庭", "休憩", "待ち合わせ"],
    tags: ["ベンチ", "休憩", "鶴甲第1"],
    crowdLevel: "medium",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto1 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "tsurukabuto2-human-dev-bus",
    name: "神大人間発達環境学研究科前バス停",
    category: "bus",
    campus: "鶴甲第2",
    area: "鶴甲第2入口",
    position: { lat: 34.72636, lng: 135.22527 },
    summary: "鶴甲第2キャンパスの最寄りバス停。",
    description: "発達・環境系の授業や用事で鶴甲第2へ向かうときの起点です。市バス36系統の案内を確認してください。",
    aliases: ["人間発達環境学研究科前", "鶴甲第2バス停", "バス停", "36系統"],
    tags: ["バス", "鶴甲第2"],
    routeHint: "神戸市バス36系統の鶴甲団地方面を確認。",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto2 }],
    updatedAt: "2026-06-01",
    source: "Kobe University public campus access pages"
  },
  {
    id: "tsurukabuto2-library-learning",
    name: "鶴甲第2 学習・図書エリア",
    category: "learning",
    campus: "鶴甲第2",
    area: "発達科学部系エリア",
    position: { lat: 34.72658, lng: 135.22578 },
    summary: "授業前後の自習や資料確認に使う候補。",
    description: "鶴甲第2の授業前後に作業しやすい学習エリアです。正式な利用時間は現地掲示を優先してください。",
    aliases: ["自習", "ラーコモ", "図書", "鶴甲第2"],
    tags: ["自習", "鶴甲第2"],
    crowdLevel: "medium",
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto2 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "tsurukabuto2-classrooms",
    name: "鶴甲第2 講義室群",
    category: "classroom",
    campus: "鶴甲第2",
    area: "鶴甲第2 中央",
    position: { lat: 34.72628, lng: 135.22595 },
    summary: "鶴甲第2で講義室を探すときの起点。",
    description: "棟と教室番号をセットで確認してください。鶴甲第1と間違えやすいため、キャンパス名も先に確認するのが安全です。",
    aliases: ["鶴甲第2教室", "発達", "人間発達", "講義室"],
    tags: ["教室", "鶴甲第2"],
    building: "講義室群",
    roomExamples: ["A棟", "B棟", "大教室"],
    floorGuide: ["棟名を先に確認", "鶴甲第1とは徒歩距離がある", "バス停名もあわせて確認"],
    links: [{ label: "公式キャンパスマップ", url: officialCampusLinks.tsurukabuto2 }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "fukae-main-gate",
    name: "深江キャンパス正門",
    category: "route",
    campus: "深江",
    area: "正門",
    position: { lat: 34.71655, lng: 135.29208 },
    summary: "海洋政策科学部のキャンパス入口。",
    description: "阪神深江駅から徒歩で向かうときの主要な入口です。六甲台地区とは離れているため、キャンパス間移動の時間に注意してください。",
    aliases: ["深江正門", "海洋", "海事", "深江入口"],
    tags: ["入口", "深江", "海洋"],
    routeHint: "阪神深江駅から徒歩圏。六甲台地区からの移動は電車・バス乗継を想定。",
    links: [{ label: "海洋政策科学部アクセス", url: officialCampusLinks.fukae }],
    updatedAt: "2026-06-01",
    source: "Kobe University Ocean access page"
  },
  {
    id: "fukae-library-learning",
    name: "深江 学習・図書エリア",
    category: "library",
    campus: "深江",
    area: "深江キャンパス",
    position: { lat: 34.71688, lng: 135.29251 },
    summary: "深江キャンパスで資料確認・自習をする候補。",
    description: "海洋政策科学部の授業や研究に関する資料確認、自習に使う候補です。",
    aliases: ["深江図書", "海洋図書", "図書館", "自習"],
    tags: ["図書館", "深江", "海洋"],
    floorGuide: ["開館時間は公式案内を確認", "六甲台地区の図書館とは場所が大きく異なる"],
    links: [{ label: "海洋政策科学部アクセス", url: officialCampusLinks.fukae }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "fukae-classrooms",
    name: "深江 講義棟",
    category: "classroom",
    campus: "深江",
    area: "講義棟",
    position: { lat: 34.71705, lng: 135.29222 },
    summary: "海洋政策科学部の講義室確認に使う目印。",
    description: "深江キャンパス内の講義室を探すときの起点です。授業情報の建物名と教室番号を確認してください。",
    aliases: ["深江教室", "講義棟", "海洋政策科学部", "教室"],
    tags: ["教室", "深江", "海洋"],
    building: "講義棟",
    floorGuide: ["建物名を先に確認", "キャンパス間移動がある日は移動時間を多めに確保"],
    links: [{ label: "海洋政策科学部アクセス", url: officialCampusLinks.fukae }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "myodani-main-gate",
    name: "名谷キャンパス入口",
    category: "route",
    campus: "名谷",
    area: "入口",
    position: { lat: 34.68109, lng: 135.09455 },
    summary: "保健学系の名谷キャンパスへ向かう入口。",
    description: "六甲台地区とは離れているため、同日移動の予定がある場合は交通手段と所要時間を先に確認してください。",
    aliases: ["名谷", "保健学", "入口", "名谷キャンパス"],
    tags: ["入口", "名谷", "保健"],
    links: [{ label: "神戸大学アクセス", url: officialCampusLinks.myodani }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "myodani-library-learning",
    name: "名谷 学習・図書エリア",
    category: "learning",
    campus: "名谷",
    area: "名谷キャンパス",
    position: { lat: 34.68138, lng: 135.09493 },
    summary: "名谷キャンパスで自習・資料確認をする候補。",
    description: "保健学系の講義前後に使いやすい学習スペース候補です。正式な利用時間は現地掲示を優先してください。",
    aliases: ["名谷図書", "自習", "ラーコモ", "保健学"],
    tags: ["自習", "名谷", "保健"],
    links: [{ label: "神戸大学アクセス", url: officialCampusLinks.myodani }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  },
  {
    id: "myodani-classrooms",
    name: "名谷 講義室群",
    category: "classroom",
    campus: "名谷",
    area: "講義棟",
    position: { lat: 34.68125, lng: 135.09512 },
    summary: "名谷キャンパスの講義室確認に使う目印。",
    description: "保健学系の授業で教室を探すときの起点です。建物名、階、教室番号をセットで確認してください。",
    aliases: ["名谷教室", "講義室", "保健学", "教室"],
    tags: ["教室", "名谷", "保健"],
    building: "講義室群",
    floorGuide: ["建物名と階を確認", "六甲台地区との取り違えに注意"],
    links: [{ label: "神戸大学アクセス", url: officialCampusLinks.myodani }],
    updatedAt: "2026-06-01",
    source: "Local seed data"
  }
];

const normalizeFacilityName = (value: string) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[()\[\]{}（）【】「」『』・,、\s]/g, "");

const hasMeaningfulMatch = (candidate: string, officialName: string) => {
  if (!candidate || candidate.length < 3) return false;
  return officialName.includes(candidate) || candidate.includes(officialName);
};

const candidateNamesFor = (facility: Facility) =>
  [facility.name, facility.building, ...(facility.aliases || [])]
    .filter((value): value is string => Boolean(value))
    .map(normalizeFacilityName)
    .filter((value) => value.length >= 3 || /[a-z0-9]/i.test(value));

const isSameOfficialPlace = (facility: Facility, officialFacility: Facility) => {
  const officialName = normalizeFacilityName(officialFacility.name);
  const candidates = candidateNamesFor(facility);
  const nameMatches = candidates.some((candidate) =>
    hasMeaningfulMatch(candidate, officialName)
  );

  if (!nameMatches) return false;
  if (facility.campus === officialFacility.campus) return true;

  return (
    facility.category === "bus" &&
    officialFacility.name.includes("バス停")
  );
};

const usedOfficialFacilityIds = new Set<string>();

const mergedFeaturedFacilities = featuredFacilities.map((facility) => {
  const officialFacility = officialFacilities.find((candidate) =>
    isSameOfficialPlace(facility, candidate)
  );

  if (!officialFacility) return facility;

  usedOfficialFacilityIds.add(officialFacility.id);
  return {
    ...facility,
    position: officialFacility.position,
    officialMapNumber: officialFacility.officialMapNumber,
    sourceArea: officialFacility.sourceArea,
    tags: Array.from(new Set([...facility.tags, ...officialFacility.tags])),
    aliases: Array.from(new Set([...facility.aliases, ...officialFacility.aliases])),
    source: `${facility.source}; ${officialFacility.source}`
  };
});

export const facilities: Facility[] = [
  ...mergedFeaturedFacilities,
  ...officialFacilities.filter((facility) => !usedOfficialFacilityIds.has(facility.id))
];

export const campusNames = Object.keys(campusCenters) as CampusName[];
