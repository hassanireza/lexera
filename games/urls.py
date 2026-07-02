from django.urls import path
from . import views

app_name = 'games'

urlpatterns = [
    path('lesson/<int:lesson_id>/', views.play_lesson, name='play_lesson'),
    path('lesson/<int:lesson_id>/finish/', views.finish_lesson, name='finish_lesson'),
    path('lose-life/', views.lose_life, name='lose_life'),
    path('wordle/<int:lesson_id>/guess/', views.wordle_guess, name='wordle_guess'),
    path('sudoku/<int:lesson_id>/check/', views.sudoku_check, name='sudoku_check'),
    path('word/<int:word_id>/', views.word_history, name='word_history'),
    path('dictionary/', views.dictionary, name='dictionary'),
]
