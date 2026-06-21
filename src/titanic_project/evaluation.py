"""Classification metric helpers."""

from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score


def classification_metrics(y_true, predictions, probabilities) -> dict[str, float]:
    return {
        "accuracy": float(accuracy_score(y_true, predictions)),
        "precision": float(precision_score(y_true, predictions, zero_division=0)),
        "recall": float(recall_score(y_true, predictions, zero_division=0)),
        "f1": float(f1_score(y_true, predictions, zero_division=0)),
        "roc_auc": float(roc_auc_score(y_true, probabilities)),
    }
