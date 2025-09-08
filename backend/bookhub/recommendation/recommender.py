import pickle
from books.models import Book
from django.http import JsonResponse
# Load trained model once at startup
with open("recommendation/item_cf_model.pkl", "rb") as f:
    model_data = pickle.load(f)

train_matrix = model_data["train_matrix"]
similarity_df = model_data["similarity_df"]

def recommend_books(request):
    book_title = request.GET.get("book", "")
    recommendations = get_recommendations(book_title, top_n=8)
    if not recommendations:
        return JsonResponse({
            "book": book_title,
            "recommendations": [],
            "error": "No matching books found for this title."
        })
    return JsonResponse({"book": book_title, "recommendations": recommendations})

def get_recommendations(book_title, top_n=8):
    if book_title not in similarity_df.columns:
        return []

    # Get similar book titles as before
    similar_books = (
        similarity_df[book_title]
        .sort_values(ascending=False)[1:top_n + 1]  # top_n titles
        .index.tolist()
    )

    # Query all books matching those titles
    books = Book.objects.filter(title__in=similar_books).values(
        "id","isbn", "title", "author", "year_of_publication",
        "cover_image", "dataset_image_url", "average_rating", "price", "quantity"
    )

    # Convert queryset to list and slice only top_n results (to guarantee max number)
    books_list = list(books)[:top_n]

    return books_list
