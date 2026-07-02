from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.utils import timezone
import datetime

AVATAR_CHOICES = [
    ('fox', '🦊'), ('owl', '🦉'), ('panda', '🐼'), ('lion', '🦁'),
    ('koala', '🐨'), ('penguin', '🐧'), ('octopus', '🐙'), ('dragon', '🐲'),
    ('unicorn', '🦄'), ('robot', '🤖'), ('wizard', '🧙'), ('astronaut', '🧑‍🚀'),
]


class User(AbstractUser):
    """Lexera player account. Extends Django auth with gamification state."""

    display_name = models.CharField(max_length=60, blank=True)
    bio = models.CharField(max_length=200, blank=True)
    avatar_key = models.CharField(max_length=20, choices=AVATAR_CHOICES, default='fox')
    birth_date = models.DateField(null=True, blank=True)
    is_public = models.BooleanField(default=True)

    xp = models.PositiveIntegerField(default=0)
    coins = models.PositiveIntegerField(default=50)
    lives = models.PositiveSmallIntegerField(default=5)
    lives_last_regen = models.DateTimeField(default=timezone.now)

    current_streak = models.PositiveIntegerField(default=0)
    longest_streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    streak_freeze_count = models.PositiveSmallIntegerField(default=0)
    streak_freeze_used_dates = models.JSONField(default=list, blank=True)

    daily_goal_xp = models.PositiveIntegerField(default=30)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-xp']

    def __str__(self):
        return self.display_name or self.username

    def get_absolute_url(self):
        return reverse('accounts:profile', kwargs={'username': self.username})

    @property
    def avatar_emoji(self):
        return dict(AVATAR_CHOICES).get(self.avatar_key, '🦊')

    @property
    def level_number(self):
        xp = self.xp
        lvl = 1
        threshold = 100
        while xp >= threshold:
            xp -= threshold
            lvl += 1
            threshold = int(threshold * 1.18) + 20
        return lvl

    @property
    def xp_into_level_and_span(self):
        xp = self.xp
        threshold = 100
        while xp >= threshold:
            xp -= threshold
            threshold = int(threshold * 1.18) + 20
        return xp, threshold

    @property
    def is_birthday_today(self):
        if not self.birth_date:
            return False
        today = timezone.localdate()
        return (self.birth_date.month, self.birth_date.day) == (today.month, today.day)

    def regen_lives(self):
        from django.conf import settings
        cfg = settings.LEXERA
        if self.lives >= cfg['MAX_LIVES']:
            self.lives_last_regen = timezone.now()
            self.save(update_fields=['lives_last_regen'])
            return
        elapsed = timezone.now() - self.lives_last_regen
        minutes = elapsed.total_seconds() / 60
        regen_count = int(minutes // cfg['LIFE_REGEN_MINUTES'])
        if regen_count > 0:
            self.lives = min(cfg['MAX_LIVES'], self.lives + regen_count)
            self.lives_last_regen = self.lives_last_regen + datetime.timedelta(
                minutes=regen_count * cfg['LIFE_REGEN_MINUTES']
            )
            self.save(update_fields=['lives', 'lives_last_regen'])

    def lose_life(self):
        if self.lives > 0:
            self.lives -= 1
            if self.lives == 4:
                self.lives_last_regen = timezone.now()
            self.save(update_fields=['lives', 'lives_last_regen'])
        return self.lives

    def add_xp(self, amount):
        self.xp += amount
        self.save(update_fields=['xp'])

    def add_coins(self, amount):
        self.coins += amount
        self.save(update_fields=['coins'])

    def register_activity(self, today=None):
        today = today or timezone.localdate()
        if self.last_active_date == today:
            return
        yesterday = today - datetime.timedelta(days=1)
        if self.last_active_date == yesterday:
            self.current_streak += 1
        elif self.last_active_date is None:
            self.current_streak = 1
        else:
            gap_days = (today - self.last_active_date).days
            if gap_days == 2 and str(yesterday) in (self.streak_freeze_used_dates or []):
                self.current_streak += 1
            else:
                self.current_streak = 1
        self.longest_streak = max(self.longest_streak, self.current_streak)
        self.last_active_date = today
        self.save(update_fields=['current_streak', 'longest_streak', 'last_active_date'])

    def use_streak_freeze(self):
        if self.streak_freeze_count > 0:
            self.streak_freeze_count -= 1
            today = str(timezone.localdate())
            freezes = self.streak_freeze_used_dates or []
            freezes.append(today)
            self.streak_freeze_used_dates = freezes
            self.save(update_fields=['streak_freeze_count', 'streak_freeze_used_dates'])
            return True
        return False
