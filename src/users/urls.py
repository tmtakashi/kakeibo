from django.urls import path
from django.contrib.auth.views import LogoutView
from .views import (
    Login, UserCreate, UserCreateComplete, UserCreateDone
)

app_name = 'users'

urlpatterns = [
    path('login/', Login.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('sign_up/', UserCreate.as_view(), name='sign_up'),
    path('user_create_complete/<token>/', UserCreateComplete.as_view(),
         name='user_create_complete'),
    path('user_create_done/', UserCreateDone.as_view(), name='user_create_done')
]
