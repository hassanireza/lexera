from django.contrib import admin
from .models import Level, Lesson, LessonProgress


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0
    filter_horizontal = ('words',)


@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('order', 'name', 'min_difficulty', 'max_difficulty')
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('level', 'order', 'title', 'lesson_type', 'xp_reward')
    filter_horizontal = ('words',)


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'status', 'stars', 'best_score_pct')
    list_filter = ('status',)
