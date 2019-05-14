from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Item(models.Model):
    INOUT_CHOICES = (
        ('in', '収入'),
        ('out', '支出'),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date = models.DateField(verbose_name='日付', blank=False, null=False)
    inout = models.CharField(choices=INOUT_CHOICES, max_length=100)
    name = models.CharField(
        max_length=20, verbose_name='項目名', blank=False, null=False)
    amount = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(9999999999999)])
