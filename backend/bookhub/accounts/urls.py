from django.urls import path
from .views import RegisterView, LoginView, UserInfoView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserInfoView.as_view(), name='user-info'),
]
