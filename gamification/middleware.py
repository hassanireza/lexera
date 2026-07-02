from django.utils import timezone


class DailyRefreshMiddleware:
    """Regens lives passively on every authenticated request."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        user = getattr(request, 'user', None)
        if user is not None and user.is_authenticated:
            try:
                user.regen_lives()
            except Exception:
                pass
        return self.get_response(request)
