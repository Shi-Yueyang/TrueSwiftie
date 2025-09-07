from django.contrib import admin
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'temporary_name', 'cat_name', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'temporary_name', 'cat_name')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined')
    fieldsets = (
        (None, {'fields': ('username', 'password', 'email', 'temporary_name', 'cat_name','avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'temporary_name', 'cat_name', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
    )
    filter_horizontal = ('groups', 'user_permissions')
    ordering = ('username',)

admin.site.register(CustomUser, CustomUserAdmin)