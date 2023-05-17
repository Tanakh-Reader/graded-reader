# https://dev.to/besil/my-django-svelte-setup-for-fullstack-development-3an8
import json
from django.core.paginator import Paginator
from django.http import HttpResponseNotAllowed, JsonResponse, Http404, HttpRequest
from django.urls import reverse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.cache import cache_page

from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string


from django.shortcuts import render

from django.shortcuts import redirect

from .providers.book_provider import book_provider
from .providers.word_provider import word_provider
from .providers.passage_provider import passage_provider

from .models import Passage, Word
from .data import ranks
from .utils import references

def index(request: HttpRequest):
    context = {}
    return render(request, "index.html", context)


# TODO SEE: https://docs.djangoproject.com/en/4.2/topics/cache/
# AND https://docs.djangoproject.com/en/4.2/topics/http/sessions/
@cache_page(60 * 15)
def read(request: HttpRequest):
    params = references.parse_reference(request.GET)
    # Display Genesis 1 if the reference isn't specified.
    reference = params if params[0] else [1]*2 + [None]*3

    words_loaded = word_provider.load_words_if_not_added()
    words = word_provider.get_words_from_reference(reference)
    books = book_provider.get_all_book_instances(as_json=True)
    reference_string = references.get_reference_string(words)

    context = {
        "words": word_provider.words_to_json(words),
        "reference": reference_string,
        "books": books,
        "words_loaded": words_loaded,
    }
    return render(request, "read.html", context)

# @cache_page(60 * 15)
def passages(request: HttpRequest):
    book = request.GET.get("book")
    # book_index = BOOK_TO_INDEX.get(book)

    passages_loaded = passage_provider.load_passages_if_not_added()
    passages = passage_provider.get_all_passages(as_json=True)
    books = book_provider.get_all_book_instances(as_json=True)
    # paginator = Paginator(passages, 10)  # Show 10 objects per page
    # page_number = request.GET.get("page")
    # page_obj = paginator.get_page(page_number)

    context = {
        "books": books,
        "passages": passages,
        # "paginator": paginator,
        "book": book,
        "passages_loaded": passages_loaded,
    }
    return render(request, "passages.html", context)

def passages_compare(request: HttpRequest): 

    passage1_id = request.GET.get('p1_id')
    passage2_id = request.GET.get('p2_id')
    ids = [passage1_id, passage2_id]
    text_passages = passage_provider.get_passages_by_ids(ids, as_json=True)
    all_passages = passage_provider.get_all_passages(as_json=True)

    context = {
        'text_passages': text_passages,
        'passages': all_passages
    }

    return render(request, "passages_compare.html", context)


def algorithms(request: HttpRequest):
    all_ranks = ranks.LexRanks.all_ranks
    for r in all_ranks:
        r.definition = r.get_rank_dict()
    context = {"objects": all_ranks}
    return render(request, "algorithms.html", context)


def settings(request: HttpRequest):
    context = {}

    return render(request, "settings.html", context)






# API ENDPOINTS --------------------------------
# --------------------------------

def get_hebrew_text(request: HttpRequest):

    pId = request.GET.get('ref')
    passage = passage_provider.get_passages_by_ids([pId])[0]
    words = word_provider.get_words_from_passage(passage, as_json=True)
    context = {'words': words}
    text_html = render_to_string('widgets/hebrew_text.html', context)
    return JsonResponse({'html': text_html})

def get_books(request: HttpRequest):
    pass

def check_data_ready(request: HttpRequest):
    data_source = request.GET.get("data_source")
    if data_source == "WORDS":
        data_loaded = word_provider.load_words_if_not_added()
    elif data_source == "PASSAGES":
        data_loaded = passage_provider.load_passages_if_not_added()
    return JsonResponse({"data_loaded": data_loaded})


@require_POST
def delete_words(request: HttpRequest):
    word_provider.delete_all()
    return redirect("settings")  # Redirect to the settings page


@require_POST
def delete_passages(request: HttpRequest):
    passage_provider.delete_all_passages()
    return redirect("settings")  # Redirect to the settings page


@csrf_exempt
@require_POST
def render_chapter(request: HttpRequest):
    if request.method == "POST":
        data: dict = json.loads(request.body)
        book_number = data.get("book_number")
        chapter_number = data.get("chapter_number")

        reference = (book_number, chapter_number, None, None, None)
        # A way to optimize this would be to create an endpoint to get the word data and only update the relevant parts of the page.
        query_params = f"?book={book_number}&chapter={chapter_number}"
        return redirect(f"/read{query_params}")

    return HttpResponseNotAllowed(["POST"])
