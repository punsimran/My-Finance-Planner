# backend/transactions/urls.py

from django.urls import path
from .views import (
    TransactionListCreateView, 
    TransactionBulkUploadView, 
    GoalListCreateView, 
    GoalRetrieveUpdateDestroyView,
    BudgetLimitListCreateView, # Add BudgetLimit views
    BudgetLimitRetrieveUpdateDestroyView
)

urlpatterns = [
    # Transactions
    path('', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('bulk/', TransactionBulkUploadView.as_view(), name='transaction-bulk-upload'),
    
    # Goals
    path('goals/', GoalListCreateView.as_view(), name='goal-list-create'),
    path('goals/<int:pk>/', GoalRetrieveUpdateDestroyView.as_view(), name='goal-detail'),
    
    # Budget Limits (NEW)
    path('limits/', BudgetLimitListCreateView.as_view(), name='limit-list-create'),
    path('limits/<int:pk>/', BudgetLimitRetrieveUpdateDestroyView.as_view(), name='limit-detail'),
]