import pickle
from books.models import Book

# Load trained model once at startup
with open("recommendation/item_cf_model.pkl", "rb") as f:
    model_data = pickle.load(f)

train_matrix = model_data["train_matrix"]
similarity_df = model_data["similarity_df"]

def get_recommendations(book_title, top_n=5):
    if book_title not in similarity_df.columns:
        return []

    # Sort by similarity
    similar_books = (
        similarity_df[book_title]
        .sort_values(ascending=False)[1:top_n+1]  # skip the book itself
        .index.tolist()
    )
    books = Book.objects.filter(title__in=similar_books).values(
    "isbn", "title", "author", "year_of_publication", 
    "cover_image", "dataset_image_url", "average_rating", "price","quantity"
    )

    return list(books)
