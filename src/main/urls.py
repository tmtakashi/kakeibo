from django.urls import path
from .views import add_item

app_name = 'main'

# urlpatternsは、他も同じなので、以下省略
urlpatterns = [
    path('add_item/', add_item, name='add_item'),
]
