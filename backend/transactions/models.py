from django.db import models
from django.conf import settings

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='transactions')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=7, choices=TRANSACTION_TYPES)
    category = models.CharField(max_length=50) # e.g., 'Food', 'Salary'
    date = models.DateField()
    goal = models.ForeignKey('Goal', on_delete=models.SET_NULL, null=True, blank=True, related_name='contributions')
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.description} - {self.amount}"
    
class Goal(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='goals')
    name = models.CharField(max_length=100)
    target_amount = models.DecimalField(max_digits=10, decimal_places=2)
    saved_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} (${self.saved_amount}/{self.target_amount})"
    

class BudgetLimit(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='budget_limits')
    category = models.CharField(max_length=50)
    limit_amount = models.DecimalField(max_digits=10, decimal_places=2)

    period_start = models.DateField() 
    
    class Meta:

        unique_together = ('user', 'category', 'period_start')
        ordering = ['period_start', 'category']

    def __str__(self):
        return f"{self.user}'s {self.category} limit for {self.period_start.strftime('%Y-%m')}"