import * as utils from "../utils/utils.js";
import apis from "../utils/api.js";
import * as events from "../utils/events.js";
import * as constants from "../utils/constants.js";
import { HIGHLIGHT_COLORS } from "../utils/theme.js";

// export class PenaltyData {
// 	constructor(data) {
// 		this.frequencies = {};
//     this.verbs = {};
//     for (const [condition, value] of Object.entries(data.frequencies)) {
//       this.frequencies[condition] = new Category(value)
//     }
// 		for (const [condition, value] of Object.entries(data.verbs)) {
//       this.frequencies[condition] = new Category(value)
//     }
//     for (const [condition, value] of Object.entries(data.nouns)) {
//       this.frequencies[condition] = new Category(value)
//     }
//     for (const [condition, value] of Object.entries(data.clauses)) {
//       this.frequencies[condition] = new Category(value)
//     }
//     console.log(this);
// 		// this.nouns = data.nouns.map(k => Category(k));
// 		// this.clauses = data.clauses.map(k => Category(k));
// 		// this.phrases = data.phrases.map(k => Category(k));
// 	}

// 	check(condition) {
// 		return this.frequencies[condition];
// 	}

// 	apply(condition) {
// 		this.frequencies[condition].wordMatches();
// 	}
// }

export class PenaltyData {
	constructor(data) {
		this.penalties = data.penalties;
		this.frequencies = {};
		console.log(data);
		for (const [condition, value] of Object.entries(data.frequencies)) {
			this.frequencies[condition] = new Category(condition, value);
		}
		for (const [condition, value] of Object.entries(data.verbs)) {
			this.frequencies[condition] = new Category(condition, value);
		}
		for (const [condition, value] of Object.entries(data.nouns)) {
			this.frequencies[condition] = new Category(condition, value);
		}
		for (const [condition, value] of Object.entries(data.clauses)) {
			this.frequencies[condition] = new Category(condition, value);
		}
		for (const [condition, value] of Object.entries(data.phrases)) {
			this.frequencies[condition] = new Category(condition, value);
		}
		for (const [condition, value] of Object.entries(data.constants)) {
			this.frequencies[condition] = new Category(condition, value);
		}
		console.log(this.frequencies);
	}

	/**
	 * @param {String} [condition]
	 * @param {boolean} [removeHighlights]
	 */
	apply(condition, removeHighlights = false) {
		this.unhighlightAll();
		if (!removeHighlights) {
			this.frequencies[condition].highlightWordMatches();
		}
	}

	check(condition) {
		let match = this.frequencies[condition];
		return match && match.words.length > 0;
	}

	unhighlightAll() {
		// Implement logic to remove highlights from all words
		Object.values(this.frequencies).forEach((category) => {
			category.unhighlightWordMatches();
		});
	}
}

export class Category {
	constructor(condition, value) {
		this.name = condition;
		this.words = value.words || value; // for constants;
		this.penalties = value.penalties || [];

		// this.words = this.words.map((w) => utils.getWordById(w))
	}

	highlightWordMatches() {
		this.words.forEach((word, i) => {
			word = utils.getWordById(word);
			if (word) {
				word.setConditionHighlight(HIGHLIGHT_COLORS.PALE_GREEN);
			}
		});
	}

	unhighlightWordMatches() {
		this.words.forEach((word, i) => {
			word = utils.getWordById(word);
			if (word) {
				word.setConditionHighlight("");
			}
		});
	}

	wordColors() {
		this.words.forEach((wordId, i) => {
			let word = document.getElementById(wordId);
			word.style.backgroundColor = "orange";
			word.style.color = utils.getGradientColor(this.penalties[i]);
		});
	}
}
