
// Constant values
const constants = {
  READ_PAGE: '/read',
  PASSAGES_PAGE: '/passages',
  DATA_LOADED_API: 'api/check_data_ready/'
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

  function setParamIfValid(key, value) {
    if (value !== undefined && value !== '' && value !== null) {
      queryParams.set(key, value);
    }
  }

  setParamIfValid('bk', bookNumber);
  setParamIfValid('ch_s', startChapter);
  setParamIfValid('vs_s', startVerse);
  setParamIfValid('ch_e', endChapter);
  setParamIfValid('vs_e', endVerse);

  const newUrl = `${window.location.origin}${constants.READ_PAGE}?${queryParams.toString()}`;

  if (window.location.href.includes(constants.PASSAGES_PAGE)) {
    window.open(newUrl)
  } else {
    window.location.href = newUrl;
  }
}

// Check on data that is being initialized
function checkDataReady(dataSource) {

  const queryParams = new URLSearchParams();

  queryParams.set('data_source', dataSource);
  // Append query parameters to the URL
  const requestUrl = `${constants.DATA_LOADED_API}?${queryParams.toString()}`;

  // Send GET request
  fetch(requestUrl)
    .then(response => {
      // Check if the response status is OK (200)
      console.log(response)
      if (response.ok) {
        return response.json();
      } else {
        console.error('Request failed with status:', response.status);
      }
    })
    .then(data => {
      console.log(data)
      if (data && data.data_loaded) {
        location.reload();
      } else {
        setTimeout(() => checkDataReady(dataSource), 10000); // Check every 10 seconds
      }
    })
    .catch(error => {
      console.error('Request error:', error);
    });
}