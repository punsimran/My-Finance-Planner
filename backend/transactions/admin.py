from django.contrib import admin
from .models import Transaction, Goal, BudgetLimit


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('user', 'description', 'amount', 'type', 'category', 'date', 'created_at')
    list_filter = ('type', 'category', 'date')
    search_fields = ('description', 'user__username', 'user__email')
    date_hierarchy = 'date'


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'name', 'target_amount', 'saved_amount', 'deadline')
    list_filter = ('deadline',)
    search_fields = ('name', 'user__username')
    readonly_fields = ('saved_amount',)

@admin.register(BudgetLimit)
class BudgetLimitAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'limit_amount', 'period_start')
    list_filter = ('category', 'period_start')
    search_fields = ('user__username', 'category')