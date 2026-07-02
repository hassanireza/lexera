from django.conf import settings
from django.contrib import messages
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render

from gamification.models import Badge, UserBadge, StoreItem
from social.models import Follow
from .forms import SignupForm, ProfileForm
from .models import User


def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome to Lexera, {user.display_name}! 🎉')
            return redirect('core:dashboard')
    else:
        form = SignupForm()
    return render(request, 'accounts/signup.html', {'form': form})


@login_required
def edit_profile(request):
    if request.method == 'POST':
        form = ProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Profile updated.')
            return redirect('accounts:profile', username=request.user.username)
    else:
        form = ProfileForm(instance=request.user)
    return render(request, 'accounts/settings.html', {'form': form, 'avatar_choices': request.user._meta.get_field('avatar_key').choices})


def profile(request, username):
    profile_user = get_object_or_404(User, username=username)
    is_following = False
    if request.user.is_authenticated and request.user != profile_user:
        is_following = Follow.objects.filter(follower=request.user, following=profile_user).exists()
    followers = Follow.objects.filter(following=profile_user).count()
    following = Follow.objects.filter(follower=profile_user).count()
    earned_badges = UserBadge.objects.filter(user=profile_user).select_related('badge')
    return render(request, 'accounts/profile.html', {
        'profile_user': profile_user,
        'is_following': is_following,
        'followers': followers,
        'following': following,
        'earned_badges': earned_badges,
    })


@login_required
def toggle_follow(request, username):
    target = get_object_or_404(User, username=username)
    if target != request.user:
        link, created = Follow.objects.get_or_create(follower=request.user, following=target)
        if not created:
            link.delete()
    return redirect('accounts:profile', username=username)


@login_required
def leaderboard(request):
    scope = request.GET.get('scope', 'friends')
    if scope == 'friends':
        friend_ids = list(Follow.objects.filter(follower=request.user).values_list('following_id', flat=True))
        friend_ids.append(request.user.id)
        qs = User.objects.filter(id__in=friend_ids).order_by('-xp')
    else:
        qs = User.objects.order_by('-xp')[:50]
    ranked = list(enumerate(qs, start=1))
    return render(request, 'accounts/leaderboard.html', {'ranked': ranked, 'scope': scope})


@login_required
def friends(request):
    following = User.objects.filter(follower_links__follower=request.user)
    followers = User.objects.filter(following_links__following=request.user)
    return render(request, 'accounts/friends.html', {'following': following, 'followers': followers})


@login_required
def find_friends(request):
    q = request.GET.get('q', '').strip()
    results = []
    if q:
        results = User.objects.filter(Q(username__icontains=q) | Q(display_name__icontains=q)).exclude(id=request.user.id)[:20]
    following_ids = set(Follow.objects.filter(follower=request.user).values_list('following_id', flat=True))
    return render(request, 'accounts/find_friends.html', {'results': results, 'q': q, 'following_ids': following_ids})


@login_required
def store(request):
    items = StoreItem.objects.all()
    return render(request, 'accounts/store.html', {'items': items, 'cfg': settings.LEXERA})


@login_required
def buy_item(request, key):
    item = get_object_or_404(StoreItem, key=key)
    user = request.user
    if user.coins < item.price_coins:
        messages.error(request, "Not enough coins yet — keep learning to earn more!")
        return redirect('accounts:store')
    user.coins -= item.price_coins
    if item.key == 'streak_freeze':
        user.streak_freeze_count += 1
        user.save(update_fields=['coins', 'streak_freeze_count'])
        messages.success(request, 'Streak Freeze added to your inventory ❄️')
    elif item.key == 'refill_lives':
        user.lives = settings.LEXERA['MAX_LIVES']
        user.save(update_fields=['coins', 'lives'])
        messages.success(request, 'Lives fully refilled ❤️')
    elif item.key == 'double_xp':
        from django.utils import timezone
        import datetime
        from gamification.models import Boost
        Boost.objects.create(user=user, boost_type='double_xp',
                              expires_at=timezone.now() + datetime.timedelta(minutes=settings.LEXERA['DOUBLE_XP_BOOST_MINUTES']))
        user.save(update_fields=['coins'])
        messages.success(request, 'Double XP boost activated for 15 minutes ⚡')
    else:
        user.save(update_fields=['coins'])
        messages.success(request, f'{item.name} purchased!')
    return redirect('accounts:store')
