from flask import Flask, render_template, request
from engine import Engine
from logistic_regression.logistic_regression import D2LogisticRegression
import json

app = Flask(__name__)
engine = Engine(D2LogisticRegression())


@app.route("/")
def index():
    return render_template('index.html')

@app.route("/api/suggest/")
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

    print my_team, their_team

    result = engine.recommend(my_team, their_team)
    return json.dumps(result)

if __name__ == "__main__":
    app.debug = True
    app.run()
