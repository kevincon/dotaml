import numpy as np
import pickle, os

NUM_HEROES = 108
NUM_FEATURES = NUM_HEROES * 2
NUM_IN_QUERY = 0
# Lower this value to speed up recommendation engine
TRAINING_SET_SIZE = 10000

def my_distance(vec1,vec2):
    '''Returns a count of the elements that were 1 in both vec1 and vec2.'''
    return np.sum(np.logical_and(vec1,vec2))

def poly_weights_recommend(distances):
    '''Returns a list of weights for the provided list of distances.'''
    global NUM_IN_QUERY
    distances[0] = np.power(np.multiply(distances[0], NUM_IN_QUERY), 4)
    return distances

def poly_weights_evaluate(distances):
    '''Returns a list of weights for the provided list of distances.'''
    distances[0] = np.power(np.multiply(distances[0], NUM_IN_QUERY), 4)
    return distances
    # weights = np.power(np.multiply(distances[0], 0.1), 15)
    # return np.array([weights])

class D2KNearestNeighbors:
    def __init__(self, model_root='k_nearest_neighbors'):
        recommend_path = os.path.join(model_root, 'recommend_models_%d.pkl' % TRAINING_SET_SIZE)
        evaluate_path = os.path.join(model_root, 'evaluate_model_%d.pkl' % TRAINING_SET_SIZE)

        with open(recommend_path, 'r') as input_file:
            self.recommend_models = pickle.load(input_file)
        with open(evaluate_path, 'r') as input_file:
            self.evaluate_model = pickle.load(input_file)

    def transform(self, my_team, their_team):
        X = np.zeros(NUM_FEATURES, dtype=np.int8)
        for hero_id in my_team:
            X[hero_id - 1] = 1
        for hero_id in their_team:
            X[hero_id - 1 + NUM_HEROES] = 1
        return X

    def recommend(self, my_team, their_team, hero_candidates):
        '''Returns a list of (hero, probablility of winning with hero added) recommended to complete my_team.'''
        global NUM_IN_QUERY
        NUM_IN_QUERY = len(my_team) + len(their_team) + 1
        team_possibilities = [(candidate, my_team + [candidate]) for candidate in hero_candidates]

        prob_candidate_pairs = []
        for candidate, team in team_possibilities:
            query_radiant = self.transform(team, their_team)
            query_dire = self.transform(their_team, team)
            prob_radiant = self.recommend_models[candidate-1].predict_proba(query_radiant)[0][1]
            prob_dire = self.recommend_models[candidate-1+NUM_HEROES].predict_proba(query_dire)[0][0]
            prob = (prob_radiant + prob_dire) / 2
            prob_candidate_pairs.append((prob, candidate))
        prob_candidate_pairs = sorted(prob_candidate_pairs, reverse=True)[0:5 - len(my_team)]
        return prob_candidate_pairs

    def score(self, query):
        '''Score the query using the evaluation model, considering both radiant and dire teams.'''
        radiant_query = query
        dire_query = np.concatenate((radiant_query[NUM_HEROES:NUM_FEATURES], radiant_query[0:NUM_HEROES]))
        rad_prob = self.evaluate_model.predict_proba(radiant_query)[0][1]
        dire_prob = self.evaluate_model.predict_proba(dire_query)[0][0]
        return (rad_prob + dire_prob) / 2

    def predict(self, dream_team, their_team):
        '''Returns the probability of the dream_team winning against their_team.'''
        dream_team_query = self.transform(dream_team, their_team)
        return self.score(dream_team_query)
