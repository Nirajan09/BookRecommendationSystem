from django.http import JsonResponse
from .recommender import get_hybrid_recommendations, get_fallback_books
from .evaluation import evaluate_recommender

def recommend_books(request):
    user_id = request.GET.get("user_id")
    if not user_id:
        return JsonResponse({"error": "user_id is required"}, status=400)

    try:
        user_id = int(user_id)
    except ValueError:
        return JsonResponse({"error": "user_id must be an integer"}, status=400)

    top_n = 8
    recommendations = get_hybrid_recommendations(user_id, top_n=top_n)

    # Determine message
    
    if recommendations is None:
        # User has no ratings
        recommendations = get_fallback_books(top_n)
        message = "You have not rated any books yet. Showing popular books instead."
    elif len(recommendations) < top_n:
        # User has some ratings, but not enough recommendations
        message = "Not enough personalized books rated. Showing popular books instead."
        needed = top_n - len(recommendations)
        fallback = get_fallback_books(top_n=needed)
        existing_isbns = {b["isbn"] for b in recommendations}
        fallback = [b for b in fallback if b["isbn"] not in existing_isbns]
        recommendations.extend(fallback)
    else:
        message = ""  # enough personalized recommendations

    return JsonResponse({
        "user_id": user_id,
        "message": message,
        "recommendations": recommendations
    })


def evaluate(request):
    k = request.GET.get("k", 8)
    try:
        k = int(k)
    except ValueError:
        k = 8

    results = evaluate_recommender(k=k)
    return JsonResponse(results)
