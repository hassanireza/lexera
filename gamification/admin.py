from django.contrib import admin
from .models import Boost, Badge, UserBadge, XPEvent, StoreItem

admin.site.register(Boost)
admin.site.register(Badge)
admin.site.register(UserBadge)
admin.site.register(StoreItem)


@admin.register(XPEvent)
class XPEventAdmin(admin.ModelAdmin):
    list_display = ('user', 'amount', 'source', 'created_at')
    list_filter = ('source',)
