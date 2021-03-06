from django.urls import path
from .views import (
    add_item, delete_item, data_for_bar_graph,
    data_for_pie_graph, change_month, edit_item, get_csv
)

app_name = 'main'

urlpatterns = [
    path('add_item/', add_item, name='add_item'),
    path('delete_item/', delete_item, name='delete_item'),
    path('data_for_bar_graph/', data_for_bar_graph, name='data_for_bar_graph'),
    path('data_for_pie_graph/', data_for_pie_graph, name='data_for_pie_graph'),
    path('change_month/', change_month, name='change_month'),
    path('edit_item/', edit_item, name='edit_item'),
    path('get_csv/', get_csv, name='get_csv')
]
