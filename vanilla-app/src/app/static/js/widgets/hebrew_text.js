import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";
import { selectedDivId } from "../models/word.js";

export function colorWords(div = null, penalties = null) {
	utils.getWords(div).forEach((word) => {
		const penalty = penalties ? penalties[word.id] : word.penalty;
		word.setDefaultColor(true, penalty);
	});
}

$(window).on("load", () => {
	// Hide the selected word div when the dismiss button is clicked
	$(`${selectedDivId} .dismiss-btn`).on("click", () => {
		$(selectedDivId).hide();
	});
	utils.getWords();
	colorWords();
});

// For Words generated from API call
events.subscribe(constants.TEXT_LOADED_EVENT, (event) => {
	colorWords(event.detail);
});
