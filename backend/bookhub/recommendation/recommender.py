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
# User-based collaborative filtering
# -------------------------------
def get_user_based_recommendations(user_id, top_n=8):
    sparse_matrix, user_map, book_map = build_sparse_matrix()
    if sparse_matrix is None or user_id not in user_map:
        return get_top_books(top_n)

    user_idx = user_map[user_id]
    user_vector = sparse_matrix[user_idx].toarray()
    similarity_scores = cosine_similarity(user_vector, sparse_matrix)[0]

    similar_users = [(idx, score) for idx, score in enumerate(similarity_scores) if idx != user_idx and score > 0]
    similar_users.sort(key=lambda x: x[1], reverse=True)

    book_scores = {}
    rated_books = set(np.where(user_vector[0] > 0)[0])

    for sim_user_idx, sim_score in similar_users[:10]:
        sim_ratings = sparse_matrix[sim_user_idx].toarray()[0]
        for book_idx, rating in enumerate(sim_ratings):
            if rating == 0 or book_idx in rated_books:
                continue
            book_scores.setdefault(book_idx, []).append((rating, sim_score))

    predictions = []
    for book_idx, values in book_scores.items():
        numerator = sum(r * s for r, s in values)
        denominator = sum(abs(s) for _, s in values)
        if denominator > 0:
            predictions.append((book_idx, numerator / denominator))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_book_indices = [idx for idx, _ in predictions[:top_n]]

    reverse_book_map = {idx: isbn for isbn, idx in book_map.items()}
    top_books_isbn = [reverse_book_map[idx] for idx in top_book_indices]

    return fetch_books_by_isbn(top_books_isbn)

# -------------------------------
# Item-based collaborative filtering
# -------------------------------
def get_item_based_recommendations(user_id, top_n=8):
    sparse_matrix, user_map, book_map = build_sparse_matrix()
    if sparse_matrix is None or user_id not in user_map:
        return get_top_books(top_n)

    user_idx = user_map[user_id]
    user_ratings = sparse_matrix[user_idx].toarray()[0]
    rated_books = [isbn for isbn, idx in book_map.items() if user_ratings[idx] > 0]

    predictions = []
    for isbn, idx in book_map.items():
        if user_ratings[idx] > 0 or isbn not in similarity_df.index:
            continue

        sims = similarity_df[isbn].loc[rated_books]
        scores = [user_ratings[book_map[rated]] * sims[rated] for rated in sims.index if rated in book_map]
        denominator = sum(abs(sims[rated]) for rated in sims.index if rated in book_map)

        if denominator > 0:
            predicted = sum(scores) / denominator
            predictions.append((isbn, predicted))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_books_isbn = [isbn for isbn, _ in predictions[:top_n]]

    return fetch_books_by_isbn(top_books_isbn)

# -------------------------------
# Unified entry point
# -------------------------------
def get_personalized_recommendations(user_id, top_n=8, strategy="user"):
    if strategy == "item":
        return get_item_based_recommendations(user_id, top_n)
    else:
        return get_user_based_recommendations(user_id, top_n)

# -------------------------------
# Cold start fallback
# -------------------------------
def get_top_books(top_n):
    top_books = Book.objects.order_by('-average_rating')[:top_n]
    return list(top_books.values(
        "id", "isbn", "title", "author", "year_of_publication",
        "cover_image", "dataset_image_url", "average_rating",
        "price", "quantity"
    ))

# -------------------------------
# Utility: Fetch books by ISBN with preserved order
# -------------------------------
def fetch_books_by_isbn(isbn_list):
    ordering = Case(*[When(isbn=isbn, then=pos) for pos, isbn in enumerate(isbn_list)],
                    output_field=IntegerField())
    books_qs = Book.objects.filter(isbn__in=isbn_list).annotate(_order=ordering).order_by('_order')
    return list(books_qs.values(
        "id", "isbn", "title", "author", "year_of_publication",
        "cover_image", "dataset_image_url", "average_rating",
        "price", "quantity"
    ))
