from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("read", views.read, name="read"),
    path("passages", views.passages, name="passages"),
    path("passages/compare", views.passages_compare, name="compare"),
    path("algorithms", views.algorithms, name="algorithms"),
    path("settings", views.settings, name="settings"),
    
    # REST ENDPOINTS

    # GET
    path("api/hebrew-text", views.get_hebrew_text, name="hebrew_text"),
    path("api/render-chapter", views.render_chapter, name="render_chapter"),
    path('api/get-books', views.get_books, name='get_books'),
    path("api/check-data-ready", views.check_data_ready, name="check_data_ready"),
    
    # DELETE
    path("api/delete-words", views.delete_words, name="delete_words"),
    path("api/delete-passages", views.delete_passages, name="delete_passages"),
]
