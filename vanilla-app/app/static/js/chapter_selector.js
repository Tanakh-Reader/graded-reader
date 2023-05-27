import * as utils from './utils/utils.js';

export async function createBookDropdown(booksData=null) {

    let books = utils.contextToJson(booksData);
    if (books === null) {
        books = await utils.getBooks();
    }

    const bookDropdown = document.getElementById('bookDropdown');
    books.forEach((book) => {
        const bookOption = document.createElement('div');
        bookOption.textContent = book.name;
        bookOption.id = book.number;
        bookOption.classList.add('book-option');
        bookOption.addEventListener('click', () => {
            selectBook(book);
        });
        bookDropdown.appendChild(bookOption);
    });
}

function createChapterDropdown(book) {
    const chapterDropdown = document.getElementById('chapterDropdown');
    chapterDropdown.innerHTML = "";
    for (let i = 1; i <= book.chapters; i++) {
        const chapterOption = document.createElement('div');
        chapterOption.textContent = i;
        chapterOption.classList.add('chapter-option');
        chapterOption.addEventListener('click', () => {
            utils.submitPassageSelection(book.number, i);
        });
        chapterDropdown.appendChild(chapterOption);
    }
}

function unselectBooks() {
    const bookOptions = document.querySelectorAll('.book-option');
    bookOptions.forEach((bookOption) => {
        bookOption.classList.remove('selected');
    });
}

function selectBook(book) {
    
    unselectBooks()
    const chapterDropdown = document.getElementById('chapterDropdown');
    chapterDropdown.innerHTML = "";

    const selectedBookOption = document.getElementById(book.number);
    selectedBookOption.classList.add('selected');

    createChapterDropdown(book);
}

document.addEventListener('DOMContentLoaded', () => {   
    // Add event listener for the button
    const chapterSelectorBtn = document.getElementById('bookSelectionButton');
    chapterSelectorBtn.addEventListener('click', () => {
        unselectBooks()
        const chapterSelector = document.getElementById('chapter-selector');
        chapterSelector.classList.toggle('hidden');
    });
});
