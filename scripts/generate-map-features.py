#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generate image-derived campus-map feature coordinates.

The source pixel points in this script are reviewed against the public Kobe
University campus-map images cached under ``.cache/official-map-sources``.
Latitude/longitude values are calculated from nearby official numbered map pins
that already exist in ``src/data/officialFacilities.json``.

日本語: 公式キャンパスマップ画像上のアイコン位置を、番号付き施設ピンを
制御点として緯度経度に変換し、アプリ用のJSONを生成します。
"""

from __future__ import annotations

import json
import math
from pathlib import Path
from typing import TypedDict

import numpy as np


ROOT = Path(__file__).resolve().parents[1]
OFFICIAL_FACILITIES_JSON_PATH = ROOT / "src/data/officialFacilities.json"
OUTPUT_PATH = ROOT / "src/data/mapFeatures.json"


class Feature(TypedDict, total=False):
    map: str
    id: str
    name: str
    category: str
    campus: str
    pixel: tuple[float, float]
    note: str


MAP_SOURCES = {
    "rokkodai1": {
        "source_area": "六甲台第1キャンパスマップ",
        "source_image": "rokkodai1.png",
        "official_source_area": "六甲台第1キャンパス",
        "controls": {
            "26": (209.6, 37.0),
            "27": (215.5, 110.4),
            "28": (471.6, 533.2),
            "29": (330.8, 527.1),
            "30": (282.0, 642.8),
            "31": (201.0, 685.5),
            "32": (367.8, 689.1),
            "33": (513.1, 593.9),
            "34": (517.9, 677.4),
            "35": (629.0, 801.4),
            "36": (618.7, 901.5),
            "37": (464.4, 957.3),
            "38": (406.6, 880.5),
            "39": (308.4, 767.4),
            "40": (186.5, 893.2),
            "41": (302.4, 910.9),
            "42": (209.5, 1141.4),
        },
    },
    "rokkodai2_south": {
        "source_area": "六甲台第2キャンパスマップ",
        "source_image": "rokkodai2.jpg",
        "official_source_area": "六甲台第2キャンパス",
        "controls": {
            "75": (3575.0409, 2603.9421),
            "76": (3722.4860, 2779.9622),
            "77": (3742.1788, 2977.6392),
            "83": (3115.7628, 3041.7510),
            "84": (3116.1832, 3231.4518),
            "85": (3325.0717, 3364.0517),
            "86": (3437.1285, 3550.2795),
            "96": (2682.0035, 3486.6573),
            "97": (2953.1773, 3541.5941),
            "98": (2746.3059, 3785.6706),
            "99": (2081.3267, 4057.5845),
            "100": (2289.6918, 4064.8032),
            "101": (2974.32, 4002.4449),
            "102": (3559.2195, 3808.3230),
            "103": (3941.4524, 3745.3042),
            "104": (3920.8615, 3121.0632),
        },
    },
    "tsurukabuto1": {
        "source_area": "鶴甲第1キャンパスマップ",
        "source_image": "tsurukabuto1.png",
        "official_source_area": "鶴甲第1キャンパス",
        "controls": {
            "10": (649.6, 146.8),
            "11": (585.9, 147.4),
            "12": (498.3, 146.4),
            "13": (342.7, 150.9),
            "14": (296.7, 200.8),
            "15": (236.0, 215.5),
            "16": (250.0, 253.3),
            "17": (334.6, 251.2),
            "18": (378.6, 282.2),
            "19": (297.0, 299.9),
            "20": (338.6, 341.8),
            "21": (229.3, 337.4),
            "22": (302.8, 383.1),
            "23": (354.9, 416.8),
            "24": (366.1, 448.8),
            "25": (152.8, 579.3),
        },
    },
    "tsurukabuto2": {
        "source_area": "鶴甲第2キャンパスマップ",
        "source_image": "tsurukabuto2.png",
        "official_source_area": "鶴甲第2キャンパス",
        "controls": {
            "1": (584.0, 307.0),
            "2": (442.0, 392.0),
            "3": (294.0, 430.0),
            "4": (624.0, 391.0),
            "5": (545.0, 489.0),
            "6": (359.0, 493.0),
            "7": (399.0, 571.0),
            "8": (269.0, 568.0),
            "9": (270.0, 738.0),
        },
    },
    "kusunoki": {
        "source_area": "楠地区キャンパスマップ",
        "source_image": "kusunoki.png",
        "official_source_area": "楠キャンパス",
        "controls": {
            "1": (2695.7, 2274.3),
            "2": (3640.7, 1614.9),
            "3": (5434.6, 1014.5),
            "4": (4915.5, 2460.2),
            "5": (4310.3, 3629.2),
            "6": (5771.2, 3661.8),
            "7": (6152.8, 4820.5),
            "8": (4971.9, 4850.6),
            "9": (3562.9, 4789.1),
            "10": (2875.7, 4591.1),
            "11": (3846.2, 5826.1),
            "12": (3811.5, 6638.2),
            "13": (3698.3, 7268.0),
            "14": (1575.6, 7897.8),
        },
    },
    "myodani": {
        "source_area": "名谷地区キャンパスマップ",
        "source_image": "myodani.png",
        "official_source_area": "名谷キャンパス",
        "controls": {
            "1": (1534.1, 3615.3),
            "2": (2588.4, 3370.4),
            "3": (2394.3, 4228.1),
            "4": (2902.2, 4788.4),
            "5": (2394.6, 4887.4),
            "6": (2551.6, 5424.0),
            "7": (3073.3, 5411.7),
        },
    },
    "fukae": {
        "source_area": "深江地区キャンパスマップ",
        "source_image": "fukae.png",
        "official_source_area": "深江キャンパス",
        "controls": {
            "1": (3826.4, 1719.5),
            "2": (3431.2, 1768.0),
            "3": (3661.6, 1999.6),
            "4": (3569.7, 2377.4),
            "5": (3792.6, 2195.8),
            "6": (3792.4, 2342.9),
            "7": (4060.1, 2294.3),
            "8": (4154.3, 2778.1),
            "9": (3796.8, 2747.9),
            "10": (3467.8, 2595.5),
            "11": (3216.6, 2253.3),
            "12": (2811.5, 1930.7),
            "13": (2741.6, 2691.5),
            "14": (2022.0, 1772.5),
            "15": (1833.0, 2119.2),
            "16": (1467.9, 2128.3),
            "17": (1527.0, 2319.9),
            "18": (1068.1, 2134.3),
            "19": (1073.0, 2344.2),
            "20": (1038.4, 2642.7),
            "21": (1197.1, 2919.0),
            "22": (1396.2, 2619.4),
            "23": (1698.1, 2903.5),
            "24": (2118.6, 2783.1),
            "25": (2575.9, 4210.0),
            "26": (2571.5, 4462.9),
            "27": (3772.6, 4546.8),
            "28": (4137.2, 4210.2),
        },
    },
}


FEATURES: list[Feature] = [
    {"map": "rokkodai1", "id": "map-rokkodai1-motorcycle-northwest", "name": "六甲台第1 北西バイク駐輪場", "category": "motorcycle-parking", "campus": "六甲台第1", "pixel": (208.4, 445.4)},
    {"map": "rokkodai1", "id": "map-rokkodai1-motorcycle-west", "name": "六甲台第1 西側バイク駐輪場", "category": "motorcycle-parking", "campus": "六甲台第1", "pixel": (142.8, 558.4)},
    {"map": "rokkodai1", "id": "map-rokkodai1-motorcycle-south", "name": "六甲台第1 南側バイク駐輪場", "category": "motorcycle-parking", "campus": "六甲台第1", "pixel": (212.1, 1172.3)},
    {"map": "rokkodai1", "id": "map-rokkodai1-restaurant-south", "name": "六甲台第1 南側レストラン・食堂", "category": "food", "campus": "六甲台第1", "pixel": (174.6, 1099.3)},
    {"map": "rokkodai1", "id": "map-rokkodai1-office-south", "name": "六甲台第1 南側守衛室", "category": "office", "campus": "六甲台第1", "pixel": (272.2, 1187.2), "note": "深江地区マップ凡例の守衛室記号と同種の青い人物記号に基づく"},
    {"map": "rokkodai1", "id": "map-rokkodai1-mailbox-south", "name": "六甲台第1 南側郵便ポスト", "category": "post", "campus": "六甲台第1", "pixel": (170.5, 1235.7)},
    {"map": "rokkodai1", "id": "map-rokkodai1-stairs-central-west", "name": "六甲台第1 中央西側階段", "category": "stairs", "campus": "六甲台第1", "pixel": (238.0, 824.0)},
    {"map": "rokkodai1", "id": "map-rokkodai1-stairs-south-central", "name": "六甲台第1 南中央階段", "category": "stairs", "campus": "六甲台第1", "pixel": (312.0, 1092.0)},
    {"map": "rokkodai1", "id": "map-rokkodai1-stairs-east", "name": "六甲台第1 東側階段", "category": "stairs", "campus": "六甲台第1", "pixel": (626.0, 856.0)},
    {"map": "rokkodai1", "id": "map-rokkodai1-stairs-southeast", "name": "六甲台第1 南東階段", "category": "stairs", "campus": "六甲台第1", "pixel": (626.0, 1112.0)},
    {"map": "rokkodai1", "id": "map-rokkodai1-slope-east-road", "name": "六甲台第1 東側急な傾斜道", "category": "slope", "campus": "六甲台第1", "pixel": (630.0, 650.0)},
    {"map": "rokkodai1", "id": "map-rokkodai1-slope-southwest-road", "name": "六甲台第1 南西急な傾斜道", "category": "slope", "campus": "六甲台第1", "pixel": (240.0, 1080.0)},

    {"map": "rokkodai2_south", "id": "map-rokkodai2-motorcycle-nature-library", "name": "六甲台第2 自然科学系図書館南バイク駐輪場", "category": "motorcycle-parking", "campus": "六甲台第2", "pixel": (3520.0, 2780.0)},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-motorcycle-science-b", "name": "六甲台第2 理学研究科B棟周辺バイク駐輪場", "category": "motorcycle-parking", "campus": "六甲台第2", "pixel": (3430.0, 3160.0)},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-motorcycle-humanities", "name": "六甲台第2 人文学研究科周辺バイク駐輪場", "category": "motorcycle-parking", "campus": "六甲台第2", "pixel": (2680.0, 3265.0)},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-shop-engineering-cafeteria", "name": "六甲台第2 工学部食堂周辺売店", "category": "food", "campus": "六甲台第2", "pixel": (4459.8, 2455.5), "note": "公式マップの売店記号に基づく"},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-atm-engineering-cafeteria", "name": "六甲台第2 工学部食堂周辺ATM", "category": "atm", "campus": "六甲台第2", "pixel": (4515.5, 2263.1), "note": "公式マップのATM記号に基づく"},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-shop-seven-eleven", "name": "六甲台第2 セブンイレブン", "category": "food", "campus": "六甲台第2", "pixel": (4568.0, 2570.5), "note": "公式マップ上のセブンイレブン記号に基づく"},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-shop-lans-box", "name": "六甲台第2 LANS BOX周辺売店", "category": "food", "campus": "六甲台第2", "pixel": (3025.5, 4101.5), "note": "公式マップの売店記号に基づく"},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-mailbox-honbu-kogakubu", "name": "六甲台第2 神大本部工学部前郵便ポスト", "category": "post", "campus": "六甲台第2", "pixel": (3771.3, 1626.6)},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-stairs-104", "name": "六甲台第2 情報価値創造教育棟北側階段", "category": "stairs", "campus": "六甲台第2", "pixel": (4030.0, 3180.0)},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-stairs-southwest", "name": "六甲台第2 南西階段", "category": "stairs", "campus": "六甲台第2", "pixel": (1970.0, 4070.0)},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-slope-south", "name": "六甲台第2 南側急な傾斜道", "category": "slope", "campus": "六甲台第2", "pixel": (1890.0, 3830.0)},
    {"map": "rokkodai2_south", "id": "map-rokkodai2-slope-east-104", "name": "六甲台第2 情報価値創造教育棟東側急な傾斜道", "category": "slope", "campus": "六甲台第2", "pixel": (3990.0, 3340.0)},

    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-motorcycle-east", "name": "鶴甲第1 東側バイク駐輪場", "category": "motorcycle-parking", "campus": "鶴甲第1", "pixel": (511.4, 403.9)},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-motorcycle-central", "name": "鶴甲第1 中央バイク駐輪場", "category": "motorcycle-parking", "campus": "鶴甲第1", "pixel": (407.3, 519.8)},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-motorcycle-southwest", "name": "鶴甲第1 南西バイク駐輪場", "category": "motorcycle-parking", "campus": "鶴甲第1", "pixel": (140.6, 646.1)},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-restaurant-central", "name": "鶴甲第1 レストラン・食堂", "category": "food", "campus": "鶴甲第1", "pixel": (309.9, 503.2)},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-shop-central", "name": "鶴甲第1 売店", "category": "food", "campus": "鶴甲第1", "pixel": (366.2, 448.9)},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-atm-central", "name": "鶴甲第1 中央ATM", "category": "atm", "campus": "鶴甲第1", "pixel": (340.5, 449.6), "note": "公式マップのATM記号に基づく"},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-mailbox-north", "name": "鶴甲第1 北側郵便ポスト", "category": "post", "campus": "鶴甲第1", "pixel": (631.0, 49.8)},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-stairs-west", "name": "鶴甲第1 西側階段", "category": "stairs", "campus": "鶴甲第1", "pixel": (176.8, 585.1)},
    {"map": "tsurukabuto1", "id": "map-tsurukabuto1-stairs-central", "name": "鶴甲第1 中央階段", "category": "stairs", "campus": "鶴甲第1", "pixel": (343.8, 601.2)},

    {"map": "tsurukabuto2", "id": "map-tsurukabuto2-motorcycle-west", "name": "鶴甲第2 西側バイク駐輪場", "category": "motorcycle-parking", "campus": "鶴甲第2", "pixel": (193.6, 369.4)},
    {"map": "tsurukabuto2", "id": "map-tsurukabuto2-motorcycle-southwest", "name": "鶴甲第2 南西バイク駐輪場", "category": "motorcycle-parking", "campus": "鶴甲第2", "pixel": (210.5, 679.9)},
    {"map": "tsurukabuto2", "id": "map-tsurukabuto2-shop-central", "name": "鶴甲第2 売店", "category": "food", "campus": "鶴甲第2", "pixel": (358.5, 400.9)},
    {"map": "tsurukabuto2", "id": "map-tsurukabuto2-restaurant-central", "name": "鶴甲第2 レストラン・食堂", "category": "food", "campus": "鶴甲第2", "pixel": (440.8, 392.5)},
    {"map": "tsurukabuto2", "id": "map-tsurukabuto2-mailbox-south", "name": "鶴甲第2 南側郵便ポスト", "category": "post", "campus": "鶴甲第2", "pixel": (217.5, 774.6)},
    {"map": "tsurukabuto2", "id": "map-tsurukabuto2-stairs-west", "name": "鶴甲第2 西側階段", "category": "stairs", "campus": "鶴甲第2", "pixel": (184.0, 637.0)},

    {"map": "kusunoki", "id": "map-kusunoki-parking-north", "name": "楠 北側駐車場", "category": "parking", "campus": "楠", "pixel": (3634.9, 1861.5)},
    {"map": "kusunoki", "id": "map-kusunoki-parking-west", "name": "楠 西側駐車場", "category": "parking", "campus": "楠", "pixel": (3045.1, 3423.9)},
    {"map": "kusunoki", "id": "map-kusunoki-bicycle-central", "name": "楠 中央駐輪場", "category": "bicycle-parking", "campus": "楠", "pixel": (4157.8, 4367.0)},
    {"map": "kusunoki", "id": "map-kusunoki-bicycle-east", "name": "楠 東側駐輪場", "category": "bicycle-parking", "campus": "楠", "pixel": (5808.8, 4339.7)},
    {"map": "kusunoki", "id": "map-kusunoki-bicycle-southwest", "name": "楠 南西駐輪場", "category": "bicycle-parking", "campus": "楠", "pixel": (3778.6, 5514.9)},
    {"map": "kusunoki", "id": "map-kusunoki-restaurant-west", "name": "楠 西側レストラン・食堂", "category": "food", "campus": "楠", "pixel": (2771.9, 4287.6)},
    {"map": "kusunoki", "id": "map-kusunoki-shop-west", "name": "楠 西側売店", "category": "food", "campus": "楠", "pixel": (3099.1, 4284.0), "note": "公式マップの売店記号に基づく"},
    {"map": "kusunoki", "id": "map-kusunoki-restaurant-central", "name": "楠 中央レストラン・食堂", "category": "food", "campus": "楠", "pixel": (4006.8, 3401.4)},
    {"map": "kusunoki", "id": "map-kusunoki-shop-familymart", "name": "楠 ファミリーマート", "category": "food", "campus": "楠", "pixel": (5199.0, 4180.0), "note": "公式マップ上のFamilyMart記号に基づく"},
    {"map": "kusunoki", "id": "map-kusunoki-restaurant-east", "name": "楠 東側レストラン・食堂", "category": "food", "campus": "楠", "pixel": (6191.3, 3689.7)},
    {"map": "kusunoki", "id": "map-kusunoki-mailbox-central", "name": "楠 中央郵便ポスト", "category": "post", "campus": "楠", "pixel": (3531.9, 3915.6), "note": "画像上の郵便ポスト記号中心から変換"},
    {"map": "kusunoki", "id": "map-kusunoki-stairs-south-central", "name": "楠 南中央階段", "category": "stairs", "campus": "楠", "pixel": (4580.0, 4950.0)},

    {"map": "myodani", "id": "map-myodani-bicycle-west", "name": "名谷 西側駐輪場", "category": "bicycle-parking", "campus": "名谷", "pixel": (1377.0, 4040.0)},
    {"map": "myodani", "id": "map-myodani-bicycle-east", "name": "名谷 東側駐輪場", "category": "bicycle-parking", "campus": "名谷", "pixel": (3519.0, 5094.5)},
    {"map": "myodani", "id": "map-myodani-restaurant-south", "name": "名谷 南側レストラン・食堂", "category": "food", "campus": "名谷", "pixel": (2167.4, 5435.1)},
    {"map": "myodani", "id": "map-myodani-shop-south", "name": "名谷 南側売店", "category": "food", "campus": "名谷", "pixel": (2367.5, 5431.6)},
    {"map": "myodani", "id": "map-myodani-mailbox-east", "name": "名谷 東側郵便ポスト", "category": "post", "campus": "名谷", "pixel": (4077.5, 4488.3)},
    {"map": "myodani", "id": "map-myodani-stairs-central", "name": "名谷 中央階段", "category": "stairs", "campus": "名谷", "pixel": (2800.0, 3880.0)},
    {"map": "myodani", "id": "map-myodani-stairs-south", "name": "名谷 南側階段", "category": "stairs", "campus": "名谷", "pixel": (2100.0, 5900.0)},
    {"map": "myodani", "id": "map-myodani-slope-central", "name": "名谷 中央急な傾斜道", "category": "slope", "campus": "名谷", "pixel": (2140.0, 3935.0)},
    {"map": "myodani", "id": "map-myodani-slope-south", "name": "名谷 南側急な傾斜道", "category": "slope", "campus": "名谷", "pixel": (2130.0, 5960.0)},

    {"map": "fukae", "id": "map-fukae-bicycle-north", "name": "深江 北側駐輪場", "category": "bicycle-parking", "campus": "深江", "pixel": (1768.4, 1829.6)},
    {"map": "fukae", "id": "map-fukae-bicycle-central", "name": "深江 中央駐輪場", "category": "bicycle-parking", "campus": "深江", "pixel": (2821.1, 1728.3)},
    {"map": "fukae", "id": "map-fukae-motorcycle-north", "name": "深江 北側バイク駐輪場", "category": "motorcycle-parking", "campus": "深江", "pixel": (2022.0, 1772.5), "note": "公式マップのバイク駐輪場記号に基づく"},
    {"map": "fukae", "id": "map-fukae-office-north", "name": "深江 北側守衛室", "category": "office", "campus": "深江", "pixel": (2052.3, 2050.4)},
    {"map": "fukae", "id": "map-fukae-restaurant-west", "name": "深江 西側レストラン・食堂", "category": "food", "campus": "深江", "pixel": (932.3, 2590.1)},
    {"map": "fukae", "id": "map-fukae-shop-west", "name": "深江 西側売店", "category": "food", "campus": "深江", "pixel": (932.4, 2717.2)},
    {"map": "fukae", "id": "map-fukae-stairs-central", "name": "深江 中央階段", "category": "stairs", "campus": "深江", "pixel": (2575.0, 2525.0)},
    {"map": "fukae", "id": "map-fukae-stairs-northwest", "name": "深江 北西階段", "category": "stairs", "campus": "深江", "pixel": (1243.5, 1373.0)},
]


def feature_vector(x: float, y: float) -> list[float]:
    return [1.0, x, y, x * x, x * y, y * y]


def load_official_by_source() -> dict[str, dict[str, dict[str, object]]]:
    records = json.loads(OFFICIAL_FACILITIES_JSON_PATH.read_text())
    by_source: dict[str, dict[str, dict[str, object]]] = {}
    for record in records:
        source_area = str(record.get("sourceArea", ""))
        number = record.get("officialMapNumber")
        if isinstance(number, str):
            by_source.setdefault(source_area, {})[number] = record
    return by_source


def build_transform(
    controls: dict[str, tuple[float, float]],
    official_records: dict[str, dict[str, object]],
) -> tuple[np.ndarray, np.ndarray, float]:
    labels = [number for number in controls if number in official_records]
    if len(labels) < 6:
        raise ValueError("at least six control points are required")

    x_matrix = np.array([feature_vector(*controls[number]) for number in labels], dtype=float)
    lat_values = np.array([float(official_records[number]["lat"]) for number in labels])
    lng_values = np.array([float(official_records[number]["lng"]) for number in labels])
    lat_coefficients = np.linalg.lstsq(x_matrix, lat_values, rcond=None)[0]
    lng_coefficients = np.linalg.lstsq(x_matrix, lng_values, rcond=None)[0]

    residuals = []
    for row, lat, lng in zip(x_matrix, lat_values, lng_values):
        predicted_lat = float(row @ lat_coefficients)
        predicted_lng = float(row @ lng_coefficients)
        dy = (predicted_lat - lat) * 111_320
        dx = (predicted_lng - lng) * 111_320 * math.cos(math.radians(lat))
        residuals.append(math.hypot(dx, dy))

    rmse = math.sqrt(sum(value * value for value in residuals) / len(residuals))
    return lat_coefficients, lng_coefficients, rmse


def main() -> None:
    official_by_source = load_official_by_source()
    transforms: dict[str, tuple[np.ndarray, np.ndarray, float]] = {}

    for key, source in MAP_SOURCES.items():
        transforms[key] = build_transform(
            source["controls"],
            official_by_source[str(source["official_source_area"])],
        )

    output = []
    for feature in FEATURES:
        source = MAP_SOURCES[feature["map"]]
        lat_coefficients, lng_coefficients, rmse = transforms[feature["map"]]
        x, y = feature["pixel"]
        row = np.array(feature_vector(x, y))
        record = {
            "id": feature["id"],
            "name": feature["name"],
            "category": feature["category"],
            "campus": feature["campus"],
            "lat": round(float(row @ lat_coefficients), 7),
            "lng": round(float(row @ lng_coefficients), 7),
            "sourceArea": source["source_area"],
            "sourceImage": source["source_image"],
            "sourceImagePixel": {"x": round(x, 4), "y": round(y, 4)},
            "transformRmseMeters": round(rmse, 2),
        }
        if "note" in feature:
            record["note"] = feature["note"]
        output.append(record)

    OUTPUT_PATH.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n")
    print(f"wrote {OUTPUT_PATH.relative_to(ROOT)} ({len(output)} records)")
    for key, (_, _, rmse) in transforms.items():
        print(f"{key}: rmse={rmse:.2f}m")


if __name__ == "__main__":
    main()
