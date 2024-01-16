import * as constants from "../utils/constants.js";
import * as utils from "../utils/utils.js";
import apis from "../utils/api.js";
import * as events from "../utils/events.js";

await apis.getAlgorithmForm();

// Object to store the initial clones of each formset
const formsetClones = {};
const formsetClasses = ["frequency", "verb", "noun", "clause"];
var savedAlgorithms = null;
var algorithmNameInput = null;
var algorithmIdInput = null;
var stopWordsCheckbox = null;
var taperDiscountInput = null;
var properNounInput = null;
var qereInput = null;
var verbStemCheckbox = null;
var penaltyDivisorSelect = null;

const defaultValues = {
    algorithmName: '', // Replace with actual default
    algorithmId: '', // Replace with actual default
    includeStopWords: false, // Replace with actual default
    penalizeByVerbStem: true, // Replace with actual default
    taperDiscount: 1, // Replace with actual default
    properNounDivisor: 2, // Replace with actual default
    qerePenalty: 7, // Replace with actual default
    totalPenaltyDivisor: "WORDS" // Assuming this is the default for dropdowns
}; 

// Function to update the names and IDs of form inputs to maintain proper indexing
function updateFormIndices(formsetSelector) {
	// Get all the forms within the formset
	const forms = document.querySelectorAll(formsetSelector);
	// Iterate over each form and update the index of each input
	forms.forEach((form, index) => {
		form.querySelectorAll("input, select").forEach((input) => {
			// Replace the form index in the name attribute
			const name = input.name.replace(/-\d+-/, `-${index}-`);
			input.name = name;
			input.id = `id_${name}`; // Update the ID to match the name
		});
	});
}

// Function to set up event listeners for adding and removing forms
function setupFormsetHandlers(formsetClassName) {
	// Selectors for various elements within the formsets
	const addButtonSelector = `#add-${formsetClassName}-form`;
	const formsetContainerSelector = `.${formsetClassName}-formset`;
	const formSelector = `.${formsetClassName}-form`;
	const totalFormsInputSelector = `#id_${formsetClassName}-TOTAL_FORMS`;

	// Clone the initial form and store it when the page is loaded
	formsetClones[formsetClassName] = document
		.querySelector(formSelector)
		.cloneNode(true);

	// Add new form to the formset when the add button is clicked
	document.querySelector(addButtonSelector).addEventListener("click", () => {
		// Get the current total form count from the management form
		// const formIndex = parseInt(
		// 	document.querySelector(totalFormsInputSelector).value,
		// );
		// // Clone the stored form and update its indices
		// const newForm = formsetClones[formsetClassName].cloneNode(true);
		// newForm.innerHTML = newForm.innerHTML.replace(/__prefix__/g, formIndex);
		// // Append the new form to the formset container
		// document.querySelector(formsetContainerSelector).appendChild(newForm);
		// // Increment the total form count in the management form
		// document.querySelector(totalFormsInputSelector).value = formIndex + 1;
		// // Update indices to reflect the new form addition
		// updateFormIndices(formSelector);
		addForm(formsetClassName);
	});

	// Remove a form from the formset when the remove button is clicked
	document
		.querySelector(formsetContainerSelector)
		.addEventListener("click", (event) => {
			if (event.target.classList.contains("remove-form-button")) {
				// Remove the form that contains the clicked remove button
				event.target.closest(formSelector).remove();
				// Update the total form count in the management form
				document.querySelector(totalFormsInputSelector).value =
					document.querySelectorAll(formSelector).length;
				// Update indices to reflect the form removal
				updateFormIndices(formSelector);
			}
		});

	removeForms(formsetClassName);
}

function addForm(formType) {
	const formsetContainerSelector = `.${formType}-formset`;
	const formIndex = document.querySelector(`#id_${formType}-TOTAL_FORMS`).value;
	const newForm = formsetClones[formType].cloneNode(true);
	newForm.innerHTML = newForm.innerHTML.replace(/__prefix__/g, formIndex);
	document.querySelector(formsetContainerSelector).appendChild(newForm);
	document.querySelector(`#id_${formType}-TOTAL_FORMS`).value =
		parseInt(formIndex) + 1;
	updateFormIndices(`.${formType}-form`);
	return newForm;
}

const verbClassName = "verb";
const frequencyClassName = "frequency";

// const formsetNames = [verbClassName, frequencyClassName];

var currentConfiguration = {};
// Lets you still add when all the entries have been deleted.
// const formsToClone = {
// 	verb: document.querySelector(`.${verbClassName}-form`),
// 	freq: document.querySelector(`.${frequencyClassName}-form`),
// };

// const dataDiv = document.querySelector(`#data`).dataset;
// var verbCount = dataDiv.verbCount;
// var freqCount = dataDiv.freqCount;

