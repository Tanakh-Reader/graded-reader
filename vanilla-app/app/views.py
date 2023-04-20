# https://dev.to/besil/my-django-svelte-setup-for-fullstack-development-3an8
from django.core.paginator import Paginator
from django.shortcuts import render

from app.constants.books import BOOK_TO_INDEX
from .models import Word
from .data.words import *
from .utils.ranks import LexRanks

def index(request):
    context = {}
    
    if request.method == 'POST':
        book = request.POST['book_number']
        start_chapter = request.POST['start_chapter']
        start_verse = request.POST['start_verse']
        end_chapter = request.POST['end_chapter']
        end_verse = request.POST['end_verse']
        
        return read(request, (book, start_chapter))
    else:
        return render(request, "app/index.html", context)


def read(request, reference=(1,1)):

    book, chapter = reference

    words = Word.objects.filter(book = book, chapter = chapter)

    context = {
        "words": [word.to_dict() for word in words],
        "reference": f"Book: {book}, Chapter: {chapter}"}
    return render(request, "app/read.html", context)


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
    return render(request, "app/passages.html", context)


def algorithms(request):
    ranks = LexRanks.all_ranks
    for r in ranks:
        r.definition = r.get_rank_dict()
    context = {"objects": ranks}
    return render(request, "app/algorithms.html", context)
