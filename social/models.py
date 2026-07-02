from django.conf import settings
from django.db import models


class Follow(models.Model):
    follower = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='following_links', on_delete=models.CASCADE)
    following = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='follower_links', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'following')

    def __str__(self):
        return f'{self.follower} -> {self.following}'


class Challenge(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('declined', 'Declined'),
    ]
    challenger = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='sent_challenges', on_delete=models.CASCADE)
    opponent = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='received_challenges', on_delete=models.CASCADE)
    lesson = models.ForeignKey('learning.Lesson', null=True, blank=True, on_delete=models.SET_NULL)
    status = models.CharField(max_length=12, choices=STATUS_CHOICES, default='pending')
    challenger_score = models.PositiveIntegerField(default=0)
    opponent_score = models.PositiveIntegerField(default=0)
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name='won_challenges', on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self):
        return f'{self.challenger} vs {self.opponent} ({self.status})'
