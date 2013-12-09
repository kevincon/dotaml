from logistic_regression.logistic_regression import D2LogisticRegression
from dota2py import api
import os

# Initialize DOTA2 Web API
key = os.environ.get('DOTABOT_API_KEY')
api.set_api_key(key)
heroes = api.get_heroes()['result']['heroes']

def get_hero_human_readable(hero_id):
    for hero in heroes:
        if hero['id'] == hero_id:
            return hero['localized_name']
    return 'Unknown hero: %d' % hero_id

def main():
    # Fill these out using hero IDs (see web API)

    #Example: match_id = 415285235
    #radiant = pudge, enigma, templar assassin, vengeful spirit, REMOVED juggernaut
    my_team = [14, 33, 46, 20]
    #dire = invoker, rubick, phantom assassin, clinkz, phantom lancer
    their_team = [74, 86, 44, 56, 12]

    print 'My Team: %s' % [get_hero_human_readable(hero_id) for hero_id in my_team]
    print 'Their Team: %s' % [get_hero_human_readable(hero_id) for hero_id in their_team]
    print 'Recommend:'
    engine = Engine(D2LogisticRegression())
    recommendations = engine.recommend(my_team, their_team)
    print '\n'.join([str(element) for element in recommendations])

class Engine:
    def __init__(self, algorithm):
        self.algorithm = algorithm

    def get_candidates(self, my_team, their_team):
        '''Returns a list of hero IDs to consider for recommending.'''
        # TODO use web api result to make this more robust
        return [i for i in range(1, 109) if i not in my_team and i not in their_team and i not in [24, 105]]

    def recommend(self, my_team, their_team):
        '''Returns a list of 5 (hero_name, probability) tuples recommended by the engine.'''
        assert len(my_team) < 5
        assert len(their_team) <= 5

        hero_candidates = self.get_candidates(my_team, their_team)
        team_possibilities = [(candidate, my_team + [candidate]) for candidate in hero_candidates]

        prob_candidate_pairs = []
        for candidate, team in team_possibilities:
            query = self.algorithm.transform(team, their_team)
            prob = self.algorithm.model.predict_proba(query)[0][1]
            prob_candidate_pairs.append((prob, candidate))
        prob_candidate_pairs.sort(reverse=True)

        result = [(get_hero_human_readable(candidate), prob) for prob, candidate in prob_candidate_pairs]
        return result[0:5]

if __name__ == "__main__":
    main()
