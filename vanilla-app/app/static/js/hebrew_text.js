import * as utils from './utils/utils.js';
import * as constants from './utils/constants.js';


function getGradientColor(penalty) {
    const green = [0, 0, 0];
    const red = [255, 0, 0];
    const ratio = penalty / 10;

    const r = green[0] + ratio * (red[0] - green[0]);
    const g = green[1] + ratio * (red[1] - green[1]);
    const b = green[2] + ratio * (red[2] - green[2]);

    return `rgb(${r}, ${g}, ${b})`;
}

function colorWords(div = null) {
    // If more than one text widget, choose the div.
    var textDiv = document;
    if (div !== null) {
        textDiv = div
    }
    // Color the words
    const words = textDiv.querySelectorAll('.word');
    words.forEach(word => {
        const penalty = parseFloat(word.dataset.penalty);
        // Proper nouns should be grey.
        if (word.dataset.speech === 'nmpr') {
            word.style.color = '#A9A9A9';
        } else {
            word.style.color = getGradientColor(penalty);
        }
    });
}

function showWordAttributes(word) {
    const wordJSON = utils.contextToJson(word);
    const alreadySelected = toggleSelectedWord(wordJSON);
    // Don't rebuild the div if we're unselecting the current word.
    if (alreadySelected) {
        return;
    }
    const attributes = Object.entries(wordJSON).map(
        ([key, value]) => {
            if (value !== null && value !== "" && value !== " ") {
                value = value.toString().replace('<', '').replace('>', '');
                return `<b>${key}:</b> ${value}`;
            }
            return null;
        }
    ).filter(attr => attr !== null).join('<br>');

    // Get the attributes div element and update its content
    const wordAttributesDiv = document.getElementById('word-attributes');
    wordAttributesDiv.innerHTML = attributes;

    // Show the widget div element
    const widgetDiv = document.getElementById('selected-word-widget');
    widgetDiv.style.display = 'block';
}

function dismissWordWidget() {
    document.getElementById('selected-word-widget').style.display = 'none';
    // Unselect the current word..
    document.querySelector('.selected').classList.remove('selected');
}

function toggleSelectedWord(wordJSON) {

    const currentSelection = document.querySelector('.selected');
    
    if (currentSelection !== null) {
        if (String(currentSelection.id) === String(wordJSON.id)) { // check if the clicked word is already selected
            dismissWordWidget();
            return true; // exit the function
        }
        // Remove the selected word when a new word is selected.
        currentSelection.classList.remove('selected');
    }

    // Select the currently clicked on word, if not already selected
    const newSelection = document.getElementById(wordJSON.id);
    newSelection.classList.add('selected');
}

// For Read page
utils.subscribe('DOMContentLoaded', (event) => {
    colorWords();
})

// For Words generated from API call
utils.subscribe(constants.TEXT_LOADED_EVENT, (event) => {
    colorWords(event.detail);
});

window.showWordAttributes = showWordAttributes;
window.dismissWordWidget = dismissWordWidget;