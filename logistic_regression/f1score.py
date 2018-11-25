import numpy as np
from sklearn.metrics import precision_recall_fscore_support
from .logistic_regression import D2LogisticRegression

POSITIVE_LABEL = 1
NEGATIVE_LABEL = 0


def make_prediction(algo, query):
    prob = algo.score(query.reshape(1, -1))
    return POSITIVE_LABEL if prob > 0.5 else NEGATIVE_LABEL


def calculate_precision_recall_fscore():
    algo = D2LogisticRegression()
    testing_data = np.load('logistic_regression/test_5669.npz')
    X = testing_data['X']
    Y_true = testing_data['Y']
    num_matches = len(Y_true)
    Y_pred = np.zeros(num_matches)
    for i, match in enumerate(X):
        Y_pred[i] = make_prediction(algo, match)
    prec, recall, f1, _ = precision_recall_fscore_support(Y_true, Y_pred, average='binary')
    return prec, recall, f1
