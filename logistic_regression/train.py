from sklearn.linear_model import LogisticRegression
from sklearn import cross_validation
import pickle

# Import the preprocessed X matrix and Y vector
with open('processed.pkl', 'rb') as preprocessed_file:
    X = pickle.load(preprocessed_file)
    Y = pickle.load(preprocessed_file)

NUM_MATCHES = len(X)
print NUM_MATCHES

k_fold = cross_validation.KFold(n=NUM_MATCHES, n_folds=10, indices=True)
print max([LogisticRegression().fit(X[train], Y[train]).score(X[test], Y[test]) for train, test in k_fold])

#with open('model.pkl', 'wb') as model_file:
#    pickle.dump(model, model_file)
