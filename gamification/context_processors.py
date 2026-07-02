def player_stats(request):
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        return {}
    return {
        'player_lives': user.lives,
        'player_streak': user.current_streak,
        'player_coins': user.coins,
        'player_xp': user.xp,
        'player_level': user.level_number,
        'player_is_birthday': user.is_birthday_today,
    }
