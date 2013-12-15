from flask import Flask, render_template, request
from engine import Engine
from k_nearest_neighbors.k_nearest_neighbors import D2KNearestNeighbors, my_distance, poly_weights_recommend, poly_weights_evaluate
from logistic_regression.logistic_regression import D2LogisticRegression
import json

URL_PREFIX = ''

app = Flask(__name__)
engine = Engine(D2KNearestNeighbors())
#engine = Engine(D2LogisticRegression())

def get_api_string(recommendations, prob):
    recommendations = map(str, recommendations)
    return json.dumps({'x': recommendations, 'prob_x': prob})

@app.route("/")
def index():
    return render_template('index.html')

@app.route(URL_PREFIX + "/api/suggest/")
def api():
    if 'x' not in request.args or 'y' not in request.args:
        return 'Invalid request'
    my_team = request.args['x'].split(',')
    if len(my_team) == 1 and my_team[0] == '':
        my_team = []
    else:
        my_team = map(int, my_team)

    their_team = request.args['y'].split(',')
    if len(their_team) == 1 and their_team[0] == '':
        their_team = []
    else:
        their_team = map(int, their_team)

    prob_recommendation_pairs = engine.recommend(my_team, their_team)
    recommendations = [hero for prob, hero in prob_recommendation_pairs]
    prob = engine.predict(my_team, their_team)
    return get_api_string(recommendations, prob)

if __name__ == "__main__":
    app.debug = True
    app.run()
