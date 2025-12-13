import pandas as pd
import numpy as np
from scipy.sparse import csr_matrix
from sklearn.metrics.pairwise import cosine_similarity

from django.core.cache import cache
from django.db.models import Case, When, IntegerField

from books.models import Book, BookRating

# =====================================================
# CONFIGURATION
# =====================================================
K_NEIGHBORS = 10
CACHE_KEY = "cf_sparse_matrix"
CACHE_TIMEOUT = 60 * 15  # 15 minutes

ALPHA = 0.6  # weight for user-based CF

# =====================================================
# BUILD SPARSE MATRIX
# =====================================================
def build_sparse_matrix():
    cached = cache.get(CACHE_KEY)
    if cached:
        return cached

    ratings = BookRating.objects.values("user_id", "book__isbn", "rating")
    if not ratings.exists():
        return None, None, None

    df = pd.DataFrame(ratings)
    df.dropna(inplace=True)

    user_map = {u: i for i, u in enumerate(df["user_id"].unique())}
    book_map = {b: i for i, b in enumerate(df["book__isbn"].unique())}

    df["user_idx"] = df["user_id"].map(user_map)
    df["book_idx"] = df["book__isbn"].map(book_map)

    matrix = csr_matrix((df["rating"], (df["user_idx"], df["book_idx"])))

    cache.set(CACHE_KEY, (matrix, user_map, book_map), CACHE_TIMEOUT)
    return matrix, user_map, book_map


# =====================================================
# USER-BASED SCORES
# =====================================================
def user_based_scores(user_id):
    matrix, user_map, _ = build_sparse_matrix()
    if matrix is None or user_id not in user_map:
        return {}

    user_idx = user_map[user_id]
    user_vector = matrix[user_idx].toarray()
    similarities = cosine_similarity(user_vector, matrix)[0]

    neighbors = sorted(
        [(i, s) for i, s in enumerate(similarities) if i != user_idx and s > 0],
        key=lambda x: x[1],
        reverse=True
    )[:K_NEIGHBORS]

    rated_books = set(np.where(user_vector[0] > 0)[0])
    scores = {}

    for n_idx, sim in neighbors:
        ratings = matrix[n_idx].toarray()[0]
        for book_idx, rating in enumerate(ratings):
            if rating == 0 or book_idx in rated_books:
                continue
            scores.setdefault(book_idx, []).append((rating, sim))

    predictions = {}
    for book_idx, vals in scores.items():
        num = sum(r * s for r, s in vals)
        den = sum(abs(s) for _, s in vals)
        if den > 0:
            predictions[book_idx] = num / den

    return predictions


# =====================================================
# ITEM-BASED SCORES
# =====================================================
def item_based_scores(user_id):
    matrix, user_map, _ = build_sparse_matrix()
    if matrix is None or user_id not in user_map:
        return {}

    user_idx = user_map[user_id]
    user_ratings = matrix[user_idx].toarray()[0]
    rated_books = [i for i, r in enumerate(user_ratings) if r > 0]

    predictions = {}
    for book_idx in range(matrix.shape[1]):
        if user_ratings[book_idx] > 0:
            continue

        sims = []
        for r_idx in rated_books:
            sim = cosine_similarity(matrix[:, book_idx].T, matrix[:, r_idx].T)[0][0]
            sims.append((user_ratings[r_idx], sim))

        num = sum(r * s for r, s in sims)
        den = sum(abs(s) for _, s in sims)
        if den > 0:
            predictions[book_idx] = num / den

    return predictions


# =====================================================
# HYBRID RECOMMENDATIONS
# =====================================================
def get_hybrid_recommendations(user_id, top_n=8):
    matrix, user_map, book_map = build_sparse_matrix()
    if matrix is None or user_id not in user_map:
        return get_fallback_books(top_n)

    user_scores = user_based_scores(user_id)
    item_scores = item_based_scores(user_id)

    all_books = set(user_scores) | set(item_scores)
    hybrid_scores = {book_idx: ALPHA * user_scores.get(book_idx, 0) +
                     (1 - ALPHA) * item_scores.get(book_idx, 0)
                     for book_idx in all_books}

    ranked = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)[:top_n]
    reverse_map = {idx: isbn for isbn, idx in book_map.items()}
    top_isbns = [reverse_map[idx] for idx, _ in ranked]

    return fetch_books_by_isbn(top_isbns)


# =====================================================
# COLD-START FALLBACK
# =====================================================
def get_fallback_books(top_n=8):
    return list(
        Book.objects
        .order_by("-average_rating", "-year_of_publication")[:top_n]
        .values(
            "id", "isbn", "title", "author", "year_of_publication",
            "cover_image", "dataset_image_url", "average_rating",
            "price", "quantity"
        )
    )


# =====================================================
# FETCH BOOKS BY ISBN (ORDER PRESERVED)
# =====================================================
def fetch_books_by_isbn(isbn_list):
    if not isbn_list:
        return []

    ordering = Case(
        *[When(isbn=isbn, then=pos) for pos, isbn in enumerate(isbn_list)],
        output_field=IntegerField()
    )

    books = (
        Book.objects
        .filter(isbn__in=isbn_list)
        .annotate(_order=ordering)
        .order_by("_order")
        .values(
            "id", "isbn", "title", "author", "year_of_publication",
            "cover_image", "dataset_image_url", "average_rating",
            "price", "quantity"
        )
    )
    return list(books)
