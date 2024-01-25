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

from .algorithm import algorithms as alg
from .forms import *
from .models import Algorithm, Passage, Word
from .providers.algorithm_provider import algorithm_provider
from .providers.bhsa_features_provider import bhsa_features_provider
from .providers.book_provider import book_provider
from .providers.passage_provider import passage_provider
from .providers.word_provider import word_provider
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
    default_ids = [1]
    passage_ids = request.GET.getlist("id", default_ids)
    if not (2 <= len(passage_ids) <= 4):
        passage_ids = default_ids
    passages = passage_provider.get_passages_by_ids(passage_ids, as_json=True)
    algorithms = algorithm_provider.get_configs(as_json=True)
    context = {
        "passages": passages,
        "algorithms": algorithms,
        "saved_algorithms": algorithms,
        "algorithm_templates": algorithm_provider.get_default_configurations(),
    }
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
    context = {
        "algorithms": algorithm_provider.get_configs(as_json=True),
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


@require_POST
@csrf_exempt  # TEMPORARY TODO
def get_hebrew_text(request: HttpRequest) -> JsonResponse:
    p_id = request.POST.get("passage_id")
    as_widget = request.POST.get("as_widget")
    passage = passage_provider.get_passages_by_ids([p_id])[0]
    words = word_provider.get_words_from_passage(passage, as_json=True)
    context = {"words": words}
    template = "hebrew_text"
    if as_widget:
        context.update({"passage": passage.to_dict()})
        template = "passage_text_widget"
    text_html = render_to_string(f"widgets/{template}.html", context)
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
    form = AlgorithmForm(request)

    context = {
        "algorithm_templates": algorithm_provider.get_default_configurations(),
        "saved_algorithms": algorithm_provider.get_configs(as_json=True),
    } | form.get_context()

    exception = None

    if request.method == "POST":
        print(vars(form), "CLAUSE\n", form.clause_formset.data)
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
                            "algorithm": algorithm.as_config(True),
                            "status": "success",
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


def get_algorithms(request: HttpRequest) -> JsonResponse:
    algorithms = algorithm_provider.get_configs(as_json=True)
    return JsonResponse({"algorithms": algorithms})


def get_passages(request: HttpRequest) -> JsonResponse:
    algorithms = passage_provider.get_all_passages(as_json=True)
    return JsonResponse({"passages": algorithms})


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


@require_POST
@csrf_exempt  # TEMPORARY TODO
def run_algorithm(request: HttpRequest) -> JsonResponse:
    passage_ids = request.POST.get("passage_ids")
    alg_id = request.POST.get("algorithm_id")
    if passage_ids and type(passage_ids) == list:
        try:
            passages = passage_provider.get_passages_by_ids(passage_ids)
            config = algorithm_provider.get_configs(ids=[alg_id])[0]
            response = {}
            for passage in passages:
                text_data = {}
                score, penalties = alg.get_passage_weight_x(config, passage)
                text_data["id"] = passage.get_reference(abbreviation=True)
                text_data["score"] = score
                text_data["penalties"] = penalties
            return JsonResponse({"status": "success", "data": response})

        except Exception as e:
            traceback.print_exc()
            return JsonResponse({"status": "error", "message": str(e)})
    return JsonResponse(
        {"status": "error", "message": "invalid data " + request.POST.dict()}
    )


@require_POST
@csrf_exempt  # TEMPORARY TODO
def post_algorithm_comparisons(request: HttpRequest):
    context = {}
    try:
        count = int(request.POST.get("count"))
        alg1_id = int(request.POST.get("alg1"))
        alg2_id = int(request.POST.get("alg2"))

        alg1, alg2 = algorithm_provider.get_configs(ids=[alg1_id, alg2_id])

        list1 = []
        list2 = []

        passages = passage_provider.get_easiest_passages(count)

        for passage in passages:
            for i, config in enumerate([alg1, alg2]):
                score, penalties = alg.get_passage_weight_x(config, passage)
                # print(penalties)
                [list1, list2][i].append((passage.to_dict(), score, penalties))
        for list in [list1, list2]:
            list.sort(key=lambda x: x[1])

        context.update(
            {
                "listA": list1,
                "listB": list2,
            }
        )

    except Exception as e:
        traceback.print_exc()
        return JsonResponse({"status": "error", "message": str(e)})

    comparisons_html = render_to_string(
        "widgets/passage_penalty_comparisons.html", context
    )
    return JsonResponse({"status": "success", "html": comparisons_html})


@require_POST
def delete_words(request: HttpRequest) -> HttpResponseRedirect:
    word_provider.delete_all()
    return redirect("settings")  # Redirect to the settings page


@require_POST
def delete_passages(request: HttpRequest) -> HttpResponseRedirect:
    passage_provider.delete_all_passages()
    return redirect("settings")  # Redirect to the settings page


@require_POST
def delete_algorithms(request: HttpRequest) -> HttpResponseRedirect:
    Algorithm.objects.all().delete()
    return redirect("settings")  # Redirect to the settings page


@require_POST
@csrf_exempt  # Only use this if you are sure about the CSRF implications
def delete_algorithm(request: HttpRequest):
    algorithm_id = int(request.POST.get("id"))
    algorithm = algorithm_provider.delete_algorithm(algorithm_id)

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
