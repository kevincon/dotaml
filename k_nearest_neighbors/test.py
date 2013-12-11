import numpy as np
import pickle
from progressbar import ProgressBar, Bar, Percentage, FormatLabel, ETA

NUM_HEROES = 108
NUM_FEATURES = NUM_HEROES*2

# Import the test x matrix and Y vector
preprocessed = np.load('test.npz')
X = preprocessed['X']
Y = preprocessed['Y']

NUM_MATCHES = len(X)

def my_distance(vec1,vec2):
    return np.sum(np.logical_and(vec1,vec2))

def poly_weights(distances):
    '''Returns a list of weights given a polynomial weighting function'''
    # distances = distances[0]
    # weights = (distances * 0.1)
    # weights = weights ** 15
    weights = np.power(np.multiply(distances[0], 0.1), 15)
    return np.array([weights])

def test():
    with open('evaluate_model.pkl', 'r') as input_file:
            model = pickle.load(input_file)

    widgets = [FormatLabel('Processed: %(value)d/%(max)d matches. '), ETA(), Percentage(), ' ', Bar()]
    pbar = ProgressBar(widgets=widgets, maxval=NUM_MATCHES).start()

    correct_predictions = 0
    for i, radiant_query in enumerate(X):
        pbar.update(i)
        dire_query = np.concatenate((radiant_query[NUM_HEROES:NUM_FEATURES], radiant_query[0:NUM_HEROES]))
        rad_prob = model.predict_proba(radiant_query)[0][1]
        dire_prob = model.predict_proba(dire_query)[0][0]
        overall_prob = (rad_prob + dire_prob) / 2
        prediction = 1 if (overall_prob > 0.5) else -1
        result = 1 if prediction == Y[i] else 0
        correct_predictions += result

    pbar.finish()

    accuracy = float(correct_predictions) / NUM_MATCHES
    print 'Accuracy of KNN model: %f' % accuracy

if __name__ == '__main__':
    test()
