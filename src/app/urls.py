from django.urls import path

from . import views

urlpatterns = [
    # path("", views.read, name="index"),
    path("", views.search_page, name="index"),
    path("read", views.read_page, name="read"),
    path("search", views.search_page, name="search"),
    path("passages", views.passages_page, name="passages"),
    path("passages/compare", views.passages_compare_page, name="compare"),
    path("algorithms", views.algorithms_page, name="algorithms"),
    path("features", views.features_page, name="features"),
    path("settings", views.settings_page, name="settings"),
    # REST ENDPOINTS
    # GET
    path("api/hebrew-text", views.get_hebrew_text, name="get_hebrew_text"),
    path("api/algorithm-form", views.algorithm_form, name="get_algorithm_form"),
    # path("api/render-chapter", views.render_chapter, name="render_chapter"),
    path("api/get-books", views.get_books, name="get_books"),
    path("api/get-algorithms", views.get_algorithms, name="get_algorithms"),
    path("api/get-passages", views.get_passages, name="get_passages"),
    path("api/check-data-ready", views.check_data_ready, name="check_data_ready"),
    # POST
    path("api/algorithm", views.post_algorithm, name="post_algorithm"),
    path(
        "api/compare-algorithms",
        views.post_algorithm_comparisons,
        name="post_algorithms",
    ),
    # DELETE
    path("api/delete-words", views.delete_words, name="delete_words"),
    path("api/delete-algorithm", views.delete_algorithm, name="delete_algorithm"),
    path("api/delete-algorithms", views.delete_algorithms, name="delete_algorithms"),
    path("api/delete-passages", views.delete_passages, name="delete_passages"),
]
