import pandas as pd
import numpy as np
from books.models import BookRating, Book

def build_train_matrix():
    # Fetch all ratings
    ratings = BookRating.objects.all().values('user_id', 'book__title', 'rating')
    df = pd.DataFrame(ratings)
    if df.empty:
        return pd.DataFrame(), pd.DataFrame()
    
    df.rename(columns={'user_id':'User-ID', 'book__title':'Book-Title', 'rating':'Book-Rating'}, inplace=True)
    train_matrix = df.pivot_table(index='Book-Title', columns='User-ID', values='Book-Rating')
    
    # Compute item-item cosine similarity manually
    similarity_df = pd.DataFrame(index=train_matrix.index, columns=train_matrix.index, dtype=float)
    
    for book1 in train_matrix.index:
        vec1 = train_matrix.loc[book1].values
        norm1 = np.linalg.norm(vec1)
        for book2 in train_matrix.index:
            vec2 = train_matrix.loc[book2].values
            norm2 = np.linalg.norm(vec2)
            if norm1 == 0 or norm2 == 0:
                similarity = 0
            else:
                similarity = np.dot(vec1, vec2) / (norm1 * norm2)
            similarity_df.at[book1, book2] = similarity
    
    return train_matrix, similarity_df

def predict_rating(user_id, book_title, train_matrix, similarity_df, k=5):
    user_id = str(user_id)
    if book_title not in similarity_df.index or user_id not in train_matrix.columns:
        return 0
    
    sims = similarity_df[book_title]
    user_ratings = train_matrix[user_id]
    rated_books = user_ratings[user_ratings > 0].index
    
    # Top k most similar rated books
    top_k_books = sims[rated_books].sort_values(ascending=False)[:k]
    
    numerator = sum(train_matrix.loc[b, user_id] * top_k_books[b] for b in top_k_books.index)
    denominator = sum(abs(top_k_books))
    
    return numerator / denominator if denominator != 0 else 0

def get_personalized_recommendations(user_id, top_n=8):
    train_matrix, similarity_df = build_train_matrix()
    if train_matrix.empty:
        return []

    predictions = []
    user_id = str(user_id)

    # Books this user already rated
    already_rated = set()
    if user_id in train_matrix.columns:
        already_rated = set(train_matrix[user_id].dropna().index)

    for book_title in train_matrix.index:
        if book_title in already_rated:
            continue  # skip rated books
        est_rating = predict_rating(user_id, book_title, train_matrix, similarity_df)
        predictions.append((book_title, est_rating))

    predictions.sort(key=lambda x: x[1], reverse=True)
    top_books = [b[0] for b in predictions[:top_n]]

    books = Book.objects.filter(title__in=top_books).exclude(title__in=already_rated).values(
        "id","isbn","title","author","year_of_publication",
        "cover_image","dataset_image_url","average_rating","price","quantity"
    )
    return list(books)

