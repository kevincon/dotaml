from train import train
import numpy as np
import matplotlib.pyplot as plt
import pylab

NUM_HEROES = 108
NUM_FEATURES = NUM_HEROES * 2

def score(model, radiant_query):
    '''Return the probability of the query being in the positive class.'''
    dire_query = np.concatenate((radiant_query[NUM_HEROES:NUM_FEATURES], radiant_query[0:NUM_HEROES]))
    rad_prob = model.predict_proba(radiant_query)[0][1]
    dire_prob = model.predict_proba(dire_query)[0][0]
    return (rad_prob + dire_prob) / 2

def evaluate(model, X, Y, positive_class, negative_class):
    '''Return the accuracy of running the model on the given set.'''
    correct_predictions = 0.0
    for i, radiant_query in enumerate(X):
        overall_prob = score(model, radiant_query)
        prediction = positive_class if (overall_prob > 0.5) else negative_class
        result = 1 if prediction == Y[i] else 0
        correct_predictions += result

    return correct_predictions / len(X)

def plot_learning_curve(num_points, X_train, Y_train, X_test, Y_test, positive_class=1, negative_class=0):
    total_num_matches = len(X_train)
    training_set_sizes = []
    for div in list(reversed(range(1, num_points + 1))):
        training_set_sizes.append(total_num_matches / div)

    accuracies = []
    for training_set_size in training_set_sizes:
        model = train(X_train, Y_train, training_set_size)
        accuracy = evaluate(model, X_test, Y_test, positive_class, negative_class)
        accuracies.append(accuracy)
        print 'Accuracy for %d training examples: %f' % (training_set_size, accuracy)

    plt.plot(np.array(training_set_sizes), np.array(accuracies))
    plt.ylabel('Accuracy')
    plt.xlabel('Number of training samples')
    plt.title('Logistic Regression Learning Curve')
    pylab.show()

def plot_learning_curves(num_points, X_train, Y_train, X_test, Y_test, positive_class=1, negative_class=0):
    total_num_matches = len(X_train)
    training_set_sizes = []
    for div in list(reversed(range(1, num_points + 1))):
        training_set_sizes.append(total_num_matches / div)

    test_errors = []
    training_errors = []
    for training_set_size in training_set_sizes:
        model = train(X_train, Y_train, training_set_size)
        test_error = evaluate(model, X_test, Y_test, positive_class, negative_class)
        training_error = evaluate(model, X_train, Y_train, positive_class, negative_class)
        test_errors.append(test_error)
        training_errors.append(training_error)

    plt.plot(training_set_sizes, training_errors, 'bs-', label='Training accuracy')
    plt.plot(training_set_sizes, test_errors, 'g^-', label='Test accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Number of training samples')
    plt.title('Logistic Regression Learning Curve')
    plt.legend(loc='lower right')
    pylab.show()

def main():
    training_data = np.load('train_51022.npz')
    X_train = training_data['X']
    Y_train = training_data['Y']

    testing_data = np.load('test_5669.npz')
    X_test = testing_data['X']
    Y_test = testing_data['Y']

    #plot_learning_curve(30, X_train, Y_train, X_test, Y_test)
    plot_learning_curves(100, X_train, Y_train, X_test, Y_test)

if __name__ == '__main__':
    main()
