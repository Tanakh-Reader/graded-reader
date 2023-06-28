import * as constants from '../utils/constants.js';
import * as utils from '../utils/utils.js';
import apis from '../utils/api.js';
import * as events from '../utils/events.js';


await apis.getAlgorithmForm();

const verbClassName = 'verb';
const frequencyClassName = 'freq';

const formsetNames = [
    verbClassName,
    frequencyClassName,
];

var currentConfiguration = {};
// Lets you still add when all the entries have been deleted.
const formsToClone = {
    verb: document.querySelector(`.${verbClassName}-form`),
    freq: document.querySelector(`.${frequencyClassName}-form`)
};

const dataDiv = document.querySelector(`#data`).dataset;
var verbCount = dataDiv.verbCount;
var freqCount = dataDiv.freqCount;

// Dictionary to track form indexes
var formCount = {
    'verb': verbCount,
    'freq': freqCount
};

var savedAlgorithms = $(document).find('.dropdown-container select').toArray();


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

    return newForm;
}


// ****************************************************************
// FUNCTIONS TO POPULATE THE FORM WITH EXISTING ALGORITHM DATA
// ****************************************************************

function getValue(data, feature) {
    const item = data.find((item) => item.feature === feature);
    return item ? item.value : null;
}

function removeForms(formType) {
    const formset = document.querySelector(`.${formType}-formset`);
    let forms = formset.querySelectorAll(`.${formType}-form`);

    // Keep the first form and remove the rest
    for (let i = 1; i < forms.length; i++) {
        forms[i].remove();
    }
}

function populateFormset(formType, data, populateForm) {

    if (!data || data.length === 0) {
        console.log("No data for ", formType);
        return null;
    }

    removeForms(formType);

    const formset = document.querySelector(`.${formType}-formset`);
    let forms = formset.querySelectorAll(`.${formType}-form`);
    console.log(formType, forms);
    if (forms.length === 0) {
        var firstForm = addForm(formType);
    } else {
        firstForm = forms[0];
    }
    populateForm(firstForm, data[0]);

    for (let i = 1; i < data.length; i++) {
        let newForm = addForm(formType);

        // After adding the form, it should be the last one in the formset
        // let newF3orm = forms[forms.length - 1];
        populateForm(newForm, data[i]);
    }

    const totalFormsInput = formset.querySelector('input[name$=TOTAL_FORMS]');
    totalFormsInput.value = data.length;
}


function populateFrequencyForm(form, data) {
    const startField = form.querySelector('input[name$=start]');
    const endField = form.querySelector('input[name$=end]');
    const penaltyField = form.querySelector('input[name$=penalty]');

    startField.value = data[0];
    endField.value = data[1];
    penaltyField.value = data[2];
}

function populateVerbForm(form, data) {
    const verbTenseField = form.querySelector('select[name$=verb_tense]');
    const verbStemField = form.querySelector('select[name$=verb_stem]');
    const suffixField = form.querySelector('select[name$=suffix]');
    const penaltyField = form.querySelector('input[name$=penalty]');

    verbTenseField.value = getValue(data, constants.W_VERB_TENSE) || constants.FIELD_NULL_VALUE;
    verbStemField.value = getValue(data, constants.W_VERB_STEM) || constants.FIELD_NULL_VALUE;
    suffixField.value = getValue(data, constants.W_PRONOMINAL_SUFFIX) || constants.FIELD_NULL_VALUE;
    penaltyField.value = data.slice(-1);
}

function populateAlgorithmForm(algorithmConfig) {
    const algorithmData = algorithmConfig.data;
    populateFormset(frequencyClassName, algorithmData.frequencies, populateFrequencyForm);
    populateFormset(verbClassName, algorithmData.verbs, populateVerbForm);
    document.querySelector('#alg-name').value = algorithmConfig.name;

    // Set the config for when posting.
    currentConfiguration = algorithmConfig;
}

// ****************************************************************
// FUNCTIONS TO SUBMIT THE FORM
// ****************************************************************

function getConfiguration() {
    var config = currentConfiguration;
    var data = {};
    // Get verb data
    var verbForms = document.querySelectorAll(`.${verbClassName}-form`);
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
        // Only push items that have been selected by the user.
        [verb_tense, verb_stem, suffix].forEach(item => {
            if (item.value !== constants.FIELD_NULL_VALUE) {
                verb_data.push(item);
            }
        });
        verb_data.push(parseFloat(inputsAndSelects[3].value));
        return verb_data;
    }).filter(value => (value != null && value.length > 1));  // filter out empty arrays

    // Get frequency data
    var frequencyForms = document.querySelectorAll(`.${frequencyClassName}-form`);
    data.frequencies = Array.from(frequencyForms).map(form => {
        var inputsAndSelects = form.querySelectorAll('input, select'); // include select
        return [
            parseInt(inputsAndSelects[0].value),
            parseInt(inputsAndSelects[1].value),
            parseFloat(inputsAndSelects[2].value)
        ];
    });

    // Set name
    config.name = document.querySelector('#alg-name').value

    config.data = data;
    return config;
}

