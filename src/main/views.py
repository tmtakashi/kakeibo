from datetime import datetime, date, timedelta
import calendar
import csv

from django.shortcuts import render, get_object_or_404, reverse
from django.http import HttpResponseRedirect, HttpResponse
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET

from bpmappers import Mapper, RawField

from .models import Item


class ItemMapper(Mapper):
    date = RawField('date')
    inout = RawField('inout')
    category = RawField('category')
    name = RawField('name')
    amount = RawField('amount')
    pk = RawField('pk')


class KakeiboView(LoginRequiredMixin, TemplateView):
    template_name = "main/index.html"


def login_redirect(request):
    return HttpResponseRedirect(reverse('users:login'))


@require_POST
def add_item(request):
    user = request.user
    if user.is_authenticated:
        date = request.POST.get('date')
        inout = request.POST.get('inout')
        name = request.POST.get('itemName')
        category = request.POST.get('category')
        amount = request.POST.get('amount')
        item = Item.objects.create(
            date=date,
            inout=inout,
            category=category,
            name=name,
            amount=amount,
            user=user
        )

        return JsonResponse({
            'date': date,
            'inout': inout,
            'category': category,
            'name': name,
            'amount': amount
        })


@require_POST
def delete_item(request):
    pk = request.POST.get('pk')
    item = get_object_or_404(Item, pk=pk)
    item.delete()

    return JsonResponse({})


@require_POST
def edit_item(request):
    pk = request.POST.get('pk')
    item = get_object_or_404(Item, pk=pk)
    item.date = request.POST.get('date')
    item.name = request.POST.get('name')
    item.amount = int(request.POST.get('amount'))
    item.inout = request.POST.get('inout')
    item.category = request.POST.get('category')
    item.save()

    return JsonResponse({})


@require_POST
def change_month(request):
    user = request.user
    year, month = request.POST.get('month').split('-')
    in_items = Item.objects.filter(date__year=year,
                                   date__month=month, user=user, inout='収入').order_by('date')
    out_items = Item.objects.filter(date__year=year,
                                    date__month=month, user=user, inout='支出').order_by('date')

    in_items_dict = [ItemMapper(item).as_dict() for item in in_items]
    out_items_dict = [ItemMapper(item).as_dict() for item in out_items]
    return JsonResponse({
        'inItems': in_items_dict,
        'outItems': out_items_dict
    })


@require_POST
def data_for_bar_graph(request):
    user = request.user
    year, month = map(lambda x: int(x), request.POST.get('month').split('-'))
    num_days = calendar.monthrange(year, month)[1]
    days = [date(year, month, day) for day in range(1, num_days+1)]
    labels = [day.strftime("%Y-%m-%d")
              for day in days]
    in_data = [Item.objects.filter(
        date=day, user=user, inout='収入') for day in days]
    out_data = [Item.objects.filter(
        date=day, user=user, inout='支出') for day in days]
    # それぞれの日の和を取る
    in_data_sum = get_day_sum(in_data)
    out_data_sum = get_day_sum(out_data)

    return JsonResponse({
        'inDataSum': in_data_sum,
        'outDataSum': out_data_sum,
        'labels': labels
    })


@require_POST
def data_for_pie_graph(request):
    user = request.user
    year, month = map(lambda x: int(x), request.POST.get('month').split('-'))
    num_days = calendar.monthrange(year, month)[1]
    days = [date(year, month, day) for day in range(1, num_days+1)]
    out_data = [Item.objects.filter(
        date=day, user=user, inout='支出') for day in days]
    category_sum = get_category_sum(out_data)

    return JsonResponse(category_sum)


@require_POST
def get_csv(request):
    user = request.user
    year, month = map(lambda x: int(x), request.POST.get('month').split('-'))
    items = Item.objects.filter(date__year=year,
                                date__month=month, user=user).order_by('date')

    table = [['日付', '項目名', 'カテゴリ', '収入・支出', '金額']]
    for item in items:
        table += [[item.date.strftime('%Y-%m-%d'), item.name,
                   item.category, item.inout, item.amount]]
    return JsonResponse({
        'table': table
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


def get_category_sum(queryset_list):
    category_sum = {}
    for queryset in queryset_list:
        for query in queryset:
            if query.category not in category_sum:
                category_sum[query.category] = query.amount
            else:
                category_sum[query.category] += query.amount

    return category_sum
