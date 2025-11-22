from pathlib import Path
from . import dabopration
from . import jsonoperation
import json

#文件名唯一标识符 username+index

statistic_data = {
    "hottest": {
        "index": [],
        "user": [],
        "date": [],
        "views": [],
        "title": [],
        "content": [],
        "image_urls": []
    },
    "sort": {

    }
}

#记录文章浏览次数
viewTimesData={

}
#记录最近更新的文章
recently={
   "recently": {
        "index": [],
        "user": [],
        "date": [],
        "title": [],
        "content": [],
        "image_urls": []
    }
}
#create json if not exists or do nothing if exists
def create_json():
    statistic_json_path = dabopration.USER_file / 'statistic.json'
    jsonoperation._write_json(statistic_json_path, statistic_data,True)
    view_json_path = dabopration.USER_file / 'viewTimes.json'
    jsonoperation._write_json(view_json_path, viewTimesData,True)
    recently_json_path = dabopration.USER_file / 'recently.json'
    jsonoperation._write_json(recently_json_path, recently,True)

