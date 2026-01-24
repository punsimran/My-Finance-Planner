# backend/authentication/views.py

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import UserRegistrationSerializer, UserSerializer, PasswordChangeSerializer

from transactions.models import Transaction, BudgetLimit
from .gemini_service import get_ai_analysis
from .ml_service import predict_budget_limit
from datetime import datetime

from django.db.models import Sum

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    Register a new user and return JWT tokens
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

class UserProfileView(APIView):
    """
    Get authenticated user's profile
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        current_password = serializer.validated_data.get("current_password")
        new_password = serializer.validated_data.get("new_password")
        
        # Check if current password is correct
        if not user.check_password(current_password):
            return Response(
                {"current_password": ["Incorrect password."]}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        # Set the new password
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password updated successfully'}, status=status.HTTP_200_OK)
    

class FinancialAdvisorView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all necessary data for the AI prompt
        transactions = Transaction.objects.filter(user=request.user).order_by('-date')[:50]
        
        # Prepare data for Python analysis
        transactions_data = list(transactions.values('amount', 'type', 'category', 'date', 'description'))
        
        # Calculate totals
        total_income = sum(t['amount'] for t in transactions_data if t['type'] == 'income')
        total_expense = sum(t['amount'] for t in transactions_data if t['type'] == 'expense')

        user_data = {
            'name': request.user.first_name or request.user.username,
            'total_income': total_income,
            'total_expense': total_expense,
        }

        analysis = get_ai_analysis(transactions_data, user_data)
        
        return Response(analysis, status=status.HTTP_200_OK)
    

class BudgetPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        target_category = request.query_params.get('category', 'Food')
        target_month_str = request.query_params.get('month', datetime.now().strftime('%Y-%m'))
        
        try:
            target_date = datetime.strptime(target_month_str, '%Y-%m')
            target_month_index = target_date.month

            # 1. Calculate features (Total Income)
            user_transactions = Transaction.objects.filter(
                user=request.user,
                date__year=target_date.year,
                date__month=target_date.month
            )
            
            # Use float() on the result of Sum to convert Decimal to float, 
            # and ensure it defaults to 0.0 if no income is found.
            total_income_decimal = user_transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum']
            total_income_float = float(total_income_decimal) if total_income_decimal else 0.0
            
            # 2. Get prediction from ML service
            suggested_limit = predict_budget_limit(
                target_category=target_category,
                total_monthly_income=total_income_float, # Pass the float
                target_month_index=target_month_index
            )

            if suggested_limit is None:
                 return Response({
                    "suggestion": 400.00,
                    "message": "Model could not predict (unseen category or insufficient training data).",
                    "is_default": True
                 }, status=status.HTTP_200_OK)


            return Response({
                "suggestion": suggested_limit,
                "category": target_category,
                "is_default": False
            }, status=status.HTTP_200_OK)

        except ValueError:
             return Response({"error": "Invalid date format."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
             # This will print the full error traceback for better debugging!
             import traceback
             print("--- ERROR IN BUDGET PREDICTION VIEW ---")
             traceback.print_exc()
             return Response({"error": "Prediction service failed internally."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class UserListView(generics.ListAPIView):
    # This permission ensures only Django Superusers or staff can access this view
    permission_classes = [IsAdminUser] 
    serializer_class = UserSerializer 
    
    # We return ALL users, not just the currently authenticated one
    def get_queryset(self):
        # Optional: You could filter out non-active users here if needed
        return User.objects.all().order_by('email')

class UserDetailUpdateDeleteView(generics.RetrieveUpdateDestroyAPIView):
    # Only Admin users can access this endpoint
    permission_classes = [IsAdminUser] 
    serializer_class = UserSerializer
    queryset = User.objects.all() # Allow looking up any user by PK

    # The serializer (UserSerializer) must be set up to handle updating fields like is_staff/is_active
    # If the serializer doesn't explicitly make them read_only, they can be updated.
    
    # Custom delete response
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"message": "User deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            target_user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # 1. Fetch Profile Data
        profile_serializer = UserSerializer(target_user)
        
        # 2. Fetch Transaction Counts (for metrics)
        transaction_counts = Transaction.objects.filter(user=target_user).aggregate(
            total_income=Sum('amount', filter=models.Q(type='income')),
            total_expense=Sum('amount', filter=models.Q(type='expense')),
            total_count=models.Count('id')
        )

        response_data = profile_serializer.data
        response_data['metrics'] = {
            'total_income': float(transaction_counts['total_income'] or 0),
            'total_expense': float(transaction_counts['total_expense'] or 0),
            'transaction_count': transaction_counts['total_count'],
        }

        return Response(response_data, status=status.HTTP_200_OK)