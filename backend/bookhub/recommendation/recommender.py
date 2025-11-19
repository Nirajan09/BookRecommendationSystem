import os
import pickle
import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity
from books.models import Book, BookRating
from django.conf import settings
from django.db.models import Case, When, IntegerField

# -------------------------------
# Load precomputed item-item similarity matrix (optional fallback)
# -------------------------------
PICKLE_PATH = os.path.join(
    settings.BASE_DIR,
    "recommendation",
    "book_recommendation_system_isbn.pkl"
)
with open(PICKLE_PATH, "rb") as f:
    data = pickle.load(f)
    similarity_df = data["similarity_df"]

# -------------------------------
# Build sparse user-item matrix
# -------------------------------
def build_sparse_matrix():
    ratings = BookRating.objects.all().values('user_id', 'book__isbn', 'rating')
    if not ratings:
        return None, None, None

    df = pd.DataFrame(ratings)
    df.dropna(subset=['user_id', 'book__isbn', 'rating'], inplace=True)

    user_ids = {uid: idx for idx, uid in enumerate(df['user_id'].unique())}
    book_isbns = {isbn: idx for idx, isbn in enumerate(df['book__isbn'].unique())}

    df['user_idx'] = df['user_id'].map(user_ids)
    df['book_idx'] = df['book__isbn'].map(book_isbns)

    sparse_matrix = csr_matrix((df['rating'], (df['user_idx'], df['book_idx'])))
    return sparse_matrix, user_ids, book_isbns

# -------------------------------
# Item-based CF prediction
# -------------------------------
def predict_item_rating(user_idx, book_idx, sparse_matrix, book_map, top_k=5):
    # Get books rated by this user
    user_ratings = sparse_matrix[user_idx].toarray().flatten()
    rated_indices = np.where(user_ratings > 0)[0]

    if len(rated_indices) == 0:
        return 0  # user has not rated anything

    # Get similarity scores for target book with already rated books
    book_isbn = [isbn for isbn, idx in book_map.items() if idx == book_idx][0]
    sims = similarity_df[book_isbn].loc[
        [isbn for isbn, idx in book_map.items() if idx in rated_indices]
    ].sort_values(ascending=False)[:top_k]

    numerator = sum(user_ratings[book_map[b]] * sims[b] for b in sims.index)
    denominator = sum(abs(sims))
    return numerator / denominator if denominator != 0 else 0

# -------------------------------
# Get top N personalized recommendations (item-based)
# -------------------------------
def get_item_based_recommendations(user_id, top_n=8):
    sparse_matrix, user_map, book_map = build_sparse_matrix()
    if sparse_matrix is None or user_id not in user_map:
        # Cold start fallback
        top_books = Book.objects.order_by('-average_rating')[:top_n]
        return list(top_books.values(
            "id", "isbn", "title", "author", "year_of_publication",
            "cover_image", "dataset_image_url", "average_rating",
            "price", "quantity"
        ))

    user_idx = user_map[user_id]
    user_ratings = sparse_matrix[user_idx].toarray().flatten()
    already_rated = {idx for idx, r in enumerate(user_ratings) if r > 0}

    predictions = []
    for isbn, idx in book_map.items():
        if idx in already_rated:
            continue
        est_rating = predict_item_rating(user_idx, idx, sparse_matrix, book_map)
        predictions.append((isbn, est_rating))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_books_isbn = [b[0] for b in predictions[:top_n]]

    # Preserve order in DB query
    ordering = Case(*[When(isbn=isbn, then=pos) for pos, isbn in enumerate(top_books_isbn)],
                    output_field=IntegerField())
    books_qs = Book.objects.filter(isbn__in=top_books_isbn).annotate(_order=ordering).order_by('_order')

    return list(books_qs.values(
        "id", "isbn", "title", "author", "year_of_publication",
        "cover_image", "dataset_image_url", "average_rating",
        "price", "quantity"
    ))

# -------------------------------
# Alias for compatibility with views
# -------------------------------
def get_personalized_recommendations(user_id, top_n=8):
    return get_item_based_recommendations(user_id, top_n)
