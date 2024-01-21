import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";
import { selectedDivId } from "../models/word.js";

export function colorWords(div = null, penalties = null) {
	if (penalties) {
		console.log(penalties);
	}
	utils.getWords(div).forEach((word) => {
		const penalty = penalties ? penalties[word.id] : word.penalty;
		word.setDefaultTextColor(true, penalty);
	});
}

$(window).on("load", () => {
	// Hide the selected word div when the dismiss button is clicked
	$(`${selectedDivId} .dismiss-btn`).on("click", () => {
		$(selectedDivId).hide();
	});
	colorWords();
});

// For Words generated from API call
events.subscribe(constants.TEXT_FETCHED_COMPLETED_EVENT, (event) => {
	utils.getWords(event.detail);
	colorWords(event.detail);
});
events.subscribe(constants.PASSAGE_LISTS_TEXT_COMPARISON_EVENT, (event) => {
	console.log(event.detail)
	utils.getWords(document);
	colorWords(event.detail.div, event.detail.penalties);
});
