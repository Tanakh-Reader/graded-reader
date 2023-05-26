import * as utils from './utils/utils.js';
import apis from './utils/api.js';

function changeChapter(direction, reference) {

  // Parse reference
  const refData = reference.split(' ');
  const bookName = refData[0];
  const chapterData = refData[1].split(':');
  const currentChapter = parseInt(chapterData[0]);

  // Get the current book object
  const bookIndex = utils.books.findIndex((book) => book.name === bookName);
  const book = utils.books[bookIndex];

  const newChapter = currentChapter + parseInt(direction);

  // Get the new chapter
  if (newChapter >= 1 && newChapter <= book.chapters) {
    utils.submitPassageSelection(book.number, newChapter,)
  } else if (newChapter === 0 && book.number > 1) {
    const newBook = utils.getBookByNumber(book.number - 1);
    utils.submitPassageSelection(newBook.number, newBook.chapters)
  } else if (newChapter > book.chapters && book.number < utils.books.length) {
    const newBook = utils.getBookByNumber(book.number + 1);
    utils.submitPassageSelection(newBook.number, 1)
  }
}

function toggleVerseNumbers() {
  const verseNumbers = document.getElementsByClassName('verse-number');
  for (let i = 0; i < verseNumbers.length; i++) {
    if (verseNumbers[i].style.display === 'none') {
      verseNumbers[i].style.display = 'inline';
    } else {
      verseNumbers[i].style.display = 'none';
    }
  }
}

window.toggleVerseNumbers = toggleVerseNumbers
window.changeChapter = changeChapter
// TODO change this.
window.checkDataReady = apis.checkDataReady