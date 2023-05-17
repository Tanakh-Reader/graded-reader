
// Constant values
const constants = {
  READ_PAGE: '/read',
  PASSAGES_PAGE: '/passages',
  COMPARE_PAGE: '/passages/compare',

  // API ENDPOINTS
  DATA_LOADED_API: '/api/check-data-ready',
  HEBREW_TEXT_API: '/api/hebrew-text',

  DELETE_WORDS_API: '/api/delete-words',
  DELETE_PASSAGES_API: '/api/delete-passages',
}


// Make sure a query param is valid
function setParamIfValid(queryParams, key, value) {
  if (value !== undefined && value !== '' && value !== null) {
    queryParams.set(key, value);
  }
}

// Used to search by reference.
function isReferenceMatch(searchTerm, reference) {
  const regex = new RegExp(searchTerm.split(" ").join(".*"), "i");
  return regex.test(reference);
}

// Convert a context object JS json
function contextToJson(context) {
  context = context.replace(/'/g, '"').replace(/None/g, null);
  return JSON.parse(context);
}


function getBookByNumber(number) {
  number = parseInt(number);
  const bookIndex = books.findIndex((book) => book.number === number);
  const book = books[bookIndex];
  return book;
}

function getBookByName(name) {
  const bookIndex = books.findIndex((book) => book.name === name);
  const book = books[bookIndex];
  return book;
}



// Submit a passage to render on the read screen.
function submitPassageSelection(bookNumber, startChapter, startVerse, endChapter, endVerse) {
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

