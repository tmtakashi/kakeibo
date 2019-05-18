from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Item(models.Model):
    INOUT_CHOICES = (
        ('in', '収入'),
        ('out', '支出'),
    )
    CATEGORY_CHOICES = (
        ('食費', '食費'),
        ('日用雑貨', '日用雑貨'),
        ('交通', '交通'),
        ('通信', '通信'),
        ('水道・光熱', '水道・光熱'),
        ('住まい', '住まい'),
        ('交際費', '交際費'),
        ('エンタメ', 'エンタメ'),
        ('教育・教養', '教育・教養'),
        ('税金', '税金'),
        ('その他', 'その他')
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    date = models.DateField(verbose_name='日付', blank=False, null=False)
    category = models.CharField(
        choices=CATEGORY_CHOICES, default='食費', max_length=100)
    inout = models.CharField(choices=INOUT_CHOICES, max_length=100)
    name = models.CharField(
        max_length=20, verbose_name='項目名', blank=False, null=False)
    amount = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(9999999999999)])
