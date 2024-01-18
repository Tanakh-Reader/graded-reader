import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";

let timer = null;

// Cache commonly accessed DOM elements
const wordSummaryDiv = document.getElementById("hovered-word-widget");
const textSpan = document.getElementById("text");
const englishSpan = document.getElementById("english");
const speechSpan = document.getElementById("speech");
const morphSpan = document.getElementById("morph");
const refSpan = document.getElementById("ref");
const lexFreqSpan = document.getElementById("lex-freq");

const highlightColorClass = "bg-yellow-200";

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
		textDiv = div;
	}
	// Color the words
	const words = textDiv.querySelectorAll(".word");
	words.forEach((word) => {
		const wordJSON = utils.contextToJson(word.dataset.dict);
		const penalty = parseFloat(wordJSON[constants.W_PENALTY]);
		// Proper nouns should be grey.
		if (
			wordJSON[constants.W_SPEECH] === "nmpr" ||
			wordJSON[constants.W_LEX_SET] === "gntl"
		) {
			word.style.color = "#A9A9A9";
		} else {
			word.style.color = getGradientColor(penalty);
		}
	});
}

function showWordAttributes(wordSpan) {
	const wordJSON = utils.contextToJson(wordSpan.dataset.dict);

	const alreadySelected = toggleSelectedWord(wordJSON);
	// Don't rebuild the div if we're unselecting the current word.
	if (alreadySelected) {
		return;
	}
	const attributes = Object.entries(wordJSON)
		.sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // sort entries by keys
		.map(([key, value]) => {
			if (value !== null && value !== "" && value !== " ") {
				value = value.toString().replace("<", "").replace(">", "");
				return `<b>${key}:</b> ${value}`;
			}
			return null;
		})
		.filter((attr) => attr !== null)
		.join("<br>");

	// Get the attributes div element and update its content
	const wordAttributesDiv = document.getElementById("word-attributes");
	wordAttributesDiv.innerHTML = attributes;

	// Show the widget div element
	const widgetDiv = document.getElementById("selected-word-widget");
	widgetDiv.style.display = "block";
}

function dismissWordWidget() {
	document.getElementById("selected-word-widget").style.display = "none";
	// Unselect the current word..
	document.querySelector(".selected").classList.remove("selected");
}

// For dismissing word summary data.
function clearTimer() {
	if (timer !== null) {
		clearTimeout(timer);
		timer = null;
	}
	document.querySelectorAll(".word").forEach((word) => {
		word.classList.remove(highlightColorClass);
	});
	wordSummaryDiv.style.display = "none";
}

function highlightAllMatchingLexemes(hoveredWordJSON) {
	document.querySelectorAll(".word").forEach((word) => {
		const wordJSON = utils.contextToJson(word.dataset.dict);
		if (wordJSON[constants.W_LEX_ID] === hoveredWordJSON[constants.W_LEX_ID]) {
			word.classList.add(highlightColorClass);
		}
	});
}

// Show the basic word data (debounced)
function showWordSummary(wordSpan) {
	clearTimer();

	timer = setTimeout(async function () {
		const wordJSON = utils.contextToJson(wordSpan.dataset.dict);
		highlightAllMatchingLexemes(wordJSON);

		textSpan.innerText = wordJSON[constants.W_TEXT];
		englishSpan.innerText = wordJSON[constants.W_GLOSS];
		speechSpan.innerText = wordJSON[constants.W_SPEECH];

		const attributes = [
			wordJSON[constants.W_PERSON],
			wordJSON[constants.W_NUMBER],
			wordJSON[constants.W_GENDER],
			wordJSON[constants.W_VERB_STEM],
			wordJSON[constants.W_VERB_TENSE],
		]
			.filter((item) => item !== null && item !== "")
			.join(", ");
		morphSpan.innerText = attributes;

		const book = await utils.getBookByNumber(wordJSON[constants.W_BOOK]);
		refSpan.innerText = `${book.name} ${wordJSON[constants.W_CHAPTER]}:${
			wordJSON[constants.W_VERSE]
		}`;

		lexFreqSpan.innerText = wordJSON[constants.W_LEX_FREQUENCY] + " occ";

		wordSummaryDiv.style.display = "block";
	}, 750);
}

function toggleSelectedWord(wordJSON) {
	const currentSelection = document.querySelector(".selected");

	if (currentSelection !== null) {
		if (String(currentSelection.id) === String(wordJSON.id)) {
			// check if the clicked word is already selected
			dismissWordWidget();
			return true; // exit the function
		}
		// Remove the selected word when a new word is selected.
		currentSelection.classList.remove("selected");
	}

	// Select the currently clicked on word, if not already selected
	const newSelection = document.getElementById(wordJSON.id);
	newSelection.classList.add("selected");
}

// For Read page
events.subscribe("DOMContentLoaded", (event) => {
	colorWords();
});

// For Words generated from API call
events.subscribe(constants.TEXT_LOADED_EVENT, (event) => {
	colorWords(event.detail);
});
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// TODO : use this code to remove JS from the HTML !!!!
// // Event listeners for each word
// document.querySelectorAll(".word").forEach(word => {
//     word.addEventListener('mouseenter', event => showWordSummary(event.target));
//     word.addEventListener('mouseleave', clearHighlights);
// });

window.showWordAttributes = showWordAttributes;
window.dismissWordWidget = dismissWordWidget;
window.showWordSummary = showWordSummary;
window.clearTimer = clearTimer;
