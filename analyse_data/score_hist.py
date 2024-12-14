import json
import matplotlib.pyplot as plt

# Load JSON data from file
with open('/home/syy/dev/TrueSwiftie/analyse_data/scores.json', 'r') as file:
    data = json.load(file)

# Extract scores
scores = [entry['score'] for entry in data]

# Create histogram
plt.hist(scores, bins=range(min(scores), max(scores) + 2), edgecolor='black')
plt.xlabel('Scores')
plt.ylabel('Frequency')
plt.title('Histogram of Scores')
plt.show()