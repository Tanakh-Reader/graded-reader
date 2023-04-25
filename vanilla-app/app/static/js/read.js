
function checkDataReady() {
    fetch('/check_words_ready/')
      .then(response => response.json())
      .then(data => {
        if (data.words_loaded) {
          location.reload();
        } else {
          setTimeout(checkDataReady, 10000); // Check every 10 seconds
        }
      });
  }

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
    console.log(newChapter, book.chapters);
    // Get the new chapter
    if (newChapter >= 1 && newChapter <= book.chapters) {
      submitChapterSelection(book.number, newChapter)
    } else if (newChapter === 0 && book.number > 1) {
      const newBook = getBookByNumber(book.number - 1);
      submitChapterSelection(newBook.number, newBook.chapters)
    } else if (newChapter > book.chapters && book.number < books.length) {
      const newBook = getBookByNumber(book.number + 1);
      submitChapterSelection(newBook.number, 1)
    }
  }

  function getBookByNumber(number) {
    const bookIndex = books.findIndex((book) => book.number === number);
    const book = books[bookIndex];
    return book;
  }

  function submitChapterSelection(bookNumber, chapterNumber) {
    const queryParams = new URLSearchParams({
        bk: bookNumber,
        ch_s: chapterNumber,
    });
    const newUrl = `${window.location.origin}/read?${queryParams.toString()}`;
    window.location.href = newUrl;
}


function getGradientColor(penalty) {
    const green = [0, 0, 0];
    const red = [255, 0, 0];
    const ratio = penalty / 10;

    const r = green[0] + ratio * (red[0] - green[0]);
    const g = green[1] + ratio * (red[1] - green[1]);
    const b = green[2] + ratio * (red[2] - green[2]);

    return `rgb(${r}, ${g}, ${b})`;
}

function toggleSelectedWord(wordJSON=null) {

  const currentSelection = document.querySelector('.selected');
  if (currentSelection !== null) {
      currentSelection.classList.remove('selected');
  }

  if (wordJSON != null) {
    const newSelection = document.getElementById(wordJSON.id);
    newSelection.classList.add('selected');
  }
}


function showWordAttributes(word) {
    wordJSON = contextToJson(word);
    toggleSelectedWord(wordJSON);
    const attributes = Object.entries(wordJSON).map(
      ([key, value]) => {
        if (value !== null && value !== "" && value !== " ") {
          return `<b>${key}:</b> ${value}`;
        }
        return null;
      }
    ).filter(attr => attr !== null).join('<br>');

    // Get the attributes div element and update its content
    const attributesDiv = document.getElementById('attributes-div');
    attributesDiv.innerHTML = attributes;
    // Include dismiss button
    const dismissButton = document.createElement('button');
    dismissButton.textContent = 'x'
    dismissButton.onclick = () => {
      attributesDiv.style.display = 'none';
      toggleSelectedWord();
    }
    attributesDiv.appendChild(dismissButton)

    // Show the attributes div element
    attributesDiv.style.display = 'block';
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

document.addEventListener('DOMContentLoaded', () => {

    const words = document.querySelectorAll('.word');
    words.forEach(word => {
      const penalty = parseFloat(word.dataset.penalty);
      word.style.color = getGradientColor(penalty);
    });

    // initializeBookSelectionButton(books);

    // Add a div element to hold the attributes
    const attributesDiv = document.createElement('div');
    attributesDiv.id = 'attributes-div'

    // Insert the attributes div element after the paragraph div element
    const paragraphDiv = document.getElementById('paragraph');
    paragraphDiv.parentNode.insertBefore(attributesDiv, paragraphDiv.nextSibling);
  });

