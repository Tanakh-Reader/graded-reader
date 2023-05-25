
import * as constants from './constants.js';

function getHebrewText(passageId) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: constants.HEBREW_TEXT_API,
            data: {
                'ref': passageId
            },
            success: function (response) {
                // Dispatch a custom event after updating the HTML content
                const event = new CustomEvent('hebrewTextLoaded', {
                    detail: { passageId: passageId }
                });
                document.dispatchEvent(event);

                resolve(response.html);  // Resolve the promise with the response
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


export default { 
    getHebrewText, 
    checkDataReady
}
