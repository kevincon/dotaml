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
    #radiant = OD, lifestealer, venomancer, clockwerk, visage
    my_team = [76, 54, 51,92]
    #dire = CM, razor, TA, wisp, puck
    their_team = [5, 15, 46, 91, 13]

    print 'My Team: %s' % [get_hero_human_readable(hero_id) for hero_id in my_team]
    print 'Their Team: %s' % [get_hero_human_readable(hero_id) for hero_id in their_team]
    print 'Recommend:'
    engine = Engine(D2LogisticRegression())
    recommendations = engine.recommend(my_team, their_team)
    print recommendations
    #print '\n'.join([str(element) for element in recommendations])

class Engine:
    def __init__(self, algorithm):
        self.algorithm = algorithm

    def get_candidates(self, my_team, their_team):
        '''Returns a list of hero IDs to consider for recommending.'''
        # TODO use web api result to make this more robust
        return [i for i in range(1, 109) if i not in my_team and i not in their_team and i not in [24, 105]]

    def recommend(self, my_team, their_team, human_readable=False):
        '''Returns a list of heros recommended and a probability of my_team winning with the recommendations.'''
        assert len(my_team) <= 5
        assert len(their_team) <= 5

        hero_candidates = self.get_candidates(my_team, their_team)
        team_possibilities = [(candidate, my_team + [candidate]) for candidate in hero_candidates]

        prob_candidate_pairs = []
        for candidate, team in team_possibilities:
            query = self.algorithm.transform(team, their_team)
            prob = self.algorithm.model.predict_proba(query)[0][1]
            prob_candidate_pairs.append((prob, candidate))
        prob_candidate_pairs = sorted(prob_candidate_pairs, reverse=True)[0:5 - len(my_team)]

        recommendations = [hero for prob, hero in prob_candidate_pairs]
        dream_team = my_team + recommendations
        dream_team_query = self.algorithm.transform(dream_team, their_team)
        prob_dream_team_wins = self.algorithm.model.predict_proba(dream_team_query)[0][1]

        if human_readable:
            recommendations = [get_hero_human_readable(hero) for hero in recommendations]
            return recommendations, prob_dream_team_wins
        else:
            recommendations = [str(hero) for hero in recommendations]
            return {'x': recommendations, 'prob_x': prob_dream_team_wins}


if __name__ == "__main__":
    main()
