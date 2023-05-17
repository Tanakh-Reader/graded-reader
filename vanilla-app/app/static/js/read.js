function changeChapter(direction, reference) {

  // Parse reference
  const refData = reference.split(' ');
  const bookName = refData[0];
  const chapterData = refData[1].split(':');
  const currentChapter = parseInt(chapterData[0]);

  // Get the current book object
  const bookIndex = books.findIndex((book) => book.name === bookName);
  const book = books[bookIndex];

  const newChapter = currentChapter + parseInt(direction);

  // Get the new chapter
  if (newChapter >= 1 && newChapter <= book.chapters) {
    submitPassageSelection(book.number, newChapter,)
  } else if (newChapter === 0 && book.number > 1) {
    const newBook = getBookByNumber(book.number - 1);
    submitPassageSelection(newBook.number, newBook.chapters)
  } else if (newChapter > book.chapters && book.number < books.length) {
    const newBook = getBookByNumber(book.number + 1);
    submitPassageSelection(newBook.number, 1)
  }
}




// Add event listener to hide attributes panel when clicked outside
// document.addEventListener('click', (event) => {
//   const attributesDiv = document.getElementById('attributes-div');
//   if (event.target !== attributesDiv && !attributesDiv.contains(event.target)) {
//     attributesDiv.style.display = 'none';
//     toggleSelectedWord();
//   }
// });

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
