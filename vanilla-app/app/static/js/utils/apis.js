// ----------------------------------------------------------------
// API CALLS
// ----------------------------------------------------------------

function getHebrewText(passageId, divNumber) {
    $.ajax({
        url: constants.HEBREW_TEXT_API,
        data: {
            'ref': passageId
        },
        success: function (response) {
            $('#passage-text' + divNumber).html(response.html);

            // Dispatch a custom event after updating the HTML content
            const event = new CustomEvent('hebrewTextLoaded', {
                detail: { passageId: passageId }
            });
            document.dispatchEvent(event);
        }
    });
}