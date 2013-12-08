from pymongo import MongoClient
from progressbar import ProgressBar, Bar, Percentage, FormatLabel, ETA
import numpy as np

np.set_printoptions(threshold=np.nan)

client = MongoClient()
db = client.dotabot
matches = db.matches

# We're going to create a training matrix, X, where each
# row is a different match and each column is a feature

# The features are bit vectors indicating whether heroes
# were picked (1) or not picked (0). The first N features
# correspond to radiant, and the last N features are
# for dire.

NUM_HEROES = 106
NUM_FEATURES = NUM_HEROES * 2

# Hero IDs number 1 to 108 but skip 24 and 105, so compensate
def hero_id_to_index(hero_id):
    # TODO Instead of doing this, use dota2py api call
    # to dynamically get latest heroes
    if hero_id >= 24:
        return hero_id - 2
    elif hero_id >= 105:
        return hero_id - 3
    else:
        # indexed by zero
        return hero_id - 1


# Our training label vector, Y, is a bit vector indicating
# whether radiant won (1) or lost (0)
NUM_MATCHES = matches.count()

# Initialize training matrix
X = np.zeros((NUM_MATCHES, NUM_FEATURES), dtype=np.int8)

# Initialize training label vector
Y = np.zeros(NUM_MATCHES, dtype=np.int8)

widgets = [FormatLabel('Processed: %(value)d/%(max)d matches. '), ETA(), Percentage(), ' ', Bar()]
pbar = ProgressBar(widgets=widgets, maxval=NUM_MATCHES).start()

for i, record in enumerate(matches.find()):
    pbar.update(i)
    Y[i] = 1 if record['radiant_win'] else 0
    players = record['players']
    for player in players:
        hero_id = player['hero_id']
        hero_id_index = hero_id_to_index(hero_id)

        # If the left-most bit of player_slot is set,
        # this player is on dire, so push the index accordingly
        player_slot = player['player_slot']
        if player_slot >= 128:
            hero_id_index += NUM_HEROES

        X[i, hero_id_index] = 1

pbar.finish()
print "Saving output file now..."
np.savez_compressed('preprocessed.npz', X=X, Y=Y)
