
import * as constants from './constants.js';
// import * as utils from './utils.js';

function getHebrewText(passageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: constants.GET_HEBREW_TEXT_API,
            method: "GET",
            data: {
                'ref': passageId
            },
            success: function (response) {
                resolve(response.html);  // Resolve the promise with the response
            },
            error: function (error) {
                reject(error);  // Reject the promise if there's an error
            }
        });
    });
}

function getAllBooks() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: constants.GET_BOOKS_API,
            method: "GET",
            success: function (response) {
                resolve(response.books);  // Resolve the promise with the response
            },
            error: function (error) {
                reject(error);  // Reject the promise if there's an error
            }
        });
    });
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

function postAlgorithm(passageId, configuration) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: constants.POST_ALGORITHM_API,
            method: "POST",
            contentType: "application/json", // for parsing in the backend
            data: JSON.stringify({
                'passages': passageId,
                'configuration': configuration,
            }),
            success: function (response) {
                resolve(response.score);  // Resolve the promise with the response
            },
            error: function (error) {
                reject(error);  // Reject the promise if there's an error
            }
        });
    });
}



export default { 
    getHebrewText, 
    getAllBooks, 
    checkDataReady,
    postAlgorithm
}
