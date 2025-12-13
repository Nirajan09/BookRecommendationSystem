# recommender/evaluation.py
import pandas as pd
from books.models import BookRating
from .recommender import get_hybrid_recommendations 

def evaluate_recommender(k=5, test_ratio=0.2):
    """
    Evaluate recommender system using Precision@K, Recall@K, and F1@K
    """

    # Load all ratings
    ratings = BookRating.objects.all().values("user_id", "book__title", "rating")
    df = pd.DataFrame(ratings)
    if df.empty:
        return {"error": "No ratings available for evaluation."}

    # Train-test split
    test = df.sample(frac=test_ratio, random_state=42)
    train = df.drop(test.index)

    # Build train matrix from training data
    # train_matrix, similarity_df = build_train_matrix()

    precision_list, recall_list, f1_list = [], [], []

    for user in test["user_id"].unique():
        user_id = str(user)

        # Ground truth: books the user rated >= 4 in test set
        user_test_books = test[(test["user_id"] == user) & (test["rating"] >= 4)]["book__title"].tolist()
        if not user_test_books:
            continue  # skip users with no relevant books

        # Get top-K recommendations for this user
        recs = get_hybrid_recommendations(user_id, top_n=k)
        recommended_books = [r["title"] for r in recs]

        # True positives: intersection of recommended & relevant
        hits = set(recommended_books) & set(user_test_books)

        precision = len(hits) / len(recommended_books) if recommended_books else 0
        recall = len(hits) / len(user_test_books) if user_test_books else 0
        f1 = (2 * precision * recall / (precision + recall)) if (precision + recall) else 0

        precision_list.append(precision)
        recall_list.append(recall)
        f1_list.append(f1)

    return {
        "Precision@{}".format(k): round(sum(precision_list) / len(precision_list), 4) if precision_list else 0,
        "Recall@{}".format(k): round(sum(recall_list) / len(recall_list), 4) if recall_list else 0,
        "F1@{}".format(k): round(sum(f1_list) / len(f1_list), 4) if f1_list else 0,
        "users_evaluated": len(precision_list),
    }