// Dictionary to track form indexes
// var formCount = {
// 	verb: verbCount,
// 	freq: freqCount,
// };

// function updateRemoveButtons(type) {
// 	// If there's only one form of this type, hide the 'remove' button
// 	var formDocument = document.querySelector(`.${type}-form`);
// 	if (formCount[type] > 0) {
// 		// Update event listeners for the 'remove' buttons
// 		formDocument.querySelectorAll(`.remove-button`).forEach(function (button) {
// 			// First, remove any existing event listener
// 			var newButton = button.cloneNode(true);
// 			button.parentNode.replaceChild(newButton, button);

// 			// Then, add the new event listener
// 			newButton.addEventListener("click", function (event) {
// 				event.target.parentNode.parentNode.remove(); // Note the additional parentNode reference here
// 				formCount[type]--;

// 				// Update the 'remove' buttons again after removing a form
// 				updateRemoveButtons(type);
// 			});
// 		});
// 	}
// }

// function addForm(type) {
// 	// Select the first form of this type to clone
// 	var formToClone = formsToClone[type];

// 	// Create a new form div and replace __prefix__ in its HTML
// 	var newForm = formToClone.cloneNode(true);
// 	newForm.innerHTML = newForm.innerHTML.replace(/__prefix__/g, formCount[type]);

// 	// Increase the form count
// 	formCount[type]++;

// 	// Insert the new form before the '+' button
// 	document.querySelector(`#add-${type}-button`).before(newForm);

// 	// Update the 'remove' buttons after adding a new form
// 	updateRemoveButtons(type);

// 	return newForm;
// }

// ****************************************************************
// FUNCTIONS TO POPULATE THE FORM WITH EXISTING ALGORITHM DATA
// ****************************************************************

// Find the matching object via its feature in a list of objects
function getValue(data, feature) {
	const item = data.find((item) => item.feature === feature);
	return item ? item.value : null;
}

