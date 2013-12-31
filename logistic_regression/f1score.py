import numpy as np
from sklearn.metrics import precision_recall_fscore_support
from logistic_regression import D2LogisticRegression

POSITIVE_LABEL = 1
NEGATIVE_LABEL = 0

def make_prediction(algo, query):
    prob = algo.score(query)
    return POSITIVE_LABEL if prob > 0.5 else NEGATIVE_LABEL

algo = D2LogisticRegression(model_root='.')

testing_data = np.load('test_5669.npz')
X = testing_data['X']
Y_true = testing_data['Y']
num_matches = len(Y_true)

Y_pred = np.zeros(num_matches)
for i, match in enumerate(X):
    Y_pred[i] = make_prediction(algo, match)

prec, recall, f1, support = precision_recall_fscore_support(Y_true, Y_pred, average='macro')

print 'Precision: ',prec
print 'Recall: ',recall
print 'F1 Score: ',f1
print 'Support: ',support

# Precision:  0.781616907078
# Recall:  0.68468997943
# F1 Score:  0.729949874687
# Support:  3403
