async function createBookDropdown(books) {

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
    console.log(book)
    console.log("BOOK CHAPTERS" + book.chapters)
    for (let i = 1; i <= book.chapters; i++) {
        const chapterOption = document.createElement('div');
        chapterOption.textContent = i;
        chapterOption.classList.add('chapter-option');
        chapterOption.addEventListener('click', () => {
            submitPassageSelection(book.number, i);
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

// function submitChapterSelection(bookNumber, chapterNumber) {
//     const data = {
//         book_number: bookNumber,
//         chapter_number: chapterNumber,
//     };

//     fetch('/api/render_chapter', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(data),
//     }).then((response) => {
//         if (response.ok) {
//             console.log('Chapter selection submitted successfully');
//         } else {
//             console.error('Error submitting chapter selection');
//         }
//     });
// }

document.addEventListener('DOMContentLoaded', () => {

    createBookDropdown(books);
   
    // Add event listener for the button
    const chapterSelectorBtn = document.getElementById('bookSelectionButton');
    chapterSelectorBtn.addEventListener('click', () => {
        unselectBooks()
        const chapterSelector = document.getElementById('chapter-selector');
        chapterSelector.classList.toggle('hidden');
    });
});
