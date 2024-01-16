# https://dev.to/besil/my-django-svelte-setup-for-fullstack-development-3an8
import json
import traceback

from django.core.paginator import Paginator
from django.core.serializers.json import DjangoJSONEncoder
from django.forms import formset_factory, modelform_factory
from django.http import (
    Http404,
    HttpRequest,
    HttpResponse,
    HttpResponseNotAllowed,
    HttpResponseRedirect,
    JsonResponse,
)
from django.shortcuts import get_object_or_404, redirect, render
from django.template.loader import render_to_string
from django.urls import reverse
from django.views.decorators.cache import cache_page
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from .forms import *
from .models import Algorithm, Passage, Word
from .providers.algorithm_provider import algorithm_provider
from .providers.bhsa_features_provider import bhsa_features_provider
from .providers.book_provider import book_provider
from .providers.passage_provider import passage_provider
from .providers.word_provider import word_provider
from .utils import algorithms as alg
from .utils import references


def search(request: HttpRequest) -> HttpResponse:
    context = {}
    # words = word_provider.get_verbs([1437611, 1437621])
    # print(words)
    # return JsonResponse(words)
    return render(request, "index.html", context)


# TODO SEE: https://docs.djangoproject.com/en/4.2/topics/cache/
# AND https://docs.djangoproject.com/en/4.2/topics/http/sessions/
# @cache_page(60 * 15)
def read(request: HttpRequest) -> HttpResponse:
    params = references.parse_reference(request.GET)
    # Display Genesis 1 if the reference isn't specified.
    reference = params if params[0] else [1] * 2 + [None] * 3

    words_loaded = word_provider.load_words_if_not_added()
    words = word_provider.get_words_from_reference(reference)
    books = book_provider.get_all_book_instances(as_json=True)
    reference_string = references.get_reference_string(words, abbreviation=True)

    context = {
        "words": word_provider.words_to_json(words),
        "reference": reference_string,
        "books": books,
        "words_loaded": words_loaded,
    }
    return render(request, "read.html", context)


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
    default_ids = [1, 2]
    passage_ids = request.GET.getlist("id", default_ids)
    if not (2 <= len(passage_ids) <= 4):
        passage_ids = default_ids
    text_passages = passage_provider.get_passages_by_ids(passage_ids, as_json=True)
    all_passages = passage_provider.get_all_passages(as_json=True)

    context = {"text_passages": text_passages, "passages": all_passages}

    return render(request, "passages_compare.html", context)


@csrf_exempt  # TEMPORARY TODO
def algorithms2(request: HttpRequest) -> HttpResponse:
    VerbFormSet = formset_factory(VerbForm, extra=1)
    FrequencyFormSet = formset_factory(FrequencyForm, extra=1)
    verb_formset = VerbFormSet(prefix="verbs")
    frequency_formset = FrequencyFormSet(prefix="freqs")

    passages = passage_provider.get_all_passages(as_json=True)
    algorithm_templates = algorithm_provider.get_default_configurations()
    saved_algorithms = algorithm_provider.get_saved_algorithms(configs_only=True)
    context = {
        "algorithm_templates": algorithm_templates,
        "saved_algorithms": saved_algorithms,
        "verb_formset": verb_formset,
        "frequency_formset": frequency_formset,
        "passages": passages,
    }
    return render(request, "algorithms2.html", context)


@csrf_exempt  # TEMPORARY TODO
def algorithms(request: HttpRequest) -> HttpResponse:
    algorithms = Algorithm.objects.all()

    context = {
        "algorithms": [a.as_config(True) for a in algorithms],
    }
    return render(request, "algorithms.html", context)


def features(request: HttpRequest) -> HttpResponse:
    features = bhsa_features_provider.get_features_for_display()
    context = {"features": features}

    return render(request, "features.html", context)


def settings(request: HttpRequest) -> HttpResponse:
    context = {}

    return render(request, "settings.html", context)


# API ENDPOINTS --------------------------------
# --------------------------------


def get_hebrew_text(request: HttpRequest) -> JsonResponse:
    pId = request.GET.get("ref")
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

    context = {"words": words}
    text_html = render_to_string("widgets/hebrew_text.html", context)
    return JsonResponse({"html": text_html})


def run(request: HttpRequest, algorithm: Algorithm):
    data: dict = json.loads(request.body)
    config = algorithm.as_config(True)
    response = {
        "configuration": config,
        "text": [],
    }
    text = data.get("text")
    passage_ids = text.get("passage_ids")
    print(passage_ids)
    if passage_ids and type(passage_ids) == list:
        passages: list[Passage] = passage_provider.get_passages_by_ids(passage_ids)
        for passage in passages:
            text_data = {}
            score, penalties = alg.get_passage_weight_x(config, passage)
            text_data["id"] = passage.get_reference(abbreviation=True)
            text_data["score"] = score
            text_data["penalties"] = penalties
            response["text"].append(text_data)

    return response


