from django.conf import settings
from django.db import models

LESSON_TYPES = [
    ('quiz', 'Multiple Choice Quiz'),
    ('typing', 'Typing Recall'),
    ('wordle', 'Wordle'),
    ('dragdrop', 'Drag & Drop Match'),
    ('sudoku', 'Word Sudoku'),
    ('connections', 'Synonym Connections'),
    ('history', 'Word History'),
    ('test', 'Level Test'),
]


class Level(models.Model):
    order = models.PositiveSmallIntegerField(unique=True)
    name = models.CharField(max_length=60)
    subtitle = models.CharField(max_length=120, blank=True)
    icon = models.CharField(max_length=8, default='🌱')
    color = models.CharField(max_length=20, default='#4F46E5')
    min_difficulty = models.PositiveSmallIntegerField(default=1)
    max_difficulty = models.PositiveSmallIntegerField(default=1)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f'{self.order}. {self.name}'


class Lesson(models.Model):
    level = models.ForeignKey(Level, related_name='lessons', on_delete=models.CASCADE)
    order = models.PositiveSmallIntegerField()
    title = models.CharField(max_length=80)
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPES)
    icon = models.CharField(max_length=8, default='📘')
    words = models.ManyToManyField('vocabulary.Word', related_name='lessons')
    xp_reward = models.PositiveIntegerField(default=20)

    class Meta:
        ordering = ['level__order', 'order']
        unique_together = ('level', 'order')

    def __str__(self):
        return f'{self.level.name} · {self.title}'


class LessonProgress(models.Model):
    STATUS_CHOICES = [('locked', 'Locked'), ('available', 'Available'), ('completed', 'Completed')]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='lesson_progress', on_delete=models.CASCADE)
    lesson = models.ForeignKey(Lesson, related_name='progress', on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='locked')
    stars = models.PositiveSmallIntegerField(default=0)
    best_score_pct = models.PositiveSmallIntegerField(default=0)
    attempts = models.PositiveIntegerField(default=0)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('user', 'lesson')

    def __str__(self):
        return f'{self.user} · {self.lesson} · {self.status}'
