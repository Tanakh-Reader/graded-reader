# https://dev.to/besil/my-django-svelte-setup-for-fullstack-development-3an8
import json
from django.core.paginator import Paginator
from django.http import HttpResponse, HttpResponseNotAllowed, HttpResponseRedirect, JsonResponse, Http404, HttpRequest
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
from .providers.algorithm_provider import algorithm_provider

from .models import Passage, Word
from .forms import *
from .utils import references, algorithms as alg

def index(request: HttpRequest) -> HttpResponse:
    context = {}
    return render(request, "index.html", context)


# TODO SEE: https://docs.djangoproject.com/en/4.2/topics/cache/
# AND https://docs.djangoproject.com/en/4.2/topics/http/sessions/
# @cache_page(60 * 15)
def read(request: HttpRequest) -> HttpResponse:
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

from django.forms import formset_factory
from .forms import VerbForm, FrequencyForm

def algorithm_form(request: HttpRequest):
    VerbFormSet = formset_factory(VerbForm, extra=1)  # extra=1 means 1 form will be displayed initially
    FrequencyFormSet = formset_factory(FrequencyForm, extra=1)

    if request.method == 'POST':
        verb_formset = VerbFormSet(request.POST, prefix='verbs')
        frequency_formset = FrequencyFormSet(request.POST, prefix='freqs')

        if verb_formset.is_valid() and frequency_formset.is_valid():
            # Process the data and generate your configuration.json
            # ...
            print("Yah Baby")
    else:
        verb_formset = VerbFormSet(prefix='verbs')
        frequency_formset = FrequencyFormSet(prefix='freqs')

    return render(request, 'algorithm_form.html', {
        'verb_formset': verb_formset,
        'frequency_formset': frequency_formset
    })




# @cache_page(60 * 15)
def passages(request: HttpRequest) -> HttpResponse:
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

def passages_compare(request: HttpRequest) -> HttpResponse: 

    passage1_id = request.GET.get('p1_id')
    passage2_id = request.GET.get('p2_id')
    ids = [passage1_id, passage2_id]
    text_passages = passage_provider.get_passages_by_ids(ids, as_json=True)
    all_passages = passage_provider.get_all_passages(as_json=True)
    books = book_provider.get_all_book_instances(as_json=True)

    context = {
        'text_passages': text_passages,
        'passages': all_passages,
        'books': books
    }

    return render(request, "passages_compare.html", context)


def algorithms(request: HttpRequest) -> HttpResponse:
    

    VerbFormSet = formset_factory(VerbForm, extra=1)
    FrequencyFormSet = formset_factory(FrequencyForm, extra=1)

    # ... handle POST data if required, otherwise instantiate the formsets

    passages = passage_provider.get_all_passages(as_json=True)

    verb_formset = VerbFormSet(prefix='verbs')
    frequency_formset = FrequencyFormSet(prefix='freqs')
    algorithm_templates = algorithm_provider.get_default_configurations()
    saved_algorithms = algorithm_provider.get_all_algorithms(configs_only=True)
    print(saved_algorithms)
    context = {
        "algorithm_templates": algorithm_templates,
        'saved_algorithms': saved_algorithms,
        'verb_formset': verb_formset,
        'frequency_formset': frequency_formset,
        'passages': passages,
        }
    return render(request, "algorithms.html", context)


def settings(request: HttpRequest) -> HttpResponse:
    context = {}

    return render(request, "settings.html", context)






# API ENDPOINTS --------------------------------
# --------------------------------

def get_hebrew_text(request: HttpRequest) -> JsonResponse:

    pId = request.GET.get('ref')
    passage = passage_provider.get_passages_by_ids([pId])[0]
    words = word_provider.get_words_from_passage(passage, as_json=True)
    # temp = []
    # for w in words:
    #     word = []
    #     for k in 'text speech state verb_tense verb_stem person gender number lex_frequency'.split(' '):
    #         if w[k]:
    #             word.append(word_provider.get_value_definition(k, w[k]))
    #     temp.append(word)
    # print(f"\n\n{pId} {temp}\n\n")

    context = {'words': words}
    text_html = render_to_string('widgets/hebrew_text.html', context)
    return JsonResponse({'html': text_html})

def get_books(request: HttpRequest) -> JsonResponse:
    
    books = book_provider.get_all_book_instances(as_json=True)
    return JsonResponse({'books': books})

def check_data_ready(request: HttpRequest) -> JsonResponse:
    data_source = request.GET.get("data_source")
    if data_source == "WORDS":
        data_loaded = word_provider.load_words_if_not_added()
    elif data_source == "PASSAGES":
        data_loaded = passage_provider.load_passages_if_not_added()
    return JsonResponse({"data_loaded": data_loaded})

@require_POST
@csrf_exempt # TEMPORARY TODO
def run_algorithm(request: HttpRequest) -> JsonResponse:
    data: dict = json.loads(request.body)
    passage_id = data.get("passages")
    configuration = data.get("configuration")
    passage: Passage = passage_provider.get_passages_by_ids([passage_id])[0]
    score = {
        'passage': passage.get_reference(),
        'score': alg.get_passage_weight_x(configuration, passage)
    }
    algorithm_provider.save_algorithm(configuration)

    return JsonResponse(score)

@require_POST
def delete_words(request: HttpRequest) -> HttpResponseRedirect:
    word_provider.delete_all()
    return redirect("settings")  # Redirect to the settings page


@require_POST
def delete_passages(request: HttpRequest) -> HttpResponseRedirect:
    passage_provider.delete_all_passages()
    return redirect("settings")  # Redirect to the settings page


# @csrf_exempt
# @require_POST
# def render_chapter(request: HttpRequest):
#     if request.method == "POST":
#         data: dict = json.loads(request.body)
#         book_number = data.get("book_number")
#         chapter_number = data.get("chapter_number")

#         reference = (book_number, chapter_number, None, None, None)
#         # A way to optimize this would be to create an endpoint to get the word data and only update the relevant parts of the page.
#         query_params = f"?book={book_number}&chapter={chapter_number}"
#         return redirect(f"/read{query_params}")

#     return HttpResponseNotAllowed(["POST"])
