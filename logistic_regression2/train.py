from sklearn.linear_model import LogisticRegression
from sklearn import cross_validation
import numpy as np

# Import the preprocessed X matrix and Y vector
preprocessed = np.load('preprocessed.npz')
X = preprocessed['X']
Y = preprocessed['Y']

NUM_MATCHES = len(X)
print 'Training using data from %d matches...' % NUM_MATCHES

k_fold = cross_validation.KFold(n=NUM_MATCHES, n_folds=10, indices=True)

# Find the Logistic Regression model with maximum accuracy on its test set
score_model_pairs = []
for train, test in k_fold:
    model = LogisticRegression().fit(X[train], Y[train])
    score = model.score(X[test], Y[test])
    score_model_pairs.append((score, model))

ranked = sorted(score_model_pairs)

score, best_model = ranked[0]

print 'Best model achieved %f accuracy on its test set.' % score
