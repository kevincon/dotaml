import csv
import numpy as np

np.set_printoptions(threshold=np.nan)

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

with open('test.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    matches = list(reader)

    NUM_MATCHES = sum(1 for row in matches)

    # REMOVE ME
    #NUM_MATCHES = 25

    # Initialize training matrix
    X = np.zeros((NUM_MATCHES, NUM_FEATURES), dtype=np.int8)

    # Initialize training label vector
    Y = np.zeros(NUM_MATCHES, dtype=np.int8)

    for i, record in enumerate(matches):
        # REMOVE ME
        #if i >= 25:
        #    break

        Y[i] = record['radiant_win'] == 'true'

        for player_index in range(10):
            player_slot_field = 'players.%d.player_slot' % player_index
            player_slot = int(record[player_slot_field])

            hero_id_field = 'players.%d.hero_id' % player_index
            hero_id = int(record[hero_id_field])
            hero_id_index = hero_id_to_index(hero_id)

            # If the left-most bit of player_slot is set,
            # this player is on dire, so push the index accordingly
            if player_slot >= 128:
                hero_id_index += NUM_HEROES

            X[i, hero_id_index] = 1

    np.savez_compressed('processed.npz', X=X, Y=Y)
