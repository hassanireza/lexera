from django.shortcuts import render
from django.http import Http404

CHAPTER1_LESSON_IDS = [
    'tr-c1-l1',
    'tr-c1-l2',
    'tr-c1-l3',
    'tr-c1-l4',
    'tr-c1-l5',
    'tr-c1-l6',
    'tr-c1-l7',
    'tr-c1-l8',
    'tr-c1-l9',
    'tr-c1-l10',
]

LESSON_META = {
    'tr-c1-l1':  {'title': 'The Turkish Alphabet', 'icon': '🔤'},
    'tr-c1-l2':  {'title': 'Greetings',            'icon': '👋'},
    'tr-c1-l3':  {'title': 'Numbers 1-10',         'icon': '🔢'},
    'tr-c1-l4':  {'title': 'Numbers & Prices',     'icon': '💰'},
    'tr-c1-l5':  {'title': 'At the Cafe',          'icon': '☕'},
    'tr-c1-l6':  {'title': 'At the Shop',          'icon': '🛍️'},
    'tr-c1-l7':  {'title': 'Getting Around',       'icon': '🚌'},
    'tr-c1-l8':  {'title': 'Meeting People',       'icon': '🤝'},
    'tr-c1-l9':  {'title': 'Chapter Review',       'icon': '🧩'},
    'tr-c1-l10': {'title': 'Your First Conversation', 'icon': '🏆'},
}


def home(request):
    """Turkish learning home — language select + chapter map."""
    return render(request, 'turkish/home.html')


def lesson(request, lesson_id):
    """Turkish lesson player."""
    if lesson_id not in CHAPTER1_LESSON_IDS:
        raise Http404('Lesson not found')
    meta = LESSON_META[lesson_id]
    return render(request, 'turkish/lesson.html', {
        'lesson_id': lesson_id,
        'lesson_title': meta['title'],
        'lesson_icon': meta['icon'],
    })
