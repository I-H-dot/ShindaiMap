import type { CategoryDefinition } from "../lib/types";

export const categories: CategoryDefinition[] = [
  {
    id: "aed",
    label: "AED",
    shortLabel: "AED",
    description: "公式AED設置場所一覧に基づく建物代表位置。",
    color: "#dc2626",
    icon: "heart-pulse"
  },
  {
    id: "bicycle-parking",
    label: "駐輪場",
    shortLabel: "駐輪場",
    description: "公式キャンパスマップ画像に示された自転車駐輪場。",
    color: "#4f46e5",
    icon: "bicycle"
  },
  {
    id: "motorcycle-parking",
    label: "バイク駐輪場",
    shortLabel: "バイク",
    description: "公式キャンパスマップ画像に示されたバイク駐輪場。",
    color: "#4338ca",
    icon: "motorcycle"
  },
  {
    id: "parking",
    label: "駐車場",
    shortLabel: "駐車場",
    description: "公式キャンパスマップ画像に示された駐車場。",
    color: "#64748b",
    icon: "square-parking"
  },
  {
    id: "stairs",
    label: "階段",
    shortLabel: "階段",
    description: "公式キャンパスマップ画像に示された階段。",
    color: "#6b7280",
    icon: "stairs"
  },
  {
    id: "slope",
    label: "急な傾斜道",
    shortLabel: "傾斜道",
    description: "公式キャンパスマップ画像に示された急な傾斜道。",
    color: "#57534e",
    icon: "triangle-exclamation"
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
    id: "station",
    label: "鉄道駅",
    shortLabel: "駅",
    description: "アプリ内時刻表を表示する鉄道駅。",
    color: "#0369a1",
    icon: "train"
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
    id: "office",
    label: "守衛室・窓口",
    shortLabel: "守衛",
    description: "守衛室、門衛所、案内窓口。",
    color: "#475569",
    icon: "building-2"
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
