from datetime import datetime, date, timedelta

from django.shortcuts import render
from django.views.generic import ListView
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET

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


@require_POST
def delete_item(request):
    pk = request.POST.get('pk')
    Item.objects.get(pk=pk).delete()

    return JsonResponse({})


@require_POST
def change_month(request):
    month = request.POST.get('month')
    print(month)
    return JsonResponse({})


@require_GET
def data_for_graph(request):
    start_date = datetime.today().replace(day=1)
    end_date = datetime.today().replace(day=31)
    labels = [single_date.strftime("%Y-%m-%d")
              for single_date in daterange(start_date, end_date)]
    in_data = [Item.objects.filter(
        date=single_date, inout='収入') for single_date in daterange(start_date, end_date)]
    out_data = [Item.objects.filter(
        date=single_date, inout='支出') for single_date in daterange(start_date, end_date)]
    # それぞれの日の和を取る
    in_data_sum = get_day_sum(in_data)
    out_data_sum = get_day_sum(out_data)

    return JsonResponse({
        'inDataSum': in_data_sum,
        'outDataSum': out_data_sum,
        'labels': labels
    })


def get_day_sum(queryset_list):
    sum_list = []
    for queryset in queryset_list:
        total = 0
        for item in queryset:
            if item is None:
                total += 0
            else:
                total += item.amount
        sum_list.append(total)
    return sum_list

# https://stackoverflow.com/questions/1060279/iterating-through-a-range-of-dates-in-python


def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days)):
        yield start_date + timedelta(n)
