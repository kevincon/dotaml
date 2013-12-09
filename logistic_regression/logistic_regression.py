import numpy as np
import pickle

NUM_HEROES = 108
NUM_FEATURES = NUM_HEROES * 2

class D2LogisticRegression:
    def __init__(self):
        with open('logistic_regression/model.pkl', 'r') as input_file:
            self.model = pickle.load(input_file)

    def transform(self, my_team, their_team):
        X = np.zeros(NUM_FEATURES, dtype=np.int8)
        for hero_id in my_team:
            X[hero_id - 1] = 1
        for hero_id in their_team:
            X[hero_id - 1 + NUM_HEROES] = 1
        return X
