
import * as constants from './constants.js';
import * as events from './events.js';

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

// api.js
function getAlgorithmForm() {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: constants.GET_ALGORITHM_FORM_API,
            method: "GET",
            data: {
                // 'ref': passageId
            },
            success: function (response) {
                $('.algorithm-form-container').html(response.html);

                // Ensure that the DOM has finished updating
                setTimeout(() => {
                    events.publish(constants.ALG_FORM_LOADED_EVENT);
                }, 0);

                resolve();
            },
            error: function (error) {
                reject(error);  // Reject the promise if there's an error
            }
        });
    });
}



function submitForm(formData, formUrl) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: formUrl,
            method: 'POST',
            data: formData,
            processData: false,
            contentType: false,
        })
            .done(function (data) {
                if (data.status === 'success') {
                    // The form was processed successfully
                    console.log(data.message);
                } else {
                    // Something went wrong
                    console.error('Error:', data.message);
                }
            })
            .fail(function (error) {
                console.error('Error:', error);
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

function postAlgorithm(configuration, task, text=null) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: constants.POST_ALGORITHM_API,
            method: "POST",
            contentType: "application/json", // for parsing in the backend
            data: JSON.stringify({
                'configuration': configuration,
                'task': task,
                'text': text,
            }),
            success: function (response) {
                resolve(response);  // Resolve the promise with the response
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
    getAlgorithmForm,
    submitForm,
    postAlgorithm
}
