from rest_framework import serializers
from .models import Transaction, Goal , BudgetLimit


class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = ['id', 'amount', 'type', 'category', 'date', 'description', 'goal']


class GoalSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = ['id', 'name', 'target_amount', 'saved_amount', 'deadline', 'progress']
        read_only_fields = ['saved_amount', 'progress'] 

    def get_progress(self, obj):
        if obj.target_amount == 0:
            return 0
        return round((obj.saved_amount / obj.target_amount) * 100, 2)
    
class BudgetLimitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetLimit
        fields = ['id', 'category', 'limit_amount', 'period_start']
        read_only_fields = ['id']