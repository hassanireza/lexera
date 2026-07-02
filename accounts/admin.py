from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class LexeraUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'xp', 'level_number', 'current_streak', 'lives', 'coins', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Lexera Profile', {'fields': ('display_name', 'bio', 'avatar_key', 'birth_date', 'is_public')}),
        ('Gamification', {'fields': ('xp', 'coins', 'lives', 'current_streak', 'longest_streak', 'streak_freeze_count', 'daily_goal_xp')}),
    )
