from django.http import JsonResponse
from .recommender import get_hybrid_recommendations, get_fallback_books
from .evaluation import evaluate_recommender

# -------------------------------
# Recommendation API
# -------------------------------
def recommend_books(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id is required"}, status=400)

    try:
        user_id = int(user_id)
    except ValueError:
        return JsonResponse({"error": "user_id must be an integer"}, status=400)

    recommendations = get_hybrid_recommendations(user_id, top_n=8)

    # Cold-start: user has no ratings
    if not recommendations:
        fallback_books = get_fallback_books(top_n=8)
        return JsonResponse({
            "message": "You have not rated any books yet. Showing popular books instead.",
            "recommendations": fallback_books
        }, status=200)

    return JsonResponse({
        "user_id": user_id,
        "recommendations": recommendations
    })


# -------------------------------
# Evaluation API
# -------------------------------
def evaluate(request):
    k = request.GET.get("k", 8)
    try:
        k = int(k)
    except ValueError:
        k = 8

    results = evaluate_recommender(k=k)
    return JsonResponse(results)
