from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("read", views.read, name="read"),
    path("passages", views.passages, name="passages"),
    path("algorithms", views.algorithms, name="algorithms"),
    path("settings", views.settings, name="settings"),

    # REST endpoints
    path('api/render_chapter', views.render_chapter, name='render_chapter'),
    # path('get_books', views.get_books, name='get_books'),
    path('api/check_words_ready/', views.check_words_ready, name='check_words_ready'),
    path('api/delete_words/', views.delete_words, name='delete_words'),
]
