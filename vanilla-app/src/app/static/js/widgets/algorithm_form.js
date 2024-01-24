import * as constants from "../utils/constants.js";
import * as utils from "../utils/utils.js";
import apis from "../utils/api.js";
import * as events from "../utils/events.js";
import { Algorithm } from "../models/algorithm.js";

// Object to store the initial clones of each formset
const formsetClasses = ["frequency", "verb", "noun", "clause", "phrase"];
const defaultValues = {
	algorithmName: "",
	algorithmId: "",
	includeStopWords: false,
	penalizeByVerbStem: true,
	taperDiscount: 1,
	properNounDivisor: 2,
	qerePenalty: 7,
	totalPenaltyDivisor: "WORDS",
};

class AlgorithmFormManager {
	constructor() {
		this.formsetClones = {};
		utils.getAlgorithms();
		apis.getAlgorithmForm();
	}

	init() {
		this.form = $(".algorithm-form");
		this.savedAlgorithmSelectors = this.form.find(".saved-algorithms select");
		this.algorithmNameInput = this.form.find("input[name$=name]");
		this.algorithmIdInput = this.form.find("input[name$='algorithm-id']");
		this.stopWordsCheckbox = this.form.find(
			"input[name$='include_stop_words']",
		);
		this.taperDiscountInput = this.form.find("input[name$='taper_discount']");
		this.properNounInput = this.form.find("input[name$='proper_noun_divisor']");
		this.qereInput = this.form.find("input[name$='qere_penalty']");
		this.verbStemCheckbox = this.form.find(
			"input[name$='penalize_by_verb_stem']",
		);
		this.penaltyDivisorSelect = this.form.find(
			"select[name$='total_penalty_divisor']",
		);
		this.submitType = $("input[name$=submit-action]");

		formsetClasses.forEach(this.setupFormsetHandlers.bind(this));
		this.setListeners();
	}

	currentAlgorithm(div = null) {
		let currentAlgId = div ? $(div).val() : $("#dropdown2").val();
		let currentAlgorithm = currentAlgId
			? utils.getAlgorithmById(currentAlgId)
			: null;
		if (currentAlgorithm) {
			return currentAlgorithm;
		} else {
			// A rank template, which has not id and is not in the DB.
			// Make sure `to_json` is applied to the data in the html template.
			let currentConfig = $(`#${div.id} :selected`).data("definition");
			// Building from scratch -- no algorithm selected.
			if (!currentConfig) {
				return null;
			}
			currentConfig.id = null;
			return new Algorithm(currentConfig);
		}
	}

	setListeners() {
		// Saved algorithm configuration dropdowns
		this.savedAlgorithmSelectors.on("change", (event) => {
			let algorithm = this.currentAlgorithm(event.target);
			this.populateAlgorithmForm(algorithm);
		});

		// Buttons to dismiss and reset the form
		$("#algorithm-form-dismiss-btn").on("click", this.hide.bind(this));
		$("#algorithm-form-reset-btn").on(
			"click",
			this.resetAlgorithmForm.bind(this),
		);

		// All buttons used to open the algorithm in a page.
		$(".toggle-form-button").on("click", (event) => {
			if (this.form.css("display") == "none") {
				this.show(event.currentTarget);
				this.checkEditAlgorithm($(event.currentTarget));
			} else {
				this.hide();
			}
		});

		// Submission of the form
		// The JQuery .on() wasn't finding the submitter for some reason.
		this.form[0].addEventListener("submit", (event) => {
			this.submit(event);
		});
	}

	hide() {
		this.form.hide();
	}

	/**
	 * Button clicked to open the algorithm
	 *
	 * @param {HTMLElement} [button]
	 */
	show(button) {
		this.form.css("display", "inline-flex");
		let rect = button.getBoundingClientRect();
		this.form[0].style.top =
			rect.top + window.scrollY + button.offsetHeight + "px";

		// Calculate the horizontal center position of the button
		let buttonCenter = rect.left + button.offsetWidth / 2;

		// Calculate the width of the form
		let formWidth = this.form[0].offsetWidth;

		if (buttonCenter > (window.innerWidth + 20) / 2) {
			// Button is more than halfway to the right of the screen
			// Position form to the left of the button
			this.form[0].style.left = rect.left - formWidth + "px";
		} else {
			// Button is less than halfway to the right of the screen
			// Position form to the right of the button
			this.form[0].style.left = rect.left + button.offsetWidth + "px";
		}
	}

	getFormset(formTitle) {
		return $(`.${formTitle}-formset`);
	}

