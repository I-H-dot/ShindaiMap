# -*- coding: utf-8 -*-
import requests
from bs4 import BeautifulSoup
import strip

#駅IDのキーと値を格納するやつ
stationID = {
    "六甲":26590,
    "六甲道":26591,
    "新在家":26402,
    "名谷":26553,
    "大倉山":26302,
    "高速神戸":26352,
    "神戸":26357,
    "計算科学センター":29558,
    "医療センター":29557
    }
#各方面を表すやつとの対応
directionID = {
    "神戸空港・計算学センター方面":5891,#計算科学センターと医療センターで使用する
    "三宮方面":5890,#計算科学センターと医療センターで使用する
    "西明石・網干方面":1801,#六甲道と神戸で使用する
    "米原・京都方面":1800,#六甲道と神戸で使用する
    "大阪梅田・尼崎方面":4231,#新在家で使用する
    "高速神戸・神戸三宮方面":4230,#新在家で使用する
    "西神中央方面":5861,#名谷と大倉山で使用する
    "谷上・新神戸方面":5860,#名谷と大倉山で使用する
    "梅田(阪神)・神戸三宮(阪神)方面":5751,#高速神戸で使用する
    "山陽姫路・新開地方面":5750,#高速神戸で使用する
    "梅田(阪急)・神戸三宮(阪急)方面":5761,#高速神戸で使用する
    "大阪梅田・西宮北口方面":4120,#六甲で使用する
    "神戸三宮・新開地方面":4121#六甲で使用する
}
#曜日との対応
dayOfTheWeek = {
    "平日" : 1,
    "土曜" : 2,
    "日曜・祝日" : 4
}
# URL解析の結果
# https://transit.yahoo.co.jp/timetable/{駅ID(stationID)}/{方面(directionID)}/print?kind={曜日(dayOfTheWeek)}


print("探索対象駅: ",stationName)


route_url = "https://transit.yahoo.co.jp/timetable/"+stationID.stationName + directionID + "/print?" + dayOfTheWeek

# #-------ここまでとりあえず書いた。

# # Requestsを利用してWebページを取得する
# route_response = requests.get(route_url)

# # BeautifulSoupを利用してWebページを解析する
# route_soup = BeautifulSoup(route_response.text, 'html.parser')


# print("======"{検索している駅}の時刻表{方面}方面"=======")
# print("")#Jsonを見やすく表示する


