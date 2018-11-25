from logistic_regression.f1score import calculate_precision_recall_fscore


def test_logistic_regression_precision_recall_fscore():
    precision, recall, f1 = calculate_precision_recall_fscore()

    assert precision == 0.7816169070781617
    assert recall == 0.6846899794299148
    assert f1 == 0.7299498746867168
