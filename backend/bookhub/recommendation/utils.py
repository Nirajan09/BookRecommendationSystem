import numpy as np
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from books.models import Book, BookRating


def build_user_item_matrix():
    ratings = BookRating.objects.all().values("user_id", "book__isbn", "rating")
    if not ratings:
        return pd.DataFrame()

    df = pd.DataFrame(ratings)
    return df.pivot_table(index="book__isbn", columns="user_id", values="rating")


def compute_similarity(train_matrix):
    if train_matrix.empty:
        return pd.DataFrame()

    similarity = cosine_similarity(train_matrix.fillna(0))
    return pd.DataFrame(similarity, index=train_matrix.index, columns=train_matrix.index)


def predict_rating(user_id, book_isbn, train_matrix, similarity_df):
    if train_matrix.empty or similarity_df.empty:
        return 0

    if user_id not in train_matrix.columns or book_isbn not in similarity_df.index:
        return 0

    user_ratings = train_matrix[user_id].dropna()
    if user_ratings.empty:
        return 0

    sims = similarity_df[book_isbn].loc[user_ratings.index]
    if sims.empty:
        return 0

    num = np.dot(user_ratings, sims)
    den = np.sum(np.abs(sims))
    return num / den if den != 0 else 0
