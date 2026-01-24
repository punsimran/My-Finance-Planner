from rest_framework import generics, permissions
from django.db import transaction as db_transaction
from .models import Transaction, Goal, BudgetLimit
from .serializers import TransactionSerializer, GoalSerializer, BudgetLimitSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from datetime import date
from django.db.models import Sum


class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return transactions belonging to the currently logged-in user
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        # Automatically set the user to the logged-in user when saving
        serializer.save(user=self.request.user)


class TransactionBulkUploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # We expect a list of transactions data
        serializer = TransactionSerializer(data=request.data, many=True)
        
        if serializer.is_valid():
            # Save all with the current user
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class GoalListCreateView(generics.ListCreateAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
class GoalRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = GoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure users can only modify their own goals
        return Goal.objects.filter(user=self.request.user)
    
class BudgetLimitListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetLimitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # You might want to filter this by the current month/year in a real app, 
        # but for simplicity, we return all active limits.
        return BudgetLimit.objects.filter(user=user)

    def perform_create(self, serializer):
        # When creating, automatically set the user
        serializer.save(user=self.request.user)

# Used for fetching a single limit for update (optional)
class BudgetLimitRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BudgetLimitSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BudgetLimit.objects.filter(user=self.request.user)
    
class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        goal_id = serializer.validated_data.get('goal')
        amount = serializer.validated_data['amount']
        tx_type = serializer.validated_data['type']
        
        # Use a database transaction block to ensure atomic operations
        with db_transaction.atomic():
            # 1. Save the transaction normally
            transaction = serializer.save(user=self.request.user)

            # 2. Handle Goal Contribution/Withdrawal
            if goal_id:
                try:
                    goal = Goal.objects.get(pk=goal_id.pk, user=self.request.user)
                    
                    if tx_type == 'income':
                        # If transaction is INCOME and linked to a goal, treat it as contribution
                        goal.saved_amount += amount
                        goal.save()
                    elif tx_type == 'expense' and transaction.category.lower() == 'savings':
                         # Optional: If you use a special 'Savings' category for withdrawals
                         # goal.saved_amount -= amount
                         pass
                         
                except Goal.DoesNotExist:
                    # Log or handle case where a bad goal ID was passed
                    pass