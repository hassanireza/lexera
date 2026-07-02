from django.contrib import admin
from .models import Word, WordOfDay


@admin.register(Word)
class WordAdmin(admin.ModelAdmin):
    list_display = ('text', 'part_of_speech', 'difficulty', 'origin_language')
    search_fields = ('text', 'definition')
    list_filter = ('difficulty', 'part_of_speech')
    filter_horizontal = ('synonyms',)


@admin.register(WordOfDay)
class WordOfDayAdmin(admin.ModelAdmin):
    list_display = ('date', 'word')
