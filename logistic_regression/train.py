from sklearn.linear_model import LogisticRegression
import pickle
import numpy as np

def train(X, Y, num_samples):
    print 'Training using data from %d matches...' % num_samples
    return LogisticRegression().fit(X[0:num_samples], Y[0:num_samples])

def main():
    # Import the preprocessed training X matrix and Y vector
    preprocessed = np.load('train_51022.npz')
    X_train = preprocessed['X']
    Y_train = preprocessed['Y']

    model = train(X_train, Y_train, len(X_train))

    with open('model.pkl', 'w') as output_file:
        pickle.dump(model, output_file)

if __name__ == "__main__":
    main()
