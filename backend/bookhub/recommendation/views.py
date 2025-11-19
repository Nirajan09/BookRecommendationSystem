# from django.http import JsonResponse
# from .recommender import get_personalized_recommendations
# from .evaluation import evaluate_recommender

# def recommend_books(request):
#     user_id = request.GET.get("user_id")
#     if not user_id:
#         return JsonResponse({"error": "user_id is required"}, status=400)

#     recommendations = get_personalized_recommendations(user_id, top_n=8)

#     # Cold-start: user has not rated any books
#     if recommendations is None or len(recommendations) == 0:
#         return JsonResponse({
#             "error": "You need to rate some books first to get personalized recommendations."
#         }, status=400)

#     return JsonResponse({"user_id": user_id, "recommendations": recommendations})



# def evaluate(request):
#     k = int(request.GET.get("k", 8)) 
#     results = evaluate_recommender(k=k)
#     return JsonResponse(results)