@csrf_exempt  # TEMPORARY TODO
def algorithm_form(request: HttpRequest) -> JsonResponse:
    algorithm_templates = algorithm_provider.get_default_configurations()
    saved_algorithms = [a.as_config(True) for a in Algorithm.objects.all()]
    passages = passage_provider.get_all_passages(as_json=True)

    form = AlgorithmForm(request)

    context = {
        "algorithm_templates": algorithm_templates,
        "saved_algorithms": saved_algorithms,
        "passages": passages,
    } | form.get_context()

    exception = None

    if request.method == "POST":
        if form.is_valid():
            try:
                action = request.POST.get("submit-action")
                algorithm_id = request.POST.get("algorithm-id")
                # If SAVE, fetch the algorithm to update if one exists.
                if action == "SAVE" and algorithm_id:
                    algorithm, created = Algorithm.objects.get_or_create(
                        pk=algorithm_id
                    )
                    form.update_base_form(algorithm)

                if form.base_form.is_valid():
                    algorithm = form.update_algorithm()

                    if action == "RUN":
                        response = run(request, algorithm)
                        return JsonResponse(response)

                    else:
                        algorithm.save()
                    return JsonResponse(
                        {
                            "alg": algorithm.as_config(True),
                            "status": "success",
                            "message": "Yah Baby",
                        }
                    )
                else:
                    return JsonResponse(
                        {
                            "status": "error",
                            "message": {
                                "errors": form.get_errors(),
                            },
                        }
                    )
            except Exception as e:
                exception = e
        else:
            return JsonResponse(
                {
                    "status": "error",
                    "message": {"exception": exception, "errors": form.get_errors()},
                }
            )

    form_html = render_to_string("widgets/algorithm_form.html", context)
    return JsonResponse({"status": "success", "html": form_html})


def get_books(request: HttpRequest) -> JsonResponse:
    books = book_provider.get_all_book_instances(as_json=True)
    return JsonResponse({"books": books})


def check_data_ready(request: HttpRequest) -> JsonResponse:
    data_source = request.GET.get("data_source")
    if data_source == "WORDS":
        data_loaded = word_provider.load_words_if_not_added()
    elif data_source == "PASSAGES":
        data_loaded = passage_provider.load_passages_if_not_added()
    return JsonResponse({"data_loaded": data_loaded})


@require_POST
@csrf_exempt  # TEMPORARY TODO
def post_algorithm(request: HttpRequest) -> JsonResponse:
    data: dict = json.loads(request.body)
    configuration = data.get("configuration")
    response = {
        "configuration": configuration,
        "text": [],
    }
    task = data.get("task")
    if task == "SAVE":
        algorithm: Algorithm = algorithm_provider.save_algorithm(configuration)
        print("JUST SAVED?", configuration)
        response["configuration"] = algorithm.configuration
    elif task == "RUN_ALGORITHM":
        text = data.get("text")
        passage_ids = text.get("passage_ids")
        print(passage_ids)
        print("CONFIG", configuration)
        if passage_ids and type(passage_ids) == list:
            passages: list[Passage] = passage_provider.get_passages_by_ids(passage_ids)
            for passage in passages:
                text_data = {}
                score, penalties = alg.get_passage_weight_x(configuration, passage)
                text_data["id"] = passage.get_reference(abbreviation=True)
                text_data["score"] = score
                text_data["penalties"] = penalties
                response["text"].append(text_data)
    return JsonResponse(response)


def post_algorithm_comparisons(request: HttpRequest):
    # algorithms = algorithm_provider.get_all_algorithms(configs_only=True)
    # algorithms = algorithm_provider.get_saved_algorithms(configs_only=True)
    algorithms = [a.as_config(True) for a in Algorithm.objects.all()]
    context = {
        "algorithms": algorithms,
        "saved_algorithms": algorithms,
        "algorithm_templates": algorithm_provider.get_default_configurations(),
    }
    try:
        count = int(request.POST.get("count"))
        alg1_id = int(request.POST.get("algorithm1"))
        alg2_id = int(request.POST.get("algorithm2"))

        # alg1 = algorithm_provider.get_algorithm_by_id(
        #     alg1_id,
        # )
        # alg2 = algorithm_provider.get_algorithm_by_id(alg2_id)
        alg1 = Algorithm.objects.get(pk=alg1_id)
        alg2 = Algorithm.objects.get(pk=alg2_id)

        list1 = []
        list2 = []

        passages: list[Passage] = passage_provider.get_easiest_passages(count)

        for passage in passages:
            passage: Passage
            for i, config in enumerate([alg1.as_config(), alg2.as_config()]):
                score, penalties = alg.get_passage_weight_x(config, passage)
                [list1, list2][i].append((passage.to_dict(), score))
        for list in [list1, list2]:
            list.sort(key=lambda x: x[1])
        context.update(
            {
                "listA": list1,
                "listB": list2,
                "algA": alg1_id,
                "algB": alg2_id,
                "count": count,
            }
        )
    except Exception as e:
        traceback.print_exc()
        pass

    return render(request, "passage_comparison.html", context)

    # return JsonResponse(context)


@require_POST
def delete_words(request: HttpRequest) -> HttpResponseRedirect:
    word_provider.delete_all()
    return redirect("settings")  # Redirect to the settings page


@require_POST
def delete_passages(request: HttpRequest) -> HttpResponseRedirect:
    passage_provider.delete_all_passages()
    return redirect("settings")  # Redirect to the settings page


@require_POST
@csrf_exempt  # Only use this if you are sure about the CSRF implications
def delete_algorithm(request: HttpRequest):
    algorithm_id = int(request.POST.get("id"))
    algorithm = get_object_or_404(Algorithm, pk=algorithm_id)
    algorithm.delete()

    return JsonResponse(
        {"status": "success", "message": f"Deleted: ${algorithm.as_config(True)}"}
    )


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