function removeForms(formType) {
	const formset = document.querySelector(`.${formType}-formset`);
	let forms = formset.querySelectorAll(`.${formType}-form`);

	// Keep the first form and remove the rest
	for (let i = 0; i < forms.length; i++) {
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
	if (forms.length === 0) {
		console.log("No forms found, creating a new one");
		var firstForm = addForm(formType);
	} else {
		firstForm = forms[0];
	}
	populateForm(firstForm, data[0]);

	for (let i = 1; i < data.length; i++) {
		let newForm = addForm(formType);
		// if (!newForm) {
		// 	newForm = addForm(formType); // Create a new form if it doesn't exist
		// }
		populateForm(newForm, data[i]);
	}

	const totalFormsInput = formset.querySelector("input[name$=TOTAL_FORMS]");
	totalFormsInput.value = data.length;
}

// function populateFormset(formType, data, populateForm) {
// 	if (!data || data.length === 0) {
// 		console.log("No data for ", formType);
// 		return null;
// 	}

// 	removeForms(formType);

// 	const formset = document.querySelector(`.${formType}-formset`);
// 	let forms = formset.querySelectorAll(`.${formType}-form`);
// 	console.log(formType, forms);
// 	if (forms.length === 0) {
// 		// var firstForm = addForm(formType);
// 		var firstForm = setupFormsetHandlers(formType);
// 		console.log("ff", firstForm);
// 	} else {
// 		firstForm = forms[0];
// 	}
// 	populateForm(firstForm, data[0]);

// 	for (let i = 1; i < data.length; i++) {
// 		// let newForm = addForm(formType);
// 		var newForm = setupFormsetHandlers(formType);
// 		console.log(i, newForm);

// 		// After adding the form, it should be the last one in the formset
// 		// let newF3orm = forms[forms.length - 1];
// 		populateForm(newForm, data[i]);
// 	}

// 	const totalFormsInput = formset.querySelector("input[name$=TOTAL_FORMS]");
// 	totalFormsInput.value = data.length;
// }

function populateFrequencyForm(form, data) {
	const startField = form.querySelector("input[name$=start]");
	const endField = form.querySelector("input[name$=end]");
	const penaltyField = form.querySelector("input[name$=penalty]");

	startField.value = data[0];
	endField.value = data[1];
	penaltyField.value = data[2];
}

function populateVerbForm(form, data) {
	const verbTenseField = form.querySelector("select[name$=verb_tense]");
	const verbStemField = form.querySelector("select[name$=verb_stem]");
	const suffixField = form.querySelector("select[name$=suffix]");
	const penaltyField = form.querySelector("input[name$=penalty]");

	verbTenseField.value =
		getValue(data[0], constants.W_VERB_TENSE) || constants.FIELD_NULL_VALUE;
	verbStemField.value =
		getValue(data[0], constants.W_VERB_STEM) || constants.FIELD_NULL_VALUE;
	suffixField.value =
		getValue(data[0], constants.W_PRONOMINAL_SUFFIX) ||
		constants.FIELD_NULL_VALUE;
	penaltyField.value = data[1];
}

function update(element, value) {
    if (value != null) {
        if (element.type === 'checkbox') {
            element.checked = value;
        } else {
            element.value = value;
        }
    }
}

function populateAlgorithmForm(algorithmConfig) {
	// const algorithmData = algorithmConfig.data;
	update(algorithmNameInput, algorithmConfig.name);
    update(algorithmIdInput, algorithmConfig.id);
    update(stopWordsCheckbox, algorithmConfig.include_stop_words);
    update(taperDiscountInput, algorithmConfig.taper_discount);
    update(properNounInput, algorithmConfig.proper_noun_divisor);
    update(qereInput, algorithmConfig.qere_penalty);
    update(verbStemCheckbox, algorithmConfig.penalize_by_verb_stem);
    update(penaltyDivisorSelect, algorithmConfig.total_penalty_divisor);

	populateFormset(
		frequencyClassName,
		algorithmConfig.frequencies,
		populateFrequencyForm,
	);
	populateFormset(verbClassName, algorithmConfig.verbs, populateVerbForm);

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
	data.verbs = Array.from(verbForms)
		.map((form) => {
			var inputsAndSelects = form.querySelectorAll("input, select"); // include select
			// TODO check for not null or N/A ? Or handle on the backend?
			var verb_tense = {
				feature: constants.W_VERB_TENSE,
				rule: constants.EQUALS,
				value: inputsAndSelects[0].value,
			};
			var verb_stem = {
				feature: constants.W_VERB_STEM,
				rule: constants.EQUALS,
				value: inputsAndSelects[1].value,
			};
			var suffix = {
				feature: constants.W_PRONOMINAL_SUFFIX,
				rule: constants.EXISTS,
				value: inputsAndSelects[2].value,
			};
			let verb_data = [];
			// Only push items that have been selected by the user.
			[verb_tense, verb_stem, suffix].forEach((item) => {
				if (item.value !== constants.FIELD_NULL_VALUE) {
					verb_data.push(item);
				}
			});
			let penalty = parseFloat(inputsAndSelects[3].value);
			return [verb_data, penalty];
		})
		.filter((value) => value != null && value.length > 1); // filter out empty arrays

	// Get frequency data
	var frequencyForms = document.querySelectorAll(`.${frequencyClassName}-form`);
	data.frequencies = Array.from(frequencyForms).map((form) => {
		var inputsAndSelects = form.querySelectorAll("input, select"); // include select
		return [
			parseInt(inputsAndSelects[0].value),
			parseInt(inputsAndSelects[1].value),
			parseFloat(inputsAndSelects[2].value),
		];
	});

	// Set name
	config.name = document.querySelector("#alg-name").value;

	config.data = data;
	return config;
}

function runAlgorithm(config, text) {
	console.log("RUN ALG");
	apis
		.postAlgorithm(config, constants.TASKS.RUN_ALGORITHM, text)
		.then((response) => {
			const textResponse = response.text;
			const score = response.score;
			const penalties = response.penalties;
			const items = textResponse.sort(function (a, b) {
				return a.score - b.score;
			});

			let text = "";
			for (let item of items) {
				text =
					text +
					item.id +
					`<span class='text-red-500'> ${item.score}</span><br>`; // + JSON.stringify(item.penalties, undefined, 2) + '<br>';
			}
			$("#alg").html(text);
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
	dismissAlgorithmForm();
}

function saveAlgorithm(config) {
	console.log("SAVE ALG");
	apis
		.postAlgorithm(config, constants.TASKS.SAVE)
		.then((response) => {
			// TODO Also add to the dropdown if applicable.
			const savedConfig = response.configuration;
			currentConfiguration = savedConfig;
			utils.showToast(
				`Algorithm ${savedConfig.name} saved successfully.`,
				3000,
			);
			console.log(response);
		})
		.catch((error) => {
			console.error(error);
		});
}

function setupFormSubmission() {
	// TODO Will need a forAll here if multiple.
	document
		.querySelector(".algorithm-form")
		.addEventListener("submit", function (event) {
			const submitType = document.querySelector("input[name$=submit-action]");
			event.preventDefault(); // prevent the form from submitting

			// let isValidForm = true;
			// document
			// 	.querySelectorAll('input[type="number"]')
			// 	.forEach(function (input) {
			// 		if (input.value.trim() === "") {
			// 			console.log(input);
			// 			isValidForm = false;
			// 		}
			// 	});
			// if (!isValidForm) {
			// 	alert("Please fill all the fields.");
			// } else {
			// const config = getConfiguration();
			if (event.submitter.id === "save") {
				// saveAlgorithm(config);
				// formData.submission = "SAVE";
				submitType.value = "SAVE";
				apis.submitForm(
					new FormData(event.target),
					constants.GET_ALGORITHM_FORM_API,
				);
				// apis.getAlgorithmForm();
				// Handle text data
			} else if (event.submitter.id === "save-copy") {
				// config.id = null;
				// saveAlgorithm(config, true);
				// Handle text data
				submitType.value = "COPY";
				apis.submitForm(
					new FormData(event.target),
					constants.GET_ALGORITHM_FORM_API,
				);
			} else {
				// If a page with rendered text, set those texts to be the passages.
				var passageIds = null;
				if (window.location.href.includes(constants.COMPARE_PAGE)) {
					const referenceButtons =
						document.querySelectorAll(".reference-button");
					passageIds = Array.from(referenceButtons)
						.map((button) => {
							return $(button).attr("data-id");
						})
						.filter((id) => id != null);
				} else {
					let passageId = $(".psg").attr("data-id");
					console.log(passageId);
					console.log($(".psg"));
					if (passageId) {
						passageIds = [passageId];
					}
				}
				if (!passageIds || passageIds.length === 0) {
					alert("Please select a passage.");
				}
				const text = {
					passage_ids: passageIds,
				};
				runAlgorithm(config, text);
			}
			currentConfiguration = {};
			// }
		});
}

// ****************************************************************
// FUNCTIONS TO TOGGLE THE FORM'S DISPLAY
// ****************************************************************

// Assuming you have more than one button, we add the event listener to each button
function setupToggleFormButtons() {
	let form = document.querySelector(".algorithm-form");
	let buttons = document.querySelectorAll(".toggle-form-button");
	// E.g., on the Algorithms screen.
	if (buttons.length === 0) {
		form.style.display = "inline-flex";
		form.classList.remove("absolute");
		form.querySelector(".dismiss-btn").style.display = "none";
	} else {
		buttons.forEach((button) => {
			button.addEventListener("click", function (e) {
				// To compensate for tailwind classes not affecting inline style.
				let display = window.getComputedStyle(form).display;
				if (display === "none") {
					let rect = e.target.getBoundingClientRect();
					form.style.top =
						rect.top + window.scrollY + button.offsetHeight + "px";
					form.style.left = rect.left + window.scrollX + "px";
					form.style.display = "inline-flex";
				} else {
					form.style.display = "none";
				}
			});
		});
	}
}

function dismissAlgorithmForm() {
	document.querySelector(".algorithm-form").style.display = "none";
}

function resetAlgorithmForm() {
	formsetClasses.forEach(removeForms);
	savedAlgorithms.forEach((dropdown) => {
		dropdown.value = constants.FIELD_NULL_VALUE;
	});
	// Reset text inputs
    algorithmNameInput.value = defaultValues.algorithmName; // defaultValues should store the default values
    algorithmIdInput.value = defaultValues.algorithmId;

    // Reset checkboxes
    stopWordsCheckbox.checked = defaultValues.includeStopWords;
    verbStemCheckbox.checked = defaultValues.penalizeByVerbStem;

    // Reset number inputs
    taperDiscountInput.value = defaultValues.taperDiscount;
    properNounInput.value = defaultValues.properNounDivisor;
    qereInput.value = defaultValues.qerePenalty;

    // Reset select/dropdown
    penaltyDivisorSelect.value = defaultValues.totalPenaltyDivisor;
}

// ****************************************************************
// INITIALIZE FUNCTIONS
// ****************************************************************

events.subscribe(constants.ALG_FORM_LOADED_EVENT, function () {
	setupToggleFormButtons();

	formsetClasses.forEach(setupFormsetHandlers);
	savedAlgorithms = $(document).find(".saved-algorithms select").toArray();
	algorithmNameInput = document.querySelector("input[name$=name]");
	algorithmIdInput = document.querySelector("input[name$=algorithm-id]");
	stopWordsCheckbox = document.querySelector("input[name$=include_stop_words]");
	taperDiscountInput = document.querySelector("input[name$=taper_discount]");
	properNounInput = document.querySelector("input[name$=proper_noun_divisor]");
	qereInput = document.querySelector("input[name$=qere_penalty]");
	verbStemCheckbox = document.querySelector("input[name$=penalize_by_verb_stem]");
	penaltyDivisorSelect = document.querySelector("select[name$=total_penalty_divisor]");

	savedAlgorithms.forEach((dropdown) => {
		dropdown.addEventListener("change", (event) => {
			const selectedOption = event.target.selectedOptions[0];
			const algorithmConfig = utils.contextToJson(
				selectedOption.dataset.definition,
			);
			populateAlgorithmForm(algorithmConfig);
		});
	});

	setupFormSubmission();
});

window.populateAlgorithmForm = populateAlgorithmForm;
window.resetAlgorithmForm = resetAlgorithmForm;
window.dismissAlgorithmForm = dismissAlgorithmForm;