	getFormsetItem(formTitle) {
		return $(`.${formTitle}-form`);
	}

	getTotalFormsInput(formTitle) {
		return $(`#id_${formTitle}-TOTAL_FORMS`);
	}

	// Function to update the names and IDs of form inputs to maintain proper indexing
	updateFormIndices(formTitle) {
		// Iterate over each form and update the index of each input
		this.getFormsetItem(formTitle).each((i, form) => {
			form.querySelectorAll("input, select").forEach((input) => {
				// Replace the form index in the name attribute
				const name = input.name.replace(/-\d+-/, `-${i}-`);
				input.name = name;
				input.id = `id_${name}`; // Update the ID to match the name
			});
		});
	}

	// Function to set up event listeners for adding and removing forms
	setupFormsetHandlers(formTitle) {
		// Add new form to the formset when the add button is clicked
		$(`#add-${formTitle}-form`).on("click", () => {
			this.addFormsetItem(formTitle);
		});

		// Clone the initial form and store it with its listeners.
		this.formsetClones[formTitle] = this.getFormsetItem(formTitle).clone(true);

		// Begin with no forms displayed, until added by the user.
		this.removeFormsetItems(formTitle);
	}

	setDeleteFormsetItemListeners(formTitle) {
		// Remove a form from the formset when the remove button is clicked
		this.getFormsetItem(formTitle).each((i, item) => {
			$(item)
				.find(".remove-form-button")
				.on("click", () => {
					// Remove the form that contains the clicked remove button
					item.remove();
					// Update the total form count in the management form
					this.getTotalFormsInput().val(this.getFormsetItem(formTitle).length);
					// Update indices to reflect the form removal
					this.updateFormIndices(formTitle);
				});
		});
	}

	addFormsetItem(formTitle) {
		// Get the current form index
		const formsetItemIndex = this.getTotalFormsInput(formTitle).last();
		// Clone the form
		const newFormsetItem = this.formsetClones[formTitle].clone(true)[0];
		newFormsetItem.innerHTML = newFormsetItem.innerHTML.replace(
			/__prefix__/g,
			formsetItemIndex,
		);
		this.getFormset(formTitle).append(newFormsetItem);
		// Increment the form count index.
		this.getTotalFormsInput().val(parseInt(formsetItemIndex) + 1);
		this.updateFormIndices(formTitle);

		// Set listener to remover a form from the formset when the remove button is clicked
		$(newFormsetItem)
			.find(".remove-form-button")
			.on("click", () => {
				// Remove the form that contains the clicked remove button
				newFormsetItem.remove();
				// Update the total form count in the management form
				this.getTotalFormsInput().val(this.getFormsetItem(formTitle).length);
				// Update indices to reflect the form removal
				this.updateFormIndices(formTitle);
			});

		return newFormsetItem;
	}

	/**
	 * Remove all the items from a formset
	 * @param {string} [formTitle]
	 */
	removeFormsetItems(formTitle) {
		// E.g., if 1, it will keep the first formset item.
		const keepCount = 0;
		this.getFormsetItem(formTitle).each((i, item) => {
			if (i >= keepCount) {
				item.remove();
			}
		});
	}

	// ****************************************************************
	// FUNCTIONS TO POPULATE THE FORM WITH EXISTING ALGORITHM DATA
	// ****************************************************************

	/**
	 * Find the matching object via its feature in a list of objects
	 * @param {Object} [data]
	 * @param {any} [feature]
	 */
	getValue(data, feature) {
		const item = data.find((item) => item.feature === feature);
		return item ? item.value : constants.FIELD_NULL_VALUE;
	}

	/**
	 * Populate a formset with the provided data and populate method.
	 * @param {string} [formTitle]
	 * @param {array} [data]
	 * @param {function} [populateForm]
	 */
	populateFormset(formTitle, data, populateForm) {
		this.removeFormsetItems(formTitle);

		if (!data || data.length === 0) {
			console.log("No data for ", formTitle);
			return null;
		}

		if (this.getFormsetItem(formTitle).length === 0) {
			var firstForm = this.addFormsetItem(formTitle);
		} else {
			firstForm = this.getFormsetItem(formTitle).first();
		}
		populateForm(firstForm, data[0]);

		for (let i = 1; i < data.length; i++) {
			let newForm = this.addFormsetItem(formTitle);
			populateForm(newForm, data[i]);
		}

		const totalFormsInput = this.getFormset(formTitle).find(
			"input[name$=TOTAL_FORMS]",
		);
		totalFormsInput.val(data.length);
	}

