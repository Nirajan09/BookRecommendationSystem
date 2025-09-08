from django.http import JsonResponse
from .recommender import get_recommendations

def recommend_books(request):
    book_title = request.GET.get("book", "")
    recommendations = get_recommendations(book_title, top_n=8)
    return JsonResponse({"book": book_title, "recommendations": recommendations})
