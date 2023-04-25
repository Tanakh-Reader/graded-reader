# https://dev.to/besil/my-django-svelte-setup-for-fullstack-development-3an8
import json
from django.core.paginator import Paginator
from django.http import HttpResponseNotAllowed, JsonResponse, Http404
from django.urls import reverse
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.template.loader import render_to_string


from django.shortcuts import render

from django.shortcuts import redirect

from app.providers.books import book_provider
from .models import Word
from .data import ranks
from .utils.init_data import word_loader


def index(request):
    context = {}
    
    if request.method == 'POST':
        reference = parse_reference(request.POST)
        return read(request, reference)
    else:
        return render(request, "index.html", context)


# Takes a request.POST or .GET and returns a reference.
def parse_reference(data_dict):

    reference = []
    params = 'bk ch_s vs_s ch_e vs_e'.split()

    for param in params:
        data = data_dict.get(param)
        if data:
            reference.append(int(data))
        else:
            reference.append(None)
   
    return reference if len(reference) > 0 else None
    
def read(request, reference=(1,1, None, None, None)):
    
    params = parse_reference(request.GET)   
    reference = params if params[0] else reference

    words_loaded = word_loader.load_words_if_not_added()
    words = get_words_from_reference(reference)
    books = book_provider.get_book_instances()
    reference_string = get_reference_string(words)

    context = {
        "words": [word.to_dict() for word in words],
        "reference": reference_string,
        "books": [vars(book) for book in books],
        "words_loaded": words_loaded}
    return render(request, "read.html", context)


def get_reference_string(words):

    if len(words) == 0:
        return "Choose a passage"

    ref_object = {
        'book': None
    }

    book = book_provider.get_name(words[0].book)

    ref_string = f"{book} {words[0].chapter}:{words[0].verse}"
    if words[0].chapter != words[-1].chapter:
        ref_string += f"–{words[-1].chapter}:{words[-1].verse}"
    else:
        ref_string += f"–{words[-1].verse}"

    return ref_string

def get_words_from_reference(reference):
    
    book, start_chapter, start_verse, end_chapter, end_verse = reference

    if not end_chapter:
        end_chapter = start_chapter
    if not start_verse:
        start_verse = 1
    if not end_verse:
        end_verse = 176 # longest chapter in Scripture

    # Load words from DB
    all_words = Word.objects.filter(
        book=book,
        chapter__gte=start_chapter,
        chapter__lte=end_chapter,
    )

    referenced_words = []
    
    # GpT mAgIc
    for word in all_words:
        if ( # multi-chapter solution
            (word.chapter == start_chapter and word.verse >= start_verse)
            or (word.chapter == end_chapter and word.verse <= end_verse)
            or (start_chapter < word.chapter < end_chapter)
        ) and (end_chapter > start_chapter):
            referenced_words.append(word)
        elif (start_verse <= word.verse <= end_verse):
            referenced_words.append(word)

    return referenced_words


def passages(request):

    book = request.GET.get('book')
    # book_index = BOOK_TO_INDEX.get(book)
    
    passages = [{'reference':1, 'weight':5.9,'length':100}, {'reference':2, 'weight':5.9,'length':100}] * 10
    if book:
        book_index = int(book)
        passages = [p for p in passages if p['reference'] == book_index]

    paginator = Paginator(passages, 10)  # Show 10 objects per page
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    books = [{'id':1, 'name':'Genesis'}, {'id':2, 'name':'Exodus'}]  # Replace with actual books from your database

    context = {'books': books, 'passages':page_obj, 'paginator':paginator, 'book': book}
    return render(request, "passages.html", context)


def algorithms(request):
    all_ranks = ranks.LexRanks.all_ranks
    for r in all_ranks:
        r.definition = r.get_rank_dict()
    context = {"objects": all_ranks}
    return render(request, "algorithms.html", context)

def settings(request):
    context = {}
   
    return render(request, "settings.html", context)


def check_words_ready(request):
    words_loaded = word_loader.load_words_if_not_added()
    return JsonResponse({'words_loaded': words_loaded})

def get_books(request):
    pass
    
@require_POST
def delete_words(request):
    Word.objects.all().delete()
    word_loader.reset()
    return redirect('settings')  # Redirect to the settings page

@csrf_exempt
@require_POST

def render_chapter(request):

    if request.method == 'POST':
        data: dict = json.loads(request.body)
        book_number = data.get('book_number')
        chapter_number = data.get('chapter_number')

        reference = (book_number, chapter_number, None, None, None)
        # A way to optimize this would be to create an endpoint to get the word data and only update the relevant parts of the page.
        query_params = f"?book={book_number}&chapter={chapter_number}"
        return redirect(f'/read{query_params}')

    return HttpResponseNotAllowed(['POST'])