	/**
	 * @param {HTMLElement} [form]
	 * @param {array} [data]
	 */
	populateFrequencyForm(form, data) {
		const startField = form.querySelector("input[name$=start]");
		const endField = form.querySelector("input[name$=end]");
		const penaltyField = form.querySelector("input[name$=penalty]");

		startField.value = data[0];
		endField.value = data[1];
		penaltyField.value = data[2];
	}

	/**
	 * @param {HTMLElement} [form]
	 * @param {array} [data]
	 */
	populateVerbForm(form, data) {
		const verbTenseField = form.querySelector("select[name$=verb_tense]");
		const verbStemField = form.querySelector("select[name$=verb_stem]");
		const suffixField = form.querySelector("select[name$=suffix]");
		const penaltyField = form.querySelector("input[name$=penalty]");

		verbTenseField.value = this.getValue(data[0], constants.W_VERB_TENSE);
		verbStemField.value = this.getValue(data[0], constants.W_VERB_STEM);
		suffixField.value = this.getValue(data[0], constants.W_PRONOMINAL_SUFFIX);
		penaltyField.value = data[1];
	}

	/**
	 * @param {HTMLElement} [form]
	 * @param {array} [data]
	 */
	populateConstructNounForm(form, data) {
		const chainLengthField = form.querySelector("input[name$=chain_length]");
		const penaltyField = form.querySelector("input[name$=penalty]");

		chainLengthField.value = data[0];
		penaltyField.value = data[1];
	}

	/**
	 * @param {HTMLElement} [form]
	 * @param {array} [data]
	 */
	populateClauseForm(form, data) {
		const clauseTypeField = form.querySelector("select[name$=clause_type]");
		const penaltyField = form.querySelector("input[name$=penalty]");

		clauseTypeField.value = data[0];
		penaltyField.value = data[1];
	}

	/**
	 * @param {HTMLElement} [form]
	 * @param {array} [data]
	 */
	populatePhraseForm(form, data) {
		const phraseTypeField = form.querySelector("select[name$=phrase_function]");
		const penaltyField = form.querySelector("input[name$=penalty]");

		phraseTypeField.value = data[0];
		penaltyField.value = data[1];
	}

	/**
	 * @param {HTMLElement} [element]
	 * @param {any} [value]
	 */
	update(element, value) {
		if (value != null) {
			if (element.type === "checkbox") {
				element.checked = value;
			} else {
				element.value = value;
			}
		}
	}

	/**
	 * Given an algorithm, populate the form with all of its data.
	//  * @param {Algorithm} [_algorithm]
	 */
	populateAlgorithmForm(_algorithm = null) {
		let algorithm = _algorithm || this.currentAlgorithm();
		console.log(algorithm);
		this.update(this.algorithmNameInput[0], algorithm.name);
		this.update(this.algorithmIdInput[0], algorithm.id);
		this.update(this.stopWordsCheckbox[0], algorithm.includeStopWords);
		this.update(this.taperDiscountInput[0], algorithm.taperDiscount);
		this.update(this.properNounInput[0], algorithm.properNounDivisor);
		this.update(this.qereInput[0], algorithm.qerePenalty);
		this.update(this.verbStemCheckbox[0], algorithm.penalizeByVerbStem);
		this.update(this.penaltyDivisorSelect[0], algorithm.totalPenaltyDivisor);

		this.populateFormset(
			"frequency",
			algorithm.frequencies,
			this.populateFrequencyForm.bind(this),
		);
		this.populateFormset(
			"verb",
			algorithm.verbs,
			this.populateVerbForm.bind(this),
		);
		this.populateFormset(
			"noun",
			algorithm.constructNouns,
			this.populateConstructNounForm.bind(this),
		);
		this.populateFormset(
			"clause",
			algorithm.clauses,
			this.populateClauseForm.bind(this),
		);

		this.populateFormset(
			"phrase",
			algorithm.phrases,
			this.populatePhraseForm.bind(this),
		);
	}

	// ****************************************************************
	// FUNCTIONS TO SUBMIT THE FORM
	// ****************************************************************

	/**
	 * Submit the form and call the relevant api.
	 * @param {SubmitEvent} [event]
	 */
	submit(event) {
		event.preventDefault(); // prevent the form from submitting
		// let currentAlg = this.currentAlgorithm();
		if (event.submitter.id === "algorithm-form-run") {
			var x = 0;
		} else if (event.submitter.id === "algorithm-form-save") {
			this.save();
		} else if (event.submitter.id === "algorithm-form-copy") {
			this.save(true);
		}
	}

