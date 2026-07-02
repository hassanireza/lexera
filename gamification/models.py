from django.conf import settings
from django.db import models
from django.utils import timezone


class Boost(models.Model):
    BOOST_TYPES = [
        ('double_xp', 'Double XP'),
        ('extra_life', 'Extra Life Pack'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='boosts', on_delete=models.CASCADE)
    boost_type = models.CharField(max_length=20, choices=BOOST_TYPES)
    activated_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_active(self):
        return self.expires_at > timezone.now()


class Badge(models.Model):
    key = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    description = models.CharField(max_length=200)
    icon = models.CharField(max_length=8, default='🏅')
    tier = models.CharField(max_length=10, choices=[('bronze', 'Bronze'), ('silver', 'Silver'), ('gold', 'Gold')], default='bronze')

    def __str__(self):
        return self.name


class UserBadge(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='badges', on_delete=models.CASCADE)
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'badge')


class XPEvent(models.Model):
    """Log of xp gains, powers weekly leaderboard and daily-goal ring."""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='xp_events', on_delete=models.CASCADE)
    amount = models.PositiveIntegerField()
    source = models.CharField(max_length=60)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=['user', 'created_at'])]


class StoreItem(models.Model):
    key = models.SlugField(unique=True)
    name = models.CharField(max_length=60)
    description = models.CharField(max_length=160)
    icon = models.CharField(max_length=8, default='🛒')
    price_coins = models.PositiveIntegerField()

    def __str__(self):
        return self.name
