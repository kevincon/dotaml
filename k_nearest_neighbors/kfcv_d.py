from sklearn.neighbors import KNeighborsClassifier
from sklearn.model_selection import cross_val_score, KFold
import numpy as np
from progressbar import ProgressBar, Bar, Percentage, FormatLabel, ETA

def my_distance(vec1,vec2):
    #return np.sum(np.multiply(vec1,vec2))
    return np.sum(np.logical_and(vec1,vec2))

def poly_param(d):
    def poly_weights(distances):
        '''Returns a list of weights given a polynomial weighting function'''
        weights = np.power(np.multiply(distances[0], 0.1), d)
        return np.array([weights])
    return poly_weights

def score(estimator, X, y):
    global pbar, FOLDS_FINISHED
    correct_predictions = 0
    for i, radiant_features in enumerate(X):
        pbar.update(FOLDS_FINISHED)

        radiant_query = radiant_features.reshape(1, -1)
        rad_prob = estimator.predict_proba(radiant_query)[0][1]

        dire_features = np.concatenate((radiant_features[NUM_HEROES:NUM_FEATURES], radiant_features[0:NUM_HEROES]))
        dire_query = dire_features.reshape(1, -1)
        dire_prob = estimator.predict_proba(dire_query)[0][0]

        overall_prob = (rad_prob + dire_prob) / 2
        prediction = 1 if (overall_prob > 0.5) else -1
        result = 1 if prediction == y[i] else 0
        correct_predictions += result
    FOLDS_FINISHED += 1
    accuracy = float(correct_predictions) / len(X)
    print(f'Accuracy: {accuracy}')
    return accuracy

NUM_HEROES = 108
NUM_FEATURES = NUM_HEROES*2
K = 2
FOLDS_FINISHED = 0

# Import the preprocessed X matrix and Y vector
preprocessed = np.load('train_51022.npz')
X = preprocessed['X']
Y = preprocessed['Y']

NUM_MATCHES = 20000
X = X[0:NUM_MATCHES]
Y = Y[0:NUM_MATCHES]

print(f'Training using data from {NUM_MATCHES} matches...')
kfold = KFold(K)

d_tries = [3, 4, 5]

widgets = [FormatLabel('Processed: %(value)d/%(max)d folds. '), ETA(), Percentage(), ' ', Bar()]
pbar = ProgressBar(widgets=widgets, maxval=(len(d_tries) * K)).start()

d_accuracy_pairs = []
for d_index, d in enumerate(d_tries):
    model = KNeighborsClassifier(n_neighbors=NUM_MATCHES//K,metric=my_distance,weights=poly_param(d))
    model_accuracies = cross_val_score(model, X, Y, scoring=score, cv=kfold)
    model_accuracy = model_accuracies.mean()
    d_accuracy_pairs.append((d, model_accuracy))
pbar.finish()
print(d_accuracy_pairs)
