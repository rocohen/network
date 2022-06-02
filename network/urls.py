
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:user_id>", views.profile_view, name="profile"),
    path("following", views.following_view, name="following"),
    path("settings", views.settings_view, name="settings"),
    path("likes", views.get_likes, name="post_likes"),
    path("edit-post", views.edit_post, name="edit_post")
]

# Serving files uploaded by a user during development
if settings.DEBUG:
    urlpatterns +=  static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


