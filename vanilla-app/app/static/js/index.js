const form = document.querySelector('form');
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const bookNumber = document.querySelector('#book_number').value;
    const startChapter = document.querySelector('#start_chapter').value;
    const startVerse = document.querySelector('#start_verse').value;
    const endChapter = document.querySelector('#end_chapter').value;
    const endVerse = document.querySelector('#end_verse').value;

    submitPassageSelection(bookNumber, startChapter, startVerse, endChapter, endVerse);
});