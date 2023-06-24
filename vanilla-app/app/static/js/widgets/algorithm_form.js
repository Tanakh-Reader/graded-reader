import * as constants from '../utils/constants.js';
import * as utils from '../utils/utils.js';
import apis from '../utils/api.js';


const formsToClone = {
    verb: document.querySelector(`.verb-form`),
    freq: document.querySelector(`.freq-form`)
};
const dataDiv = document.querySelector(`#data`).dataset;
var verbCount = dataDiv.verbCount;
var freqCount = dataDiv.freqCount;


// Dictionary to track form indexes
var formCount = {
    'verb': verbCount,
    'freq': freqCount
};

function updateRemoveButtons(type) {
    // If there's only one form of this type, hide the 'remove' button
    var formDocument = document.querySelector(`.${type}-form`);
    if (formCount[type] > 0) {
        // Update event listeners for the 'remove' buttons
        formDocument.querySelectorAll(`.remove-button`).forEach(function (button) {
            // First, remove any existing event listener
            var newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Then, add the new event listener
            newButton.addEventListener('click', function (event) {
                event.target.parentNode.parentNode.remove();  // Note the additional parentNode reference here
                formCount[type]--;

                // Update the 'remove' buttons again after removing a form
                updateRemoveButtons(type);
            });
        });
    }
}

function addForm(type) {
    // Select the first form of this type to clone
    var formToClone = formsToClone[type];

    // Create a new form div and replace __prefix__ in its HTML
    var newForm = formToClone.cloneNode(true);
    newForm.innerHTML = newForm.innerHTML.replace(/__prefix__/g, formCount[type]);

    // Increase the form count
    formCount[type]++;

    // Insert the new form before the '+' button
    document.querySelector(`#add-${type}-button`).before(newForm);

    // Update the 'remove' buttons after adding a new form
    updateRemoveButtons(type);
}


function runAlgorithm(passageId, config) {
    console.log('RUN ALG');
    apis.postAlgorithm(passageId, config).then(response => {
        $("#alg").text(JSON.stringify(response, undefined, 2))
        console.log(response);
    })
        .catch(error => {
            console.error(error);
        });
}

function getConfiguration() {
    var config = {};
    var data = {};
    // Get verb data
    var verbForms = document.querySelectorAll('.verb-form');
    data.verbs = Array.from(verbForms).map(form => {
        var inputsAndSelects = form.querySelectorAll('input, select'); // include select
        // TODO check for not null or N/A ? Or handle on the backend?
        var verb_tense = {
            feature: constants.W_VERB_TENSE,
            rule: constants.EQUALS,
            value: inputsAndSelects[0].value
        };
        var verb_stem = {
            feature: constants.W_VERB_STEM,
            rule: constants.EQUALS,
            value: inputsAndSelects[1].value
        };
        var suffix = {
            feature: constants.W_PRONOMINAL_SUFFIX,
            rule: constants.EXISTS,
            value: inputsAndSelects[2].value
        };
        let verb_data = [];
        [verb_tense, verb_stem, suffix].forEach(item => {
            if (item.value !== constants.FIELD_NULL) {
                verb_data.push(item);
            }
        });
        verb_data.push(parseFloat(inputsAndSelects[3].value));
        return verb_data;
    });

    // Get frequency data
    var frequencyForms = document.querySelectorAll('.freq-form');
    data.frequencies = Array.from(frequencyForms).map(form => {
        var inputsAndSelects = form.querySelectorAll('input, select'); // include select
        return [
            parseInt(inputsAndSelects[0].value),
            parseInt(inputsAndSelects[1].value),
            parseFloat(inputsAndSelects[2].value)
        ];
    });

    config.data = data;
    return config;
}


document.addEventListener('DOMContentLoaded', function () {

    ['verb', 'freq'].forEach(function (type) {
        document.querySelector(`#add-${type}-button`).addEventListener('click', function () {
            addForm(type);
        });

        // Update the 'remove' buttons at the start
        updateRemoveButtons(type);
    });

    // TODO Will need a forAll here if multiple.
    document.querySelector('.algorithm-form').addEventListener('submit', function (event) {
        event.preventDefault();  // prevent the form from submitting normally
        const config = getConfiguration();
        const passageId = document.querySelector('.psg').dataset.id;
        console.log(config, passageId);
        // Call your API function with the appropriate arguments
        runAlgorithm(passageId, config);
    });
});
