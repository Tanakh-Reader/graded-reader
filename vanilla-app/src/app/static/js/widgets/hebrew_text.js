import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";
import { selectedDivId } from "../models/word.js";

export function colorWords(div = null, penalties = null) {
	utils.getWords(div).forEach((word) => {
		const penalty = penalties ? penalties[word.id] : word.penalty;
		word.setDefaultTextColor(true, penalty);
	});
}

$(window).on("load", () => {
	colorWords();
});

// For Words generated from API call
events.subscribe(events.TEXT_FETCHED_COMPLETED_EVENT, (event) => {
	// Get the whole documents words loaded into the cache before coloring.
	utils.getWords(document);
	colorWords(event.detail);
});
events.subscribe(events.PASSAGE_LISTS_TEXT_COMPARISON_EVENT, (event) => {
	// Get the whole documents words loaded into the cache before coloring.
	utils.getWords(document);
	colorWords(event.detail.div, event.detail.penalties);
});