	save(asCopy = false) {
		let submitType = asCopy
			? constants.ALGORITHM_TASKS.COPY
			: constants.ALGORITHM_TASKS.SAVE;
		this.submitType.val(submitType);

		apis
			.postAlgorithm(new FormData(this.form[0]))
			.then((response) => {
				let algorithm = new Algorithm(response.algorithm);
				utils.updateAlgorithm(algorithm);
				this.updateDropdown(algorithm);

				events.publish(events.ALG_FORM_SUBMITTED_EVENT, {
					action: submitType,
					algorithm: algorithm,
				});

				let action = asCopy ? "copied" : "saved";
				utils.showToast(
					`Algorithm ${algorithm.name} ${action} successfully.`,
					3000,
				);
			})
			.catch((error) => {
				console.error(error);
			});
	}

	updateDropdown(algorithm) {
		// Check if the option already exists
		let matchingItem = $(`#dropdown2 option[value='${algorithm.id}']`);

		// If not, add the new option
		if (matchingItem.length < 1) {
			const option = new Option(algorithm.name, algorithm.id);
			$("#dropdown2").append(option);
		} else {
			// If it exists (e.g., if the name changes)
			matchingItem.text(algorithm.name);
		}
		// Set the new option as selected
		$("#dropdown2").val(algorithm.id);

		// Trigger the 'change' event to handle the selection
		$("#dropdown2").trigger("change");
	}

	// runAlgorithm(config, text) {
	// 	console.log("RUN ALG");
	// 	apis
	// 		.postAlgorithm(config, constants.TASKS.RUN_ALGORITHM, text)
	// 		.then((response) => {
	// 			const textResponse = response.text;
	// 			const score = response.score;
	// 			const penalties = response.penalties;
	// 			const items = textResponse.sort(function (a, b) {
	// 				return a.score - b.score;
	// 			});

	// 			let text = "";
	// 			for (let item of items) {
	// 				text =
	// 					text +
	// 					item.id +
	// 					`<span class='text-red-500'> ${item.score}</span><br>`; // + JSON.stringify(item.penalties, undefined, 2) + '<br>';
	// 			}
	// 			$("#alg").html(text);
	// 			console.log(response);
	// 		})
	// 		.catch((error) => {
	// 			console.error(error);
	// 		});
	// }

	setupFormSubmission() {
		// TODO Will need a forAll here if multiple.
		this.form.on("submit", (event) => {
			if (event.submitter.id === "save") {
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
					let passageId = $(".passage-dropdown-btn").attr("data-id");
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
				this.runAlgorithm(config, text);
			}
			// }
		});
	}

	// ****************************************************************
	// FUNCTIONS TO UPDATE THE FORM'S DISPLAY
	// ****************************************************************

	/**
	 * Check if the button used to open the form is an edit button.
	 * If so, then select the algorithm to edit from the dropdown.
	 * @param {JQuery<HTMLElement>} [button]
	 */
	checkEditAlgorithm(button) {
		if ($(button).hasClass("edit-algorithm")) {
			// This selector will need changed based on the page.
			// This is used on the algorithms page.
			const algorithmConfig = button
				.closest(".algorithm-definition")
				.data("definition");

			$("#dropdown2").val(algorithmConfig.id);

			this.populateAlgorithmForm();
		}
	}

	resetAlgorithmForm() {
		formsetClasses.forEach(this.removeFormsetItems.bind(this));
		// Reset the dropdown values.
		this.savedAlgorithmSelectors.each(function () {
			$(this).val(constants.FIELD_NULL_VALUE);
		});

		// Reset text inputs
		this.algorithmNameInput.val(defaultValues.algorithmName);
		this.algorithmIdInput.val(defaultValues.algorithmId);

		// Reset checkboxes
		this.stopWordsCheckbox.prop("checked", defaultValues.includeStopWords);
		this.verbStemCheckbox.prop("checked", defaultValues.penalizeByVerbStem);

		// Reset number inputs
		this.taperDiscountInput.val(defaultValues.taperDiscount);
		this.properNounInput.val(defaultValues.properNounDivisor);
		this.qereInput.val(defaultValues.qerePenalty);

		// Reset select/dropdown
		this.penaltyDivisorSelect.val(defaultValues.totalPenaltyDivisor);
	}
}

const algorithmFormManager = new AlgorithmFormManager();
events.subscribe(events.ALG_FORM_LOADED_EVENT, function (event) {
	algorithmFormManager.init();
});
