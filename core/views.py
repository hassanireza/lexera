from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponse
from django.shortcuts import render
from django.templatetags.static import static
from django.utils import timezone

from learning.models import Level, Lesson, LessonProgress
from vocabulary.models import WordOfDay, Word


def landing(request):
    if request.user.is_authenticated:
        from django.shortcuts import redirect
        return redirect('core:dashboard')
    return render(request, 'core/landing.html')


@login_required
def dashboard(request):
    user = request.user
    levels = Level.objects.prefetch_related('lessons').all()
    progress_map = {p.lesson_id: p for p in LessonProgress.objects.filter(user=user)}

    completed_lesson_ids = {lid for lid, p in progress_map.items() if p.status == 'completed'}
    level_blocks = []
    unlocked_next = True
    for level in levels:
        lessons = list(level.lessons.all())
        block_lessons = []
        for i, lesson in enumerate(lessons):
            p = progress_map.get(lesson.id)
            if p and p.status == 'completed':
                status = 'completed'
            elif unlocked_next:
                status = 'available'
                unlocked_next = False
            else:
                status = 'locked'
            stars = p.stars if p else 0
            block_lessons.append({'lesson': lesson, 'status': status, 'stars': stars, 'stars_range': range(stars)})
        level_blocks.append({'level': level, 'lessons': block_lessons})

    wod = WordOfDay.objects.filter(date=timezone.localdate()).select_related('word').first()
    if not wod:
        wod = WordOfDay.objects.select_related('word').order_by('-date').first()

    xp_into, xp_span = user.xp_into_level_and_span
    daily_progress = min(100, int(xp_into / max(1, user.daily_goal_xp) * 100))

    return render(request, 'core/dashboard.html', {
        'level_blocks': level_blocks,
        'word_of_day': wod,
        'xp_into': xp_into,
        'xp_span': xp_span,
        'daily_progress': daily_progress,
    })


def manifest(request):
    data = {
        "name": "Lexera — Level up your words",
        "short_name": "Lexera",
        "description": "A gamified English vocabulary learning app.",
        "start_url": "/app/",
        "display": "standalone",
        "background_color": "#FAF9FF",
        "theme_color": "#4F46E5",
        "orientation": "portrait",
        "icons": [
            {"src": static("img/icon-192.png"), "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
            {"src": static("img/icon-512.png"), "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
        ],
    }
    return JsonResponse(data)


def service_worker(request):
    js = """
const CACHE = 'lexera-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request).then(r => r || caches.match('/offline/')))
  );
});
"""
    return HttpResponse(js, content_type='application/javascript')


def offline(request):
    return render(request, 'core/offline.html')
