
import * as constants from './constants.js';
import api from './api.js';

let books = null;

export async function getBooks() {
  if (books === null) {
    console.log("HITTING API")
    books = await api.getAllBooks();
  }
  return books;
}

export async function getBookByNumber(number) {
  let _books = await getBooks();
  number = parseInt(number);
  const bookIndex = _books.findIndex((book) => book.number === number);
  const book = _books[bookIndex];
  return book;
}

export async function getBookByName(name) {
  let _books = await getBooks();
  const bookIndex = _books.findIndex((book) => book.name === name);
  const book = _books[bookIndex];
  return book;
}

// Make sure a query param is valid
export function setParamIfValid(queryParams, key, value) {
  if (value !== undefined && value !== '' && value !== null) {
    queryParams.set(key, value);
  }
}

// Used to search by reference.
export function isReferenceMatch(searchTerm, reference) {
  const regex = new RegExp(searchTerm.split(" ").join(".*"), "i");
  return regex.test(reference);
}

// Convert a context object JS json
export function contextToJson(context) {
  if ([null, undefined, ""].includes(context)) {
    return context;
  }
  context = context.replace(/'/g, '"').replace(/None/g, null);
  return JSON.parse(context);
}

// Submit a passage to render on the read screen.
export function submitPassageSelection(bookNumber, startChapter, startVerse, endChapter, endVerse) {
  const queryParams = new URLSearchParams();

  setParamIfValid(queryParams, 'bk', bookNumber);
  setParamIfValid(queryParams, 'ch_s', startChapter);
  setParamIfValid(queryParams, 'vs_s', startVerse);
  setParamIfValid(queryParams, 'ch_e', endChapter);
  setParamIfValid(queryParams, 'vs_e', endVerse);

  const newUrl = `${window.location.origin}${constants.READ_PAGE}?${queryParams.toString()}`;

  if (window.location.href.includes(constants.PASSAGES_PAGE)) {
    window.open(newUrl)
  } else {
    window.location.href = newUrl;
  }
}

export function showToast(message, duration) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.classList.add('toast');
  document.body.appendChild(toast);
  setTimeout(() => {
    document.body.removeChild(toast);
  }, duration);
}

// export default {
//   setParamIfValid,
//   isReferenceMatch,
//   contextToJson,
//   getBookByName,
//   getBookByNumber,
//   submitPassageSelection
// }