function runAlgorithm(config, text) {
    console.log('RUN ALG');
    apis.postAlgorithm(config, constants.TASKS.RUN_ALGORITHM, text).then(response => {
        const textResponse = response.text
        const score = response.score;
        const penalties = response.penalties;
        const items = textResponse.sort(function (a, b) {
            return a.score - b.score;
        })

        let text = ""
        for (let item of items) {
            text = text + item.id + `<span class='text-red-500'> ${item.score}</span><br>`; // + JSON.stringify(item.penalties, undefined, 2) + '<br>';
        }
        $("#alg").html(text)
        console.log(response);
    })
        .catch(error => {
            console.error(error);
        });
    dismissAlgorithmForm();
}

function saveAlgorithm(config) {
    console.log('SAVE ALG');
    apis.postAlgorithm(config, constants.TASKS.SAVE).then(response => {
        // TODO Also add to the dropdown if applicable.
        const savedConfig = response.configuration;
        currentConfiguration = savedConfig;
        utils.showToast(`Algorithm ${savedConfig.name} saved successfully.`, 3000);
        console.log(response);
    })
        .catch(error => {
            console.error(error);
        });
}

function setupFormSubmission() {
    // TODO Will need a forAll here if multiple.
    document.querySelector('.algorithm-form').addEventListener('submit', function (event) {
        event.preventDefault();  // prevent the form from submitting

        var formData = new FormData(event.target);


        // apis.submitForm(formData, constants.GET_ALGORITHM_FORM_API);

        let isValidForm = true;
        document.querySelectorAll('input[type="number"]').forEach(function (input) {
            if (input.value.trim() === '') {
                console.log(input);
                isValidForm = false;
            }
        });
        if (!isValidForm) {
            alert('Please fill all the fields.');
        } else {
            const config = getConfiguration();
            if (event.submitter.id === "save") {
                saveAlgorithm(config);
            // Handle text data
            } else {
                // If a page with rendered text, set those texts to be the passages.
                var passageIds = null;
                if (window.location.href.includes(constants.COMPARE_PAGE)) {
                    const referenceButtons = document.querySelectorAll('.reference-button');
                    passageIds = Array.from(referenceButtons).map(button => {
                        return $(button).attr('data-id');
                    }).filter(id => id != null);
                } else {
                    let passageId = $('.psg').attr('data-id');
                    console.log(passageId);
                    console.log($('.psg'));
                    if (passageId) {
                        passageIds = [passageId];
                    }
                }
                if (!passageIds || passageIds.length === 0) {
                    alert('Please select a passage.');
                }
                const text = {
                    "passage_ids": passageIds
                }
                runAlgorithm(config, text);
            }
            currentConfiguration = {};
        }
    });
}

// ****************************************************************
// FUNCTIONS TO TOGGLE THE FORM'S DISPLAY
// ****************************************************************

// Assuming you have more than one button, we add the event listener to each button
function setupToggleFormButtons() {
    let form = document.querySelector('.algorithm-form');
    let buttons = document.querySelectorAll('.toggle-form-button');
    // E.g., on the Algorithms screen.
    if (buttons.length === 0) {
        form.style.display = "inline-flex";
        form.classList.remove("absolute");
        form.querySelector('.dismiss-btn').style.display = "none";
    }
    else {
        buttons.forEach(button => {
            button.addEventListener('click', function (e) {
                // To compensate for tailwind classes not affecting inline style.
                let display = window.getComputedStyle(form).display;
                if (display === "none") {
                    let rect = e.target.getBoundingClientRect();
                    form.style.top = (rect.top + window.scrollY + button.offsetHeight) + "px";
                    form.style.left = (rect.left + window.scrollX) + "px";
                    form.style.display = "inline-flex";
                } else {
                    form.style.display = "none";
                }
            });
        });
    }
}


function dismissAlgorithmForm() {
    document.querySelector('.algorithm-form').style.display = "none";
}


// ****************************************************************
// INITIALIZE FUNCTIONS
// ****************************************************************

events.subscribe(constants.ALG_FORM_LOADED_EVENT, function () {

    setupToggleFormButtons();

    formsetNames.forEach(function (type) {
        document.querySelector(`#add-${type}-button`).addEventListener('click', function () {
            addForm(type);
        });

        // Update the 'remove' buttons at the start
        updateRemoveButtons(type);
    });

    savedAlgorithms.forEach((dropdown) => {
        dropdown.addEventListener('change', (event) => {
            const selectedOption = event.target.selectedOptions[0];
            const algorithmConfig = utils.contextToJson(selectedOption.dataset.definition);
            populateAlgorithmForm(algorithmConfig)
        });
    });

    setupFormSubmission();
});

window.populateAlgorithmForm = populateAlgorithmForm;
window.dismissAlgorithmForm = dismissAlgorithmForm;