from django.shortcuts import render
from django.views.generic import ListView
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Item


class HomePageView(ListView):
    template_name = "main/index.html"
    queryset = Item.objects.all().order_by('-date').order_by('-created_at')


@require_POST
def add_item(request):
    date = request.POST.get('date')
    inout = request.POST.get('inout')
    name = request.POST.get('itemName')
    amount = request.POST.get('amount')
    print(date, inout, name, amount)
    item = Item.objects.create(
        date=date,
        inout=inout,
        name=name,
        amount=amount
    )

    return JsonResponse({
        'date': date,
        'inout': inout,
        'name': name,
        'amount': amount
    })
