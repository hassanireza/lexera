from django.contrib.auth import views as auth_views
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', auth_views.LoginView.as_view(template_name='accounts/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('settings/', views.edit_profile, name='edit_profile'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('friends/', views.friends, name='friends'),
    path('friends/find/', views.find_friends, name='find_friends'),
    path('follow/<str:username>/', views.toggle_follow, name='toggle_follow'),
    path('store/', views.store, name='store'),
    path('store/buy/<slug:key>/', views.buy_item, name='buy_item'),
    path('u/<str:username>/', views.profile, name='profile'),
]
