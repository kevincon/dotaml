from sklearn.neighbors import KNeighborsClassifier
import pickle
import numpy as np

# Import the preprocessed x matrix and Y vector
preprocessed = np.load('train_51022.npz')
X = preprocessed['X']
Y = preprocessed['Y']

relevant_indices = range(0, 10000)
X = X[relevant_indices]
Y = Y[relevant_indices]

def my_distance(vec1,vec2):
    '''Returns a count of the elements that were 1 in both vec1 and vec2.'''
    #dummy return value to pass pyfuncdistance check
    return 0.0

def poly_weights_recommend(distances):
    '''Returns a list of weights for the provided list of distances.'''
    pass

NUM_HEROES = 108
NUM_MATCHES = len(X)

print 'Training recommendation models using data from %d matches...' % NUM_MATCHES

models = []

# Radiant Loop
for hero_id in range(1, 109):
    if hero_id in [24,104,105,108]:
        models.append(None)
        continue
    X_filtered = []
    Y_filtered = []
    for i,row in enumerate(X):
        if row[hero_id-1] == 1:
            X_filtered.append(row)
            Y_filtered.append(Y[i])
    X_filtered = np.array(X_filtered)
    Y_filtered = np.array(Y_filtered)
    try:
        models.append(KNeighborsClassifier(n_neighbors=len(X_filtered),metric=my_distance,weights=poly_weights_recommend).fit(X_filtered, Y_filtered))
    except Exception,e:
        print "Radiant fit error!!! %s" % e

# Dire Loop
for hero_id in range(1, 109):
    if hero_id in [24,104,105,108]:
        models.append(None)
        continue
    X_filtered = []
    Y_filtered = []
    for i,row in enumerate(X):
        if row[hero_id-1+NUM_HEROES] == 1:
            X_filtered.append(row)
            Y_filtered.append(Y[i])
    X_filtered = np.array(X_filtered)
    Y_filtered = np.array(Y_filtered)
    try:
        models.append(KNeighborsClassifier(n_neighbors=len(X_filtered),metric=my_distance,weights=poly_weights_recommend).fit(X_filtered, Y_filtered))
    except Exception,e:
        print "Dire fit error!!! %s" % e

# Populate model pickle
with open('recommend_models_%d.pkl' % NUM_MATCHES, 'w') as output_file:
    pickle.dump(models, output_file)
