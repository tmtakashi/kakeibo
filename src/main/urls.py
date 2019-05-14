from django.urls import path
from .views import add_item, delete_item

app_name = 'main'

# urlpatternsは、他も同じなので、以下省略
urlpatterns = [
    path('add_item/', add_item, name='add_item'),
    path('delete_item/', delete_item, name='delete_item')
]
