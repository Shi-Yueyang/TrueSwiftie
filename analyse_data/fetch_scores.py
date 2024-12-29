import requests
import csv
# http://123.60.216.132/api/ts/game-histories/?start_time=2024-12-20
base_url = "http://123.60.216.132/api/ts/game-histories/"
params = {
    "start_time": "2024-12-20",
    "page": 1
}

all_results = []
while True:
    response = requests.get(base_url, params=params)
    data = response.json()
    all_results.extend(data['results'])
    if not data['next']:
        break
    params['page'] += 1

all_results = [{'id':record['id'], 'player_name': record['player_name'], 'score': record['score']} for record in all_results]
all_results = sorted(all_results, key=lambda x: (-x['score'], x['id']))
all_results = [{'player_name': record['player_name'], 'score': record['score']} for record in all_results]
csv_file = 'sorted_scores.csv'
with open(csv_file,'w',encoding='utf-8-sig',newline='') as csv_file:
    filednames = ['player_name','score']
    writer = csv.DictWriter(csv_file,fieldnames=filednames)
    writer.writeheader()
    writer.writerows(all_results)
