# backend/authentication/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (RegisterView, UserProfileView, 
                    ChangePasswordView, FinancialAdvisorView, 
                    BudgetPredictionView, UserListView, 
                    UserDetailUpdateDeleteView, AdminUserDetailView
                    )

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('advisor/insights/', FinancialAdvisorView.as_view(), name='financial-advisor'),
    path('budget/predict_limit/', BudgetPredictionView.as_view(), name='predict-budget-limit'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailUpdateDeleteView.as_view(), name='user-detail-crud'),

    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail-metrics'),
]