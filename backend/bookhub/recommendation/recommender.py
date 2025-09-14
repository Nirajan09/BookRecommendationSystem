import os
import pickle
import pandas as pd
from books.models import Book, BookRating
from django.conf import settings
from django.db.models import Case, When, IntegerField


PICKLE_PATH = os.path.join(
    settings.BASE_DIR,
    "recommendation",  
    "book_recommendation_system_isbn.pkl"
)
with open(PICKLE_PATH, "rb") as f:
    data = pickle.load(f)
    similarity_df = data["similarity_df"]

# -------------------------------
# Build user-item matrix dynamically from DB
# -------------------------------
def build_user_item_matrix():
    ratings = BookRating.objects.all().values('user_id', 'book__isbn', 'rating')
    if not ratings:
        return pd.DataFrame()
    
    df = pd.DataFrame(ratings)
    df.rename(columns={'user_id':'User-ID','book__isbn':'ISBN','rating':'Book-Rating'}, inplace=True)
    train_matrix = df.pivot_table(index='ISBN', columns='User-ID', values='Book-Rating')
    return train_matrix

# -------------------------------
# Predict rating for a user and a book
# -------------------------------
def predict_rating(user_id, book_isbn, train_matrix, k=5):
    user_id = int(user_id)
    if book_isbn not in similarity_df.index or user_id not in train_matrix.columns:
        return 0
    
    sims = similarity_df[book_isbn]
    user_ratings = train_matrix[user_id].fillna(0)
    rated_books = user_ratings[user_ratings > 0].index
    top_k_books = sims[rated_books].sort_values(ascending=False)[:k]

    numerator = sum(user_ratings[b] * top_k_books[b] for b in top_k_books.index)
    denominator = sum(abs(top_k_books))

    return numerator / denominator if denominator != 0 else 0

# -------------------------------
# Get top N personalized recommendations
# -------------------------------
def get_personalized_recommendations(user_id, top_n=8):
    user_id = int(user_id)
    train_matrix = build_user_item_matrix()
    if train_matrix.empty or user_id not in train_matrix.columns:
        # Cold-start fallback: return top-rated/popular books
        top_books = Book.objects.order_by('-average_rating')[:top_n]
        return list(top_books.values(
            "id", "isbn", "title", "author", "year_of_publication",
            "cover_image", "dataset_image_url", "average_rating",
            "price", "quantity"
        ))

    # Books already rated by user
    already_rated = set(train_matrix[user_id].dropna().index)
    predictions = []

    for book_isbn in train_matrix.index:
        if book_isbn in already_rated:
            continue
        est_rating = predict_rating(user_id, book_isbn, train_matrix)
        predictions.append((book_isbn, est_rating))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_books_isbn = [b[0] for b in predictions[:top_n]]

    # Query DB while preserving order
    ordering = Case(*[When(isbn=isbn, then=pos) for pos, isbn in enumerate(top_books_isbn)],
                    output_field=IntegerField())
    books_qs = Book.objects.filter(isbn__in=top_books_isbn).annotate(_order=ordering).order_by('_order')

    return list(books_qs.values(
        "id", "isbn", "title", "author", "year_of_publication",
        "cover_image", "dataset_image_url", "average_rating",
        "price", "quantity"
    ))



