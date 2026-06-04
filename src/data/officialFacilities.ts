import type { CampusName, Facility } from "../lib/types";

interface OfficialFacilityRecord {
  id: string;
  name: string;
  campus: CampusName;
  lat: number;
  lng: number;
  sourceArea: string;
  officialMapNumber?: string;
}

// Edit this typed, diff-friendly coordinate list directly.
const officialFacilityRecords: OfficialFacilityRecord[] = [
  {
    "id": "official-rokkodai-1-26",
    "name": "人間発達環境学研究科実習観察園、管理棟",
    "campus": "六甲台第1",
    "lat": 34.7315583,
    "lng": 135.2328907,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "26"
  },
  {
    "id": "official-rokkodai-1-27",
    "name": "武道場（艱貞堂）",
    "campus": "六甲台第1",
    "lat": 34.7312839,
    "lng": 135.2329364,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "27"
  },
  {
    "id": "official-rokkodai-1-28",
    "name": "第二研究室",
    "campus": "六甲台第1",
    "lat": 34.729844,
    "lng": 135.2344277,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "28"
  },
  {
    "id": "official-rokkodai-1-29",
    "name": "社会科学系フロンティア館（計算社会科学研究センター",
    "campus": "六甲台第1",
    "lat": 34.7297426,
    "lng": 135.2338698,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "29"
  },
  {
    "id": "official-rokkodai-1-30",
    "name": "ラ・クール（模擬法廷棟）",
    "campus": "六甲台第1",
    "lat": 34.7292768,
    "lng": 135.2336583,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "30"
  },
  {
    "id": "official-rokkodai-1-31",
    "name": "第二学舎（法学研究科）",
    "campus": "六甲台第1",
    "lat": 34.7291052,
    "lng": 135.2333145,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "31"
  },
  {
    "id": "official-rokkodai-1-32",
    "name": "社会科学系図書館",
    "campus": "六甲台第1",
    "lat": 34.729193,
    "lng": 135.2340875,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "32"
  },
  {
    "id": "official-rokkodai-1-33",
    "name": "経済経営研究所新館",
    "campus": "六甲台第1",
    "lat": 34.7296295,
    "lng": 135.2346495,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "33"
  },
  {
    "id": "official-rokkodai-1-34",
    "name": "兼松記念館 （経済経営研究所）",
    "campus": "六甲台第1",
    "lat": 34.7293209,
    "lng": 135.2347568,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "34"
  },
  {
    "id": "official-rokkodai-1-35",
    "name": "三木記念同窓会館",
    "campus": "六甲台第1",
    "lat": 34.7289461,
    "lng": 135.235363,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "35"
  },
  {
    "id": "official-rokkodai-1-36",
    "name": "法科大学院自習棟",
    "campus": "六甲台第1",
    "lat": 34.728561,
    "lng": 135.235388,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "36"
  },
  {
    "id": "official-rokkodai-1-37",
    "name": "本館（経済学研究科、経営学研究科、社会システムイノベーションセンター）",
    "campus": "六甲台第1",
    "lat": 34.7282587,
    "lng": 135.2347466,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "37"
  },
  {
    "id": "official-rokkodai-1-38",
    "name": "第三学舎",
    "campus": "六甲台第1",
    "lat": 34.7285056,
    "lng": 135.234398,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "38"
  },
  {
    "id": "official-rokkodai-1-39",
    "name": "第四学舎（企業資料総合センター）",
    "campus": "六甲台第1",
    "lat": 34.7288671,
    "lng": 135.2338617,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "39"
  },
  {
    "id": "official-rokkodai-1-40",
    "name": "第五学舎（国際協力研究科）",
    "campus": "六甲台第1",
    "lat": 34.728294,
    "lng": 135.2334055,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "40"
  },
  {
    "id": "official-rokkodai-1-41",
    "name": "出光佐三記念六甲台講堂",
    "campus": "六甲台第1",
    "lat": 34.7283337,
    "lng": 135.2339581,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "41"
  },
  {
    "id": "official-rokkodai-1-42",
    "name": "社会科学系アカデミア館（放送大学兵庫学習センター）",
    "campus": "六甲台第1",
    "lat": 34.7273814,
    "lng": 135.2336738,
    "sourceArea": "六甲台第1キャンパス",
    "officialMapNumber": "42"
  },
  {
    "id": "official-tsurukabuto-1-extra-01",
    "name": "学生会館",
    "campus": "鶴甲第1",
    "lat": 34.7292571,
    "lng": 135.2362112,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-02",
    "name": "生協学生会館店",
    "campus": "鶴甲第1",
    "lat": 34.7292439,
    "lng": 135.2359913,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-03",
    "name": "学生会館事務室",
    "campus": "鶴甲第1",
    "lat": 34.7294246,
    "lng": 135.2362756,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-04",
    "name": "シアターD300",
    "campus": "鶴甲第1",
    "lat": 34.7314095,
    "lng": 135.2358224,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-05",
    "name": "アーチェリー場(洋弓場)",
    "campus": "鶴甲第1",
    "lat": 34.7322231,
    "lng": 135.2383541,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-06",
    "name": "グラウンド(運動場)",
    "campus": "鶴甲第1",
    "lat": 34.7311976,
    "lng": 135.237807,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-07",
    "name": "テニスコート",
    "campus": "鶴甲第1",
    "lat": 34.7305085,
    "lng": 135.237866,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-08",
    "name": "ハンドボールコート",
    "campus": "鶴甲第1",
    "lat": 34.7300852,
    "lng": 135.2378982,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-09",
    "name": "神大文理農学部前(バス停)",
    "campus": "その他",
    "lat": 34.7265183,
    "lng": 135.2335546,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-10",
    "name": "神大本部工学部前(バス停)",
    "campus": "その他",
    "lat": 34.7273045,
    "lng": 135.2356904,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-11",
    "name": "神大正門前(バス停)",
    "campus": "その他",
    "lat": 34.7272134,
    "lng": 135.2342197,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-12",
    "name": "神大国際文化学研究科前(バス停)",
    "campus": "その他",
    "lat": 34.7286929,
    "lng": 135.2377431,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-13",
    "name": "神大人間発達環境学研究科前(バス停)",
    "campus": "その他",
    "lat": 34.7331482,
    "lng": 135.2350501,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-14",
    "name": "馬場",
    "campus": "その他",
    "lat": 34.7284362,
    "lng": 135.2368434,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-2-extra-15",
    "name": "テニスコート",
    "campus": "六甲台第2",
    "lat": 34.7240651,
    "lng": 135.2346412,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-1-extra-16",
    "name": "グラウンド(運動場)",
    "campus": "六甲台第1",
    "lat": 34.7305782,
    "lng": 135.2337632,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-1-extra-17",
    "name": "テニスコート",
    "campus": "六甲台第1",
    "lat": 34.7313404,
    "lng": 135.2340851,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-2-extra-18",
    "name": "グラウンド(運動場)",
    "campus": "鶴甲第2",
    "lat": 34.7341734,
    "lng": 135.2333905,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-2-extra-19",
    "name": "テニスコート",
    "campus": "鶴甲第2",
    "lat": 34.7347157,
    "lng": 135.2341039,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-20",
    "name": "鹿島体育所",
    "campus": "その他",
    "lat": 36.5768,
    "lng": 137.8041,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-21",
    "name": "氷の山体育所",
    "campus": "その他",
    "lat": 35.354,
    "lng": 134.5139,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-22",
    "name": "神戸大学中国事務所",
    "campus": "その他",
    "lat": 39.9544,
    "lng": 116.3112,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-23",
    "name": "神戸大学ブリュッセルオフィス",
    "campus": "その他",
    "lat": 50.8213,
    "lng": 4.3915,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-24",
    "name": "西宮艇庫",
    "campus": "その他",
    "lat": 34.7107,
    "lng": 135.3303,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-25",
    "name": "淀川艇庫",
    "campus": "その他",
    "lat": 34.7352,
    "lng": 135.5257,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-26",
    "name": "医学部附属病院 国際がん医療・研究センター",
    "campus": "その他",
    "lat": 34.6601,
    "lng": 135.2165,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-27",
    "name": "附属特別支援学校",
    "campus": "その他",
    "lat": 34.7107,
    "lng": 134.9392,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-28",
    "name": "内海域環境教育研究センター マリンサイト",
    "campus": "その他",
    "lat": 34.5937,
    "lng": 135.0113,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-29",
    "name": "農学研究科附属食資源教育研究センター",
    "campus": "その他",
    "lat": 34.8804,
    "lng": 134.8638,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-30",
    "name": "ポスト(社会科学系アカデミア館南側)",
    "campus": "その他",
    "lat": 34.7271,
    "lng": 135.2338,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-31",
    "name": "ポスト(工学部)",
    "campus": "その他",
    "lat": 34.7265,
    "lng": 135.2372,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-32",
    "name": "ポスト(神戸大学病院前)",
    "campus": "その他",
    "lat": 34.6852,
    "lng": 135.1698,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-33",
    "name": "ポスト(バス停「鶴甲南」そば)",
    "campus": "その他",
    "lat": 34.7262,
    "lng": 135.2325,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-1-extra-34",
    "name": "BEL BOX カフェテリア(食堂)",
    "campus": "六甲台第1",
    "lat": 34.7273,
    "lng": 135.234,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-1-extra-35",
    "name": "レストランさくら(食堂)",
    "campus": "六甲台第1",
    "lat": 34.7271,
    "lng": 135.2338,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-1-extra-36",
    "name": "BEL BOXショップ(生協)",
    "campus": "六甲台第1",
    "lat": 34.7275,
    "lng": 135.2338,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-2-extra-37",
    "name": "LANS BOX食堂",
    "campus": "六甲台第2",
    "lat": 34.7258,
    "lng": 135.2369,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-2-extra-38",
    "name": "LANS BOX店(生協)",
    "campus": "六甲台第2",
    "lat": 34.7242,
    "lng": 135.2351,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-2-extra-39",
    "name": "LANS HALAL Vege Dining",
    "campus": "六甲台第2",
    "lat": 34.7242,
    "lng": 135.2351,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-40",
    "name": "鶴1食堂",
    "campus": "鶴甲第1",
    "lat": 34.7266,
    "lng": 135.2323,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-41",
    "name": "鶴1ショップ(生協)",
    "campus": "鶴甲第1",
    "lat": 34.7302,
    "lng": 135.2371,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-42",
    "name": "サービスセンター",
    "campus": "鶴甲第1",
    "lat": 34.7302516,
    "lng": 135.2368748,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-2-extra-43",
    "name": "鶴2食堂",
    "campus": "鶴甲第2",
    "lat": 34.7285,
    "lng": 135.2382,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-2-extra-44",
    "name": "鶴2ショップ",
    "campus": "鶴甲第2",
    "lat": 34.7335,
    "lng": 135.2428,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-kusunoki-extra-45",
    "name": "医学部食堂",
    "campus": "楠",
    "lat": 34.6854,
    "lng": 135.1695,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-kusunoki-extra-46",
    "name": "医学部店(生協)",
    "campus": "楠",
    "lat": 34.6845,
    "lng": 135.1704,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-myodani-extra-47",
    "name": "保健学科食堂",
    "campus": "名谷",
    "lat": 34.6784,
    "lng": 135.0531,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-myodani-extra-48",
    "name": "保健学科店(生協)",
    "campus": "名谷",
    "lat": 34.6716,
    "lng": 135.0988,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-fukae-extra-49",
    "name": "深江キッチン(食堂)",
    "campus": "深江",
    "lat": 34.7183,
    "lng": 135.2887,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-fukae-extra-50",
    "name": "深江ショップ",
    "campus": "深江",
    "lat": 34.7183,
    "lng": 135.2887,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-51",
    "name": "ポートアイランドキャンパス 食堂",
    "campus": "その他",
    "lat": 34.6601,
    "lng": 135.2165,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-other-extra-52",
    "name": "食資源教育研究センター 休憩室/食堂",
    "campus": "その他",
    "lat": 34.8804,
    "lng": 134.8638,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-2-extra-53",
    "name": "セブンイレブン",
    "campus": "六甲台第2",
    "lat": 34.7263,
    "lng": 135.2371,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-2-extra-54",
    "name": "三井住友銀行 神戸大学出張所",
    "campus": "六甲台第2",
    "lat": 34.7265,
    "lng": 135.237,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-tsurukabuto-1-extra-55",
    "name": "ゆうちょ銀行 大阪支店 神戸大学国際文化学部内出張所",
    "campus": "鶴甲第1",
    "lat": 34.7308,
    "lng": 135.2369,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-kusunoki-extra-56",
    "name": "三井住友銀行 神戸大学病院出張所",
    "campus": "楠",
    "lat": 34.6852,
    "lng": 135.1698,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-myodani-extra-57",
    "name": "ゆうちょ銀行 ATM",
    "campus": "名谷",
    "lat": 34.6716,
    "lng": 135.0988,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-fukae-extra-58",
    "name": "ゆうちょ銀行 ATM",
    "campus": "深江",
    "lat": 34.7183,
    "lng": 135.2887,
    "sourceArea": "新規追加座標"
  },
  {
    "id": "official-rokkodai-2-43",
    "name": "都市安全研究センター(実験棟)",
    "campus": "六甲台第2",
    "lat": 34.7282465,
    "lng": 135.2377072,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "43"
  },
  {
    "id": "official-rokkodai-2-44",
    "name": "都市安全研究センター(研究棟)",
    "campus": "六甲台第2",
    "lat": 34.727583,
    "lng": 135.2383,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "44"
  },
  {
    "id": "official-rokkodai-2-45",
    "name": "研究基盤センター(機器分析部門)",
    "campus": "六甲台第2",
    "lat": 34.7280334,
    "lng": 135.2371483,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "45"
  },
  {
    "id": "official-rokkodai-2-46",
    "name": "情報基盤センター(分館)",
    "campus": "六甲台第2",
    "lat": 34.7278483,
    "lng": 135.2367192,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "46"
  },
  {
    "id": "official-rokkodai-2-47",
    "name": "工学研究科・5E,5W,C4棟",
    "campus": "六甲台第2",
    "lat": 34.7276887,
    "lng": 135.2371414,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "47"
  },
  {
    "id": "official-rokkodai-2-48",
    "name": "工学研究科・LR棟",
    "campus": "六甲台第2",
    "lat": 34.7275044,
    "lng": 135.2368372,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "48"
  },
  {
    "id": "official-rokkodai-2-49",
    "name": "工学研究科・4E,4W,C3棟",
    "campus": "六甲台第2",
    "lat": 34.727358,
    "lng": 135.2373131,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "49"
  },
  {
    "id": "official-rokkodai-2-50",
    "name": "工学研究科・3E,3W,C2棟",
    "campus": "六甲台第2",
    "lat": 34.7270538,
    "lng": 135.2374794,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "50"
  },
  {
    "id": "official-rokkodai-2-51",
    "name": "工学研究科・D1,D2棟",
    "campus": "六甲台第2",
    "lat": 34.7268466,
    "lng": 135.2371897,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "51"
  },
  {
    "id": "official-rokkodai-2-52",
    "name": "工学研究科・2E,2W,C1棟",
    "campus": "六甲台第2",
    "lat": 34.726754,
    "lng": 135.2376564,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "52"
  },
  {
    "id": "official-rokkodai-2-53",
    "name": "工学研究科・B棟",
    "campus": "六甲台第2",
    "lat": 34.7268548,
    "lng": 135.2383921,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "53"
  },
  {
    "id": "official-rokkodai-2-54",
    "name": "工学研究科・1E,1W棟",
    "campus": "六甲台第2",
    "lat": 34.726458,
    "lng": 135.2379093,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "54"
  },
  {
    "id": "official-rokkodai-2-55",
    "name": "工学研究科・A棟",
    "campus": "六甲台第2",
    "lat": 34.726652,
    "lng": 135.2384887,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "55"
  },
  {
    "id": "official-rokkodai-2-56",
    "name": "工学研究科・環境防災実験室棟",
    "campus": "六甲台第2",
    "lat": 34.7264668,
    "lng": 135.2384779,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "56"
  },
  {
    "id": "official-rokkodai-2-57",
    "name": "工学研究科・構造物実験室",
    "campus": "六甲台第2",
    "lat": 34.7265065,
    "lng": 135.2385852,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "57"
  },
  {
    "id": "official-rokkodai-2-58",
    "name": "工学研究科・建築システム実験室棟",
    "campus": "六甲台第2",
    "lat": 34.7264447,
    "lng": 135.2382526,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "58"
  },
  {
    "id": "official-rokkodai-2-59",
    "name": "工学研究科・風洞実験室棟",
    "campus": "六甲台第2",
    "lat": 34.7263369,
    "lng": 135.2387686,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "59"
  },
  {
    "id": "official-rokkodai-2-60",
    "name": "工学研究科・音響実験室棟",
    "campus": "六甲台第2",
    "lat": 34.7259619,
    "lng": 135.2377218,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "60"
  },
  {
    "id": "official-rokkodai-2-61",
    "name": "工学研究科・音響心理実験室棟",
    "campus": "六甲台第2",
    "lat": 34.7258429,
    "lng": 135.2378827,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "61"
  },
  {
    "id": "official-rokkodai-2-62",
    "name": "工学研究科・工作技術センター",
    "campus": "六甲台第2",
    "lat": 34.7274096,
    "lng": 135.2364349,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "62"
  },
  {
    "id": "official-rokkodai-2-63",
    "name": "先端バイオ工学研究センター",
    "campus": "六甲台第2",
    "lat": 34.7272333,
    "lng": 135.2364617,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "63"
  },
  {
    "id": "official-rokkodai-2-64",
    "name": "先端膜工学研究拠点",
    "campus": "六甲台第2",
    "lat": 34.7269952,
    "lng": 135.23651,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "64"
  },
  {
    "id": "official-rokkodai-2-65",
    "name": "自然科学総合研究棟3号館",
    "campus": "六甲台第2",
    "lat": 34.7266781,
    "lng": 135.2367975,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "65"
  },
  {
    "id": "official-rokkodai-2-66",
    "name": "スカイ ダイニング（工学部食堂）",
    "campus": "六甲台第2",
    "lat": 34.7264401,
    "lng": 135.2369048,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "66"
  },
  {
    "id": "official-rokkodai-2-67",
    "name": "工学研究科・工学会館",
    "campus": "六甲台第2",
    "lat": 34.7262328,
    "lng": 135.2371516,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "67"
  },
  {
    "id": "official-rokkodai-2-68-1",
    "name": "産官学連携本部",
    "campus": "六甲台第2",
    "lat": 34.726373,
    "lng": 135.2340471,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "68-1"
  },
  {
    "id": "official-rokkodai-2-68-2",
    "name": "バイオメディカルメンブレン研究・オープンイノベーション拠点",
    "campus": "六甲台第2",
    "lat": 34.7265537,
    "lng": 135.233929,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "68-2"
  },
  {
    "id": "official-rokkodai-2-69",
    "name": "自然科学総合研究棟2号館",
    "campus": "六甲台第2",
    "lat": 34.7261957,
    "lng": 135.2345532,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "69"
  },
  {
    "id": "official-rokkodai-2-70",
    "name": "自然科学総合研究棟1号館",
    "campus": "六甲台第2",
    "lat": 34.726081,
    "lng": 135.2342045,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "70"
  },
  {
    "id": "official-rokkodai-2-71",
    "name": "自然科学総合研究棟4号館",
    "campus": "六甲台第2",
    "lat": 34.7258429,
    "lng": 135.2337807,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "71"
  },
  {
    "id": "official-rokkodai-2-72",
    "name": "ライフサイエンスラボラトリー",
    "campus": "六甲台第2",
    "lat": 34.7257327,
    "lng": 135.2334642,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "72"
  },
  {
    "id": "official-rokkodai-2-73",
    "name": "研究基盤センター（アイソトープ部門）",
    "campus": "六甲台第2",
    "lat": 34.7256622,
    "lng": 135.2332014,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "73"
  },
  {
    "id": "official-rokkodai-2-74",
    "name": "本部（事務局、保健管理センター）",
    "campus": "六甲台第2",
    "lat": 34.7263713,
    "lng": 135.2354054,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "74"
  },
  {
    "id": "official-rokkodai-2-75",
    "name": "自然科学系図書館",
    "campus": "六甲台第2",
    "lat": 34.7260054,
    "lng": 135.235661,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "75"
  },
  {
    "id": "official-rokkodai-2-76",
    "name": "情報基盤センター（本館）",
    "campus": "六甲台第2",
    "lat": 34.725829,
    "lng": 135.235897,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "76"
  },
  {
    "id": "official-rokkodai-2-77",
    "name": "システム情報学研究科（本館）",
    "campus": "六甲台第2",
    "lat": 34.7256615,
    "lng": 135.2361062,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "77"
  },
  {
    "id": "official-rokkodai-2-78",
    "name": "バイオシグナル総合研究センター棟",
    "campus": "六甲台第2",
    "lat": 34.7255514,
    "lng": 135.2343652,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "78"
  },
  {
    "id": "official-rokkodai-2-79",
    "name": "理学研究科・C棟",
    "campus": "六甲台第2",
    "lat": 34.7257498,
    "lng": 135.2346602,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "79"
  },
  {
    "id": "official-rokkodai-2-80",
    "name": "環境保全推進センター",
    "campus": "六甲台第2",
    "lat": 34.7259615,
    "lng": 135.2348694,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "80"
  },
  {
    "id": "official-rokkodai-2-81",
    "name": "共同実験室",
    "campus": "六甲台第2",
    "lat": 34.7258261,
    "lng": 135.2352181,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "81"
  },
  {
    "id": "official-rokkodai-2-82",
    "name": "理学研究科・Y,Z棟",
    "campus": "六甲台第2",
    "lat": 34.7256453,
    "lng": 135.2351484,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "82"
  },
  {
    "id": "official-rokkodai-2-83",
    "name": "理学研究科・B棟",
    "campus": "六甲台第2",
    "lat": 34.7254028,
    "lng": 135.2351484,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "83"
  },
  {
    "id": "official-rokkodai-2-84",
    "name": "理学研究科・X棟",
    "campus": "六甲台第2",
    "lat": 34.7251471,
    "lng": 135.235143,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "84"
  },
  {
    "id": "official-rokkodai-2-85",
    "name": "理学研究科・A棟",
    "campus": "六甲台第2",
    "lat": 34.7250413,
    "lng": 135.2354863,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "85"
  },
  {
    "id": "official-rokkodai-2-86",
    "name": "研究基盤センター（極低温部門）",
    "campus": "六甲台第2",
    "lat": 34.7248208,
    "lng": 135.2356794,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "86"
  },
  {
    "id": "official-rokkodai-2-87",
    "name": "農学研究科・農業生産機械工場",
    "campus": "六甲台第2",
    "lat": 34.7257636,
    "lng": 135.2326121,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "87"
  },
  {
    "id": "official-rokkodai-2-88",
    "name": "農学研究科・畜産加工工場",
    "campus": "六甲台第2",
    "lat": 34.725477,
    "lng": 135.2325584,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "88"
  },
  {
    "id": "official-rokkodai-2-89",
    "name": "農学研究科・A棟",
    "campus": "六甲台第2",
    "lat": 34.7254682,
    "lng": 135.2336785,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "89"
  },
  {
    "id": "official-rokkodai-2-90",
    "name": "農学研究科・B棟",
    "campus": "六甲台第2",
    "lat": 34.7251448,
    "lng": 135.2334854,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "90"
  },
  {
    "id": "official-rokkodai-2-91",
    "name": "農学研究科・C棟",
    "campus": "六甲台第2",
    "lat": 34.7250654,
    "lng": 135.2337429,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "91"
  },
  {
    "id": "official-rokkodai-2-92",
    "name": "農学研究科・D棟",
    "campus": "六甲台第2",
    "lat": 34.7249111,
    "lng": 135.2332815,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "92"
  },
  {
    "id": "official-rokkodai-2-93",
    "name": "農学研究科・E棟",
    "campus": "六甲台第2",
    "lat": 34.7246333,
    "lng": 135.2333405,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "93"
  },
  {
    "id": "official-rokkodai-2-94",
    "name": "農学研究科・F棟",
    "campus": "六甲台第2",
    "lat": 34.7245936,
    "lng": 135.2328256,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "94"
  },
  {
    "id": "official-rokkodai-2-95",
    "name": "農学研究科・動物飼育舎",
    "campus": "六甲台第2",
    "lat": 34.7246268,
    "lng": 135.2321623,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "95"
  },
  {
    "id": "official-rokkodai-2-96",
    "name": "人文学研究科・A棟",
    "campus": "六甲台第2",
    "lat": 34.7246431,
    "lng": 135.2343306,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "96"
  },
  {
    "id": "official-rokkodai-2-97",
    "name": "人文学研究科・C棟、人文科学図書館",
    "campus": "六甲台第2",
    "lat": 34.7247533,
    "lng": 135.2349637,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "97"
  },
  {
    "id": "official-rokkodai-2-98",
    "name": "人文学研究科・B棟",
    "campus": "六甲台第2",
    "lat": 34.7244226,
    "lng": 135.234733,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "98"
  },
  {
    "id": "official-rokkodai-2-99",
    "name": "眺望館（男女共同参画推進室、バリュースクール (V.School)）",
    "campus": "六甲台第2",
    "lat": 34.7239663,
    "lng": 135.2338116,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "99"
  },
  {
    "id": "official-rokkodai-2-100",
    "name": "瀧川記念学術交流会館",
    "campus": "六甲台第2",
    "lat": 34.7239928,
    "lng": 135.2341174,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "100"
  },
  {
    "id": "official-rokkodai-2-101",
    "name": "六甲台南食堂LANS BOX（ランスボックス）",
    "campus": "六甲台第2",
    "lat": 34.7242,
    "lng": 135.235192,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "101"
  },
  {
    "id": "official-rokkodai-2-102",
    "name": "神戸大学百年記念館（神大会館）、グローバル教育センター、大学文書史料室、誓子・波津女俳句俳諧文庫",
    "campus": "六甲台第2",
    "lat": 34.7245351,
    "lng": 135.2359608,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "102"
  },
  {
    "id": "official-rokkodai-2-103",
    "name": "山口誓子記念館",
    "campus": "六甲台第2",
    "lat": 34.7246652,
    "lng": 135.2364732,
    "sourceArea": "六甲台第2キャンパス",
    "officialMapNumber": "103"
  },
  {
    "id": "official-tsurukabuto-1-10",
    "name": "武道場（養心館）",
    "campus": "鶴甲第1",
    "lat": 34.732168,
    "lng": 135.2381131,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "10"
  },
  {
    "id": "official-tsurukabuto-1-11",
    "name": "第二体育館",
    "campus": "鶴甲第1",
    "lat": 34.7320666,
    "lng": 135.2377698,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "11"
  },
  {
    "id": "official-tsurukabuto-1-12",
    "name": "第一体育館",
    "campus": "鶴甲第1",
    "lat": 34.7318946,
    "lng": 135.2372494,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "12"
  },
  {
    "id": "official-tsurukabuto-1-13",
    "name": "大学教育推進機構（教養教育院）・D棟 （国際コミュニケーションセンター）",
    "campus": "鶴甲第1",
    "lat": 34.7316213,
    "lng": 135.2363904,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "13"
  },
  {
    "id": "official-tsurukabuto-1-14",
    "name": "大学教育推進機構（教養教育院）・N棟",
    "campus": "鶴甲第1",
    "lat": 34.7313127,
    "lng": 135.2362133,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "14"
  },
  {
    "id": "official-tsurukabuto-1-15",
    "name": "大学教育推進機構（教養教育院）・K棟",
    "campus": "鶴甲第1",
    "lat": 34.7311276,
    "lng": 135.2359344,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "15"
  },
  {
    "id": "official-tsurukabuto-1-16",
    "name": "大学教育推進機構（教養教育院）・化学実験室",
    "campus": "鶴甲第1",
    "lat": 34.7309512,
    "lng": 135.23609,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "16"
  },
  {
    "id": "official-tsurukabuto-1-17",
    "name": "大学教育推進機構（教養教育院、大学教育研究センター）・C棟",
    "campus": "鶴甲第1",
    "lat": 34.7311055,
    "lng": 135.2365352,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "17"
  },
  {
    "id": "official-tsurukabuto-1-18",
    "name": "国際人間科学部、国際文化学研究科・F棟",
    "campus": "鶴甲第1",
    "lat": 34.7310785,
    "lng": 135.2368445,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "18"
  },
  {
    "id": "official-tsurukabuto-1-19",
    "name": "大学教育推進機構（教養教育院）・M棟",
    "campus": "鶴甲第1",
    "lat": 34.7308404,
    "lng": 135.2364261,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "19"
  },
  {
    "id": "official-tsurukabuto-1-20",
    "name": "大学教育推進機構（教養教育院）,国際人間科学部,国際文化学研究科・B棟（学生センター）",
    "campus": "鶴甲第1",
    "lat": 34.7306685,
    "lng": 135.2367318,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "20"
  },
  {
    "id": "official-tsurukabuto-1-21",
    "name": "大学教育推進機構（教養教育院）・大、中講義室",
    "campus": "鶴甲第1",
    "lat": 34.7304965,
    "lng": 135.2361471,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "21"
  },
  {
    "id": "official-tsurukabuto-1-22",
    "name": "国際人間科学部、国際文化学研究科・L棟（キャンパスライフ支援センター）",
    "campus": "鶴甲第1",
    "lat": 34.730426,
    "lng": 135.2366514,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "22"
  },
  {
    "id": "official-tsurukabuto-1-23",
    "name": "国際人間科学部、国際文化学研究科・E棟",
    "campus": "鶴甲第1",
    "lat": 34.7303599,
    "lng": 135.2370016,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "23"
  },
  {
    "id": "official-tsurukabuto-1-24",
    "name": "A棟（総合・国際文化学図書館、ラーニングコモンズ、キャリアセンター）",
    "campus": "鶴甲第1",
    "lat": 34.7300953,
    "lng": 135.2367602,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "24"
  },
  {
    "id": "official-tsurukabuto-1-25",
    "name": "学生会館",
    "campus": "鶴甲第1",
    "lat": 34.7292356,
    "lng": 135.2361808,
    "sourceArea": "鶴甲第1キャンパス",
    "officialMapNumber": "25"
  },
  {
    "id": "official-tsurukabuto-2-1",
    "name": "体育館",
    "campus": "鶴甲第2",
    "lat": 34.7341355,
    "lng": 135.234655,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "1"
  },
  {
    "id": "official-tsurukabuto-2-2",
    "name": "食堂",
    "campus": "鶴甲第2",
    "lat": 34.7337565,
    "lng": 135.2339639,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "2"
  },
  {
    "id": "official-tsurukabuto-2-3",
    "name": "国際人間科学部、人間発達環境学研究科・G棟",
    "campus": "鶴甲第2",
    "lat": 34.7333906,
    "lng": 135.2334597,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "3"
  },
  {
    "id": "official-tsurukabuto-2-4",
    "name": "国際人間科学部、人間発達環境学研究科・D棟",
    "campus": "鶴甲第2",
    "lat": 34.7338995,
    "lng": 135.2349074,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "4"
  },
  {
    "id": "official-tsurukabuto-2-5",
    "name": "国際人間科学部、人間発達環境学研究科・A棟（人間科学図書館、発達支援インスティテュート）",
    "campus": "鶴甲第2",
    "lat": 34.7334895,
    "lng": 135.2346016,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "5"
  },
  {
    "id": "official-tsurukabuto-2-6",
    "name": "国際人間科学部、人間発達環境学研究科・E棟",
    "campus": "鶴甲第2",
    "lat": 34.7333264,
    "lng": 135.233915,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "6"
  },
  {
    "id": "official-tsurukabuto-2-7",
    "name": "国際人間科学部、人間発達環境学研究科・B棟",
    "campus": "鶴甲第2",
    "lat": 34.7330795,
    "lng": 135.2340062,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "7"
  },
  {
    "id": "official-tsurukabuto-2-8",
    "name": "国際人間科学部、人間発達環境学研究科・F棟",
    "campus": "鶴甲第2",
    "lat": 34.7329605,
    "lng": 135.2333517,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "8"
  },
  {
    "id": "official-tsurukabuto-2-9",
    "name": "国際人間科学部、人間発達環境学研究科・C棟",
    "campus": "鶴甲第2",
    "lat": 34.7325637,
    "lng": 135.2334804,
    "sourceArea": "鶴甲第2キャンパス",
    "officialMapNumber": "9"
  },
  {
    "id": "official-kusunoki-1",
    "name": "医学部会館（シスメックスホール、はとぽっぽ保育所）",
    "campus": "楠",
    "lat": 34.6855763,
    "lng": 135.1699142,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "1"
  },
  {
    "id": "official-kusunoki-2",
    "name": "立体駐車場",
    "campus": "楠",
    "lat": 34.685855,
    "lng": 135.1702713,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "2"
  },
  {
    "id": "official-kusunoki-3",
    "name": "第二病棟（清明寮）",
    "campus": "楠",
    "lat": 34.6864131,
    "lng": 135.1711067,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "3"
  },
  {
    "id": "official-kusunoki-4",
    "name": "中央診療棟",
    "campus": "楠",
    "lat": 34.6858508,
    "lng": 135.171055,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "4"
  },
  {
    "id": "official-kusunoki-5",
    "name": "外来診療棟",
    "campus": "楠",
    "lat": 34.6851874,
    "lng": 135.1708245,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "5"
  },
  {
    "id": "official-kusunoki-6",
    "name": "第一病棟",
    "campus": "楠",
    "lat": 34.6853492,
    "lng": 135.171642,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "6"
  },
  {
    "id": "official-kusunoki-7",
    "name": "研究棟E",
    "campus": "楠",
    "lat": 34.6848519,
    "lng": 135.1719726,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "7"
  },
  {
    "id": "official-kusunoki-8",
    "name": "研究棟A",
    "campus": "楠",
    "lat": 34.684737,
    "lng": 135.1713505,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "8"
  },
  {
    "id": "official-kusunoki-9",
    "name": "医学部管理棟 (附属図書館分館)",
    "campus": "楠",
    "lat": 34.6846073,
    "lng": 135.1706045,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "9"
  },
  {
    "id": "official-kusunoki-10",
    "name": "Medical C3 commons (福利厚生施設)",
    "campus": "楠",
    "lat": 34.6847011,
    "lng": 135.1702296,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "10"
  },
  {
    "id": "official-kusunoki-11",
    "name": "研究棟B",
    "campus": "楠",
    "lat": 34.684173,
    "lng": 135.1708609,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "11"
  },
  {
    "id": "official-kusunoki-12",
    "name": "研究棟C",
    "campus": "楠",
    "lat": 34.6838186,
    "lng": 135.1709295,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "12"
  },
  {
    "id": "official-kusunoki-13",
    "name": "研究棟D",
    "campus": "楠",
    "lat": 34.6835521,
    "lng": 135.1710731,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "13"
  },
  {
    "id": "official-kusunoki-14",
    "name": "医学部附属地域医療活性化センター",
    "campus": "楠",
    "lat": 34.6829868,
    "lng": 135.1700517,
    "sourceArea": "楠キャンパス",
    "officialMapNumber": "14"
  },
  {
    "id": "official-myodani-1",
    "name": "体育館",
    "campus": "名谷",
    "lat": 34.6723413,
    "lng": 135.098042,
    "sourceArea": "名谷キャンパス",
    "officialMapNumber": "1"
  },
  {
    "id": "official-myodani-2",
    "name": "保健学研究科・教育・研究棟（E,F棟）",
    "campus": "名谷",
    "lat": 34.6725928,
    "lng": 135.0986268,
    "sourceArea": "名谷キャンパス",
    "officialMapNumber": "2"
  },
  {
    "id": "official-myodani-3",
    "name": "保健学研究科・事務・研究棟（C棟）",
    "campus": "名谷",
    "lat": 34.6721649,
    "lng": 135.0986268,
    "sourceArea": "名谷キャンパス",
    "officialMapNumber": "3"
  },
  {
    "id": "official-myodani-4",
    "name": "保健学研究科・教育・研究棟（B棟）",
    "campus": "名谷",
    "lat": 34.6719399,
    "lng": 135.0989701,
    "sourceArea": "名谷キャンパス",
    "officialMapNumber": "4"
  },
  {
    "id": "official-myodani-5",
    "name": "保健学研究科・講義棟（D棟）",
    "campus": "名谷",
    "lat": 34.6718561,
    "lng": 135.0986911,
    "sourceArea": "名谷キャンパス",
    "officialMapNumber": "5"
  },
  {
    "id": "official-myodani-6",
    "name": "保健学研究科・教育・研究棟（A棟）",
    "campus": "名谷",
    "lat": 34.6716046,
    "lng": 135.098836,
    "sourceArea": "名谷キャンパス",
    "officialMapNumber": "6"
  },
  {
    "id": "official-myodani-7",
    "name": "保健科学図書室",
    "campus": "名谷",
    "lat": 34.6716355,
    "lng": 135.099131,
    "sourceArea": "名谷キャンパス",
    "officialMapNumber": "7"
  },
  {
    "id": "official-fukae-1",
    "name": "機関実験実習センター",
    "campus": "深江",
    "lat": 34.7202716,
    "lng": 135.2913246,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "1"
  },
  {
    "id": "official-fukae-2",
    "name": "エネルギー工学実験棟",
    "campus": "深江",
    "lat": 34.7200643,
    "lng": 135.2909276,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "2"
  },
  {
    "id": "official-fukae-3",
    "name": "先端ものづくり工房技術部センター",
    "campus": "深江",
    "lat": 34.7199952,
    "lng": 135.2914104,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "3"
  },
  {
    "id": "official-fukae-4",
    "name": "海事科学研究科・4号館",
    "campus": "深江",
    "lat": 34.7196072,
    "lng": 135.2913836,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "4"
  },
  {
    "id": "official-fukae-5",
    "name": "水素実験棟",
    "campus": "深江",
    "lat": 34.7198321,
    "lng": 135.291625,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "5"
  },
  {
    "id": "official-fukae-6",
    "name": "熱工学実験棟",
    "campus": "深江",
    "lat": 34.7196866,
    "lng": 135.2917001,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "6"
  },
  {
    "id": "official-fukae-7",
    "name": "総合水槽実験棟",
    "campus": "深江",
    "lat": 34.7198986,
    "lng": 135.2919086,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "7"
  },
  {
    "id": "official-fukae-8",
    "name": "極低温実験棟",
    "campus": "深江",
    "lat": 34.7194317,
    "lng": 135.2922437,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "8"
  },
  {
    "id": "official-fukae-9",
    "name": "RI・加速器実験棟",
    "campus": "深江",
    "lat": 34.7193807,
    "lng": 135.2918891,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "9"
  },
  {
    "id": "official-fukae-10",
    "name": "海事科学研究科・3号館",
    "campus": "深江",
    "lat": 34.7193587,
    "lng": 135.2913795,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "10"
  },
  {
    "id": "official-fukae-11",
    "name": "海事科学研究科・5号館",
    "campus": "深江",
    "lat": 34.7195889,
    "lng": 135.2909074,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "11"
  },
  {
    "id": "official-fukae-12",
    "name": "海事科学研究科・2号館",
    "campus": "深江",
    "lat": 34.7196727,
    "lng": 135.2902905,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "12"
  },
  {
    "id": "official-fukae-13",
    "name": "総合学術交流棟・国際海事研究センター・海洋底探査センター・梅木ホール",
    "campus": "深江",
    "lat": 34.718976,
    "lng": 135.2905748,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "13"
  },
  {
    "id": "official-fukae-14",
    "name": "門衛所(守衛室)",
    "campus": "深江",
    "lat": 34.7194213,
    "lng": 135.2893893,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "14"
  },
  {
    "id": "official-fukae-15",
    "name": "講堂・海事博物館",
    "campus": "深江",
    "lat": 34.7190912,
    "lng": 135.2892953,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "15"
  },
  {
    "id": "official-fukae-16",
    "name": "体育館・課外活動共用施設",
    "campus": "深江",
    "lat": 34.7189589,
    "lng": 135.2889305,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "16"
  },
  {
    "id": "official-fukae-17",
    "name": "保健管理センター深江分室",
    "campus": "深江",
    "lat": 34.7187958,
    "lng": 135.2890861,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "17"
  },
  {
    "id": "official-fukae-18",
    "name": "水先教育研究棟",
    "campus": "深江",
    "lat": 34.7187958,
    "lng": 135.2885067,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "18"
  },
  {
    "id": "official-fukae-19",
    "name": "屋内プール",
    "campus": "深江",
    "lat": 34.7185845,
    "lng": 135.2885921,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "19"
  },
  {
    "id": "official-fukae-20",
    "name": "大学会館・食堂",
    "campus": "深江",
    "lat": 34.7183197,
    "lng": 135.2887317,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "20"
  },
  {
    "id": "official-fukae-21",
    "name": "海事科学研究科・6号館",
    "campus": "深江",
    "lat": 34.7181326,
    "lng": 135.2889756,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "21"
  },
  {
    "id": "official-fukae-22",
    "name": "海事科学研究科事務棟",
    "campus": "深江",
    "lat": 34.7184721,
    "lng": 135.2890675,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "22"
  },
  {
    "id": "official-fukae-23",
    "name": "附属図書館海事科学分館",
    "campus": "深江",
    "lat": 34.718429,
    "lng": 135.289498,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "23"
  },
  {
    "id": "official-fukae-24",
    "name": "海事科学研究科・1号館",
    "campus": "深江",
    "lat": 34.7186359,
    "lng": 135.2898744,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "24"
  },
  {
    "id": "official-fukae-25",
    "name": "海事基盤センター",
    "campus": "深江",
    "lat": 34.7175968,
    "lng": 135.291076,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "25"
  },
  {
    "id": "official-fukae-26",
    "name": "艇庫",
    "campus": "深江",
    "lat": 34.7173807,
    "lng": 135.2911994,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "26"
  },
  {
    "id": "official-fukae-27",
    "name": "附属練習船「海神丸」",
    "campus": "深江",
    "lat": 34.7179075,
    "lng": 135.2924812,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "27"
  },
  {
    "id": "official-fukae-28",
    "name": "進徳丸メモリアル",
    "campus": "深江",
    "lat": 34.7182998,
    "lng": 135.2927278,
    "sourceArea": "深江キャンパス",
    "officialMapNumber": "28"
  },
  {
    "id": "official-other-1",
    "name": "東京オフィス",
    "campus": "その他",
    "lat": 35.6748965,
    "lng": 139.7644022,
    "sourceArea": "その他の地区",
    "officialMapNumber": "1"
  },
  {
    "id": "official-other-2",
    "name": "インターナショナル・レジデンス",
    "campus": "その他",
    "lat": 34.670724,
    "lng": 135.2145143,
    "sourceArea": "その他の地区",
    "officialMapNumber": "2"
  },
  {
    "id": "official-other-3",
    "name": "住吉寮・住吉国際学生宿舎",
    "campus": "その他",
    "lat": 34.7348288,
    "lng": 135.2541217,
    "sourceArea": "その他の地区",
    "officialMapNumber": "3"
  },
  {
    "id": "official-other-5",
    "name": "国維寮",
    "campus": "その他",
    "lat": 34.7202263,
    "lng": 135.2177357,
    "sourceArea": "その他の地区",
    "officialMapNumber": "5"
  },
  {
    "id": "official-other-6",
    "name": "白鴎寮",
    "campus": "その他",
    "lat": 34.7229356,
    "lng": 135.2878897,
    "sourceArea": "その他の地区",
    "officialMapNumber": "6"
  },
  {
    "id": "official-other-7",
    "name": "国際交流会館",
    "campus": "その他",
    "lat": 34.7229356,
    "lng": 135.2878897,
    "sourceArea": "その他の地区",
    "officialMapNumber": "7"
  },
  {
    "id": "official-other-8",
    "name": "学而荘",
    "campus": "その他",
    "lat": 34.7161781,
    "lng": 135.2423325,
    "sourceArea": "その他の地区",
    "officialMapNumber": "8"
  }
];

