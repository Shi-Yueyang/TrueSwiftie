import json
import csv

# Load JSON data
with open('/home/syy/dev/TrueSwiftie/analyse_data/scores.json', 'r',encoding='utf-8') as file:
    data = json.load(file)

# Extract relevant fields and sort the data
sorted_data = sorted(data, key=lambda x: (-x['score'], x['id']))

# Write to CSV
with open('sorted_scores.csv', 'w', newline='',encoding='utf-8-sig') as csvfile:
    fieldnames = ['player_name', 'score']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    for record in sorted_data:
        writer.writerow({'player_name': record['player_name'], 'score': record['score']})