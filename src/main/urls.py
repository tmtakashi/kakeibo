from django.urls import path
from .views import add_item, delete_item, data_for_graph, change_month

app_name = 'main'

urlpatterns = [
    path('add_item/', add_item, name='add_item'),
    path('delete_item/', delete_item, name='delete_item'),
    path('data_for_graph/', data_for_graph, name='data_for_graph'),
    path('change_month/', change_month, name='change_month')
]
