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

function getGradientColor(penalty) {
  const green = [0, 0, 0];
  const red = [255, 0, 0];
  const ratio = penalty / 10;

  const r = green[0] + ratio * (red[0] - green[0]);
  const g = green[1] + ratio * (red[1] - green[1]);
  const b = green[2] + ratio * (red[2] - green[2]);

  return `rgb(${r}, ${g}, ${b})`;
}

function toggleSelectedWord(wordJSON = null) {

  const currentSelection = document.querySelector('.selected');
  if (currentSelection !== null) {
    if (String(currentSelection.id) === String(wordJSON.id)) { // check if the clicked word is already selected
      currentSelection.classList.remove('selected'); // remove the 'selected' class
      document.getElementById('attributes-div').style.display = 'none'; // hide the attributes panel
      return; // exit the function
    }
    currentSelection.classList.remove('selected'); // remove the 'selected' class from the previous selected word
  }

  if (wordJSON != null) {
    const newSelection = document.getElementById(wordJSON.id);
    newSelection.classList.add('selected'); // add the 'selected' class to the clicked word
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

document.addEventListener('DOMContentLoaded', () => {

  const words = document.querySelectorAll('.word');
  words.forEach(word => {
    const penalty = parseFloat(word.dataset.penalty);
    word.style.color = getGradientColor(penalty);
  });

  // Add a div element to hold the attributes
  const attributesDiv = document.createElement('div');
  attributesDiv.id = 'attributes-div'

  // Insert the attributes div element after the paragraph div element
  const paragraphDiv = document.getElementById('paragraph');
  paragraphDiv.parentNode.insertBefore(attributesDiv, paragraphDiv.nextSibling);
});