const UPDATED_AT = "2026-06-03";

export const officialFacilities: Facility[] = officialFacilityRecords.map((record) => {
  const officialLabel = record.officialMapNumber
    ? `公式地図No.${record.officialMapNumber}`
    : "追加座標";
  const numberTags = record.officialMapNumber
    ? [
        record.officialMapNumber,
        `No.${record.officialMapNumber}`,
        `公式地図${record.officialMapNumber}`,
        officialLabel
      ]
    : [];

  return {
    id: record.id,
    name: record.name,
    category: "official",
    campus: record.campus,
    area: record.campus,
    position: { lat: record.lat, lng: record.lng },
    summary: `${record.campus}の${officialLabel}に対応する施設ピン。`,
    description:
      `「${record.sourceArea}」の座標データをもとに配置したピンです。` +
      (record.officialMapNumber
        ? `神戸大学公式地図の番号${record.officialMapNumber}に対応しています。`
        : ""),
    aliases: [record.name, ...numberTags],
    tags: ["公式地図", "座標", record.campus, record.sourceArea, ...numberTags],
    sourceArea: record.sourceArea,
    updatedAt: UPDATED_AT,
    source: `ShindaiMap coordinate data / ${record.sourceArea}`,
    ...(record.officialMapNumber
      ? { officialMapNumber: record.officialMapNumber }
      : {})
  };
});
