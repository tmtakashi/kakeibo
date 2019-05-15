from django.shortcuts import render
from django.views.generic import ListView
from django.http import JsonResponse
from django.views.decorators.http import require_POST

from .models import Item


class HomePageView(ListView):
    template_name = "main/index.html"
    queryset = Item.objects.all().order_by('-date').order_by('-created_at')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['in_tot'] = sum(
            [item.amount for item in Item.objects.filter(inout="収入")])
        context['out_tot'] = sum(
            [item.amount for item in Item.objects.filter(inout="支出")])

        return context


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
