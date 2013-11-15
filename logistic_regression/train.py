from sklearn.linear_model import LogisticRegression
from sklearn import cross_validation
from functools import partial
import numpy as np
#import pickle

def argmax(xs, f, **kwargs):
    '''Returns (argmax, max_value).'''
    max_value = None
    scores = map(partial(f, **kwargs), xs)
    max_value = max(scores)
    return (xs[scores.index(max_value)], max_value)


# Import the preprocessed X matrix and Y vector
preprocessed = np.load('processed.npz')
X = preprocessed['X']
Y = preprocessed['Y']
#X = pickle.load(preprocessed_file)
#Y = pickle.load(preprocessed_file)

NUM_MATCHES = len(X)
print 'Training using data from %d matches...' % NUM_MATCHES

k_fold = cross_validation.KFold(n=NUM_MATCHES, n_folds=10, indices=True)

# Find the Logistic Regression model with maximum accuracy on its test set
models = [LogisticRegression().fit(X[train], Y[train]) for train, test in k_fold]
best_model, score = argmax(models, LogisticRegression.score, X=X[test], y=Y[test])

print 'Best model achieved %f accuracy on its test set.' % score
print 'Best model achieved %f accuracy on entire dataset.' % best_model.score(X, Y)

#with open('model.pkl', 'wb') as model_file:
#    pickle.dump(model, model_file)

59 + 53