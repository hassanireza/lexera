import json
import random

from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.conf import settings

from learning.models import Lesson, LessonProgress
from vocabulary.models import Word
from gamification.models import XPEvent, Boost
from . import logic

SUDOKU_BANKS = ['TRIANGLES', 'MONASTERY', 'BLUEPRINT']


@login_required
def play_lesson(request, lesson_id):
    lesson = get_object_or_404(Lesson, id=lesson_id)
    request.user.regen_lives()

    if request.user.lives <= 0 and lesson.lesson_type != 'history':
        messages.error(request, "You're out of lives! Wait for a refill or visit the store.")
        return redirect('accounts:store')

    words = list(lesson.words.all())
    context = {'lesson': lesson}

    if lesson.lesson_type in ('quiz', 'test'):
        questions = logic.build_quiz_questions(words, mode='quiz')
        context['questions_json'] = json.dumps(questions)
        context['total'] = len(questions)
        return render(request, 'games/quiz.html', context)

    if lesson.lesson_type == 'typing':
        questions = logic.build_quiz_questions(words, mode='typing')
        context['questions_json'] = json.dumps(questions)
        context['total'] = len(questions)
        return render(request, 'games/typing.html', context)

    if lesson.lesson_type == 'dragdrop':
        items = logic.build_dragdrop(words)
        context['items_json'] = json.dumps(items)
        context['total'] = len(items)
        return render(request, 'games/dragdrop.html', context)

    if lesson.lesson_type == 'connections':
        pairs = logic.build_connections(words)
        left = [p['left'] for p in pairs]
        right = [p['right'] for p in pairs]
        random.shuffle(left)
        random.shuffle(right)
        context['pairs_json'] = json.dumps(pairs)
        context['left_json'] = json.dumps(left)
        context['right_json'] = json.dumps(right)
        context['total'] = len(pairs)
        return render(request, 'games/connections.html', context)

    if lesson.lesson_type == 'wordle':
        target = random.choice(words) if words else Word.objects.order_by('?').first()
        request.session[f'wordle_{lesson_id}'] = {
            'answer': target.text.lower(), 'guesses': [], 'solved': False,
        }
        context['word_length'] = len(target.text)
        context['max_guesses'] = 6
        context['hint'] = target.definition
        return render(request, 'games/wordle.html', context)

    if lesson.lesson_type == 'sudoku':
        bank = SUDOKU_BANKS[lesson_id % len(SUDOKU_BANKS)]
        puzzle, solution, letters = logic.generate_sudoku(bank, difficulty='easy')
        request.session[f'sudoku_{lesson_id}'] = {'solution': solution}
        context['puzzle_json'] = json.dumps(puzzle)
        context['letters'] = letters
        context['letters_json'] = json.dumps(letters)
        context['bank_word'] = bank
        return render(request, 'games/sudoku.html', context)

    if lesson.lesson_type == 'history':
        context['words'] = words
        return render(request, 'games/history.html', context)

    return redirect('core:dashboard')


@login_required
def lose_life(request):
    if request.method == 'POST':
        remaining = request.user.lose_life()
        return JsonResponse({'lives': remaining})
    return JsonResponse({'error': 'POST required'}, status=400)


def _has_double_xp(user):
    return Boost.objects.filter(user=user, boost_type='double_xp', expires_at__gt=timezone.now()).exists()


@login_required
def finish_lesson(request, lesson_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=400)
    lesson = get_object_or_404(Lesson, id=lesson_id)
    data = json.loads(request.body or '{}')
    score_pct = max(0, min(100, int(data.get('score_pct', 0))))
    user = request.user
    cfg = settings.LEXERA

    progress, _ = LessonProgress.objects.get_or_create(user=user, lesson=lesson)
    progress.attempts += 1
    passed = score_pct >= 60
    stars = 1 if score_pct >= 60 else 0
    if score_pct >= 80:
        stars = 2
    if score_pct == 100:
        stars = 3

    xp_gain = 0
    coins_gain = 0
    if passed:
        progress.status = 'completed'
        progress.completed_at = timezone.now()
        progress.stars = max(progress.stars, stars)
        progress.best_score_pct = max(progress.best_score_pct, score_pct)

        xp_gain = lesson.xp_reward + (cfg['XP_PERFECT_LESSON_BONUS'] if score_pct == 100 else 0)
        if _has_double_xp(user):
            xp_gain *= 2
        coins_gain = cfg['COINS_PER_PERFECT_LESSON'] if score_pct == 100 else cfg['COINS_PER_LESSON']

        user.add_xp(xp_gain)
        user.add_coins(coins_gain)
        user.register_activity()
        XPEvent.objects.create(user=user, amount=xp_gain, source=f'lesson:{lesson.title}')
    progress.save()

    return JsonResponse({
        'passed': passed, 'stars': progress.stars, 'xp_gain': xp_gain, 'coins_gain': coins_gain,
        'current_streak': user.current_streak, 'lives': user.lives, 'level_number': user.level_number,
    })


@login_required
def wordle_guess(request, lesson_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=400)
    state = request.session.get(f'wordle_{lesson_id}')
    if not state:
        return JsonResponse({'error': 'No active game'}, status=400)

    guess = json.loads(request.body).get('guess', '').lower().strip()
    answer = state['answer']
    if len(guess) != len(answer) or not guess.isalpha():
        return JsonResponse({'error': 'invalid guess'}, status=400)

    feedback = []
    answer_chars = list(answer)
    guess_chars = list(guess)
    result = ['absent'] * len(guess)

    for i in range(len(guess)):
        if guess_chars[i] == answer_chars[i]:
            result[i] = 'correct'
            answer_chars[i] = None
    for i in range(len(guess)):
        if result[i] == 'correct':
            continue
        if guess_chars[i] in answer_chars:
            result[i] = 'present'
            answer_chars[answer_chars.index(guess_chars[i])] = None

    state['guesses'].append({'guess': guess, 'result': result})
    solved = guess == answer
    state['solved'] = solved
    request.session[f'wordle_{lesson_id}'] = state
    request.session.modified = True

    finished = solved or len(state['guesses']) >= 6
    return JsonResponse({
        'result': result, 'solved': solved, 'finished': finished,
        'guesses_used': len(state['guesses']), 'answer': answer if finished else None,
    })


@login_required
def sudoku_check(request, lesson_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'POST required'}, status=400)
    state = request.session.get(f'sudoku_{lesson_id}')
    if not state:
        return JsonResponse({'error': 'No active game'}, status=400)
    grid = json.loads(request.body).get('grid')
    solution = state['solution']
    correct_cells = 0
    total_filled = 0
    errors = []
    for r in range(9):
        for c in range(9):
            val = (grid[r][c] or '').upper()
            if val:
                total_filled += 1
                if val == solution[r][c]:
                    correct_cells += 1
                else:
                    errors.append([r, c])
    complete = all(grid[r][c] and grid[r][c].upper() == solution[r][c] for r in range(9) for c in range(9))
    return JsonResponse({'complete': complete, 'errors': errors, 'correct_cells': correct_cells})


@login_required
def word_history(request, word_id):
    word = get_object_or_404(Word, id=word_id)
    related = word.synonyms.all()
    return render(request, 'games/word_detail.html', {'word': word, 'related': related})


@login_required
def dictionary(request):
    q = request.GET.get('q', '').strip()
    words = Word.objects.all()
    if q:
        words = words.filter(text__icontains=q)
    words = words.order_by('text')[:100]
    return render(request, 'games/dictionary.html', {'words': words, 'q': q})
