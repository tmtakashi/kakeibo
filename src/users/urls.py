from django.urls import path
from .views import (
    Login, Logout, UserCreate, UserCreateComplete, UserCreateDone
)

app_name = 'users'

urlpatterns = [
    path('login/', Login.as_view(), name='login'),
    path('logout/', Logout.as_view(), name='logout'),
    path('sign_up/', UserCreate.as_view(), name='sign_up'),
    path('user_create_complete/<token>/', UserCreateComplete.as_view(),
         name='user_create_complete'),
    path('user_create_done/', UserCreateDone.as_view(), name='user_create_done')
]
