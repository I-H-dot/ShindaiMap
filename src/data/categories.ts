import type { CategoryDefinition } from "../lib/types";

export const categories: CategoryDefinition[] = [
  {
    id: "toilet",
    label: "トイレ",
    shortLabel: "トイレ",
    description: "講義前後に使いやすいトイレ、バリアフリー設備の目印。",
    color: "#2563eb",
    icon: "accessibility"
  },
  {
    id: "bench",
    label: "休憩場所",
    shortLabel: "休憩",
    description: "空きコマや移動待ちで使える休憩場所。",
    color: "#16a34a",
    icon: "armchair"
  },
  {
    id: "learning",
    label: "ラーコモ・自習",
    shortLabel: "ラーコモ",
    description: "ラーニングコモンズ、自習、グループワーク向けスペース。",
    color: "#7c3aed",
    icon: "book-open"
  },
  {
    id: "library",
    label: "図書館",
    shortLabel: "図書館",
    description: "各キャンパスの図書館と資料室。",
    color: "#dc2626",
    icon: "library"
  },
  {
    id: "classroom",
    label: "教室・建物",
    shortLabel: "教室",
    description: "号館、講義室、教室配置の手がかり。",
    color: "#ea580c",
    icon: "building-2"
  },
  {
    id: "route",
    label: "入口・移動目印",
    shortLabel: "入口",
    description: "門、入口、キャンパス間移動で目印になる場所。",
    color: "#0891b2",
    icon: "route"
  },
  {
    id: "atm",
    label: "ATM",
    shortLabel: "ATM",
    description: "生協や近隣のATM。",
    color: "#0f766e",
    icon: "badge-yen"
  },
  {
    id: "post",
    label: "ポスト",
    shortLabel: "ポスト",
    description: "郵便ポスト、郵送に使える場所。",
    color: "#e11d48",
    icon: "mailbox"
  },
  {
    id: "bus",
    label: "バス停",
    shortLabel: "バス",
    description: "神戸市バスの主要バス停。",
    color: "#ca8a04",
    icon: "bus"
  },
  {
    id: "food",
    label: "食堂・売店",
    shortLabel: "食堂",
    description: "食堂、カフェ、生協ショップ。",
    color: "#c2410c",
    icon: "utensils"
  },
  {
    id: "official",
    label: "公式地図番号",
    shortLabel: "公式番号",
    description: "静的座標データと神戸大学公式地図番号に対応するピン。",
    color: "#334155",
    icon: "map-pin"
  }
];

export const categoryMap = new Map(categories.map((category) => [category.id, category]));
