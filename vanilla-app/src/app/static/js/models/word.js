import * as constants from "../utils/constants.js";
import { COLORS } from "../utils/theme.js";
import * as utils from "../utils/utils.js";

const summaryDivId = "#hovered-word-widget";
export const selectedDivId = "#selected-word-widget";

export class Word {
	/**
	 * @param {HTMLElement} [wordSpan]
	 */
	constructor(wordSpan) {
		const wordData = $(wordSpan).data("definition");
		// Linguistic Attributes
		this.id = wordData[constants.W_ID];
		this.book = wordData[constants.W_BOOK];
		this.chapter = wordData[constants.W_CHAPTER];
		this.verse = wordData[constants.W_VERSE];
		this.text = wordData[constants.W_TEXT];
		this.trailer = wordData[constants.W_TRAILER];
		this.speech = wordData[constants.W_SPEECH];
		this.person = wordData[constants.W_PERSON];
		this.gender = wordData[constants.W_GENDER];
		this.number = wordData[constants.W_NUMBER];
		this.verbTense = wordData[constants.W_VERB_TENSE];
		this.verbStem = wordData[constants.W_VERB_STEM];
		this.suffixPerson = wordData[constants.W_SUFFIX_PERSON];
		this.suffixGender = wordData[constants.W_SUFFIX_GENDER];
		this.suffixNumber = wordData[constants.W_SUFFIX_NUMBER];
		this.gloss = wordData[constants.W_GLOSS];
		this.lexFrequency = wordData[constants.W_LEX_FREQUENCY];
		this.occFrequency = wordData[constants.W_OCC_FREQUENCY];
		this.penalty = wordData[constants.W_PENALTY];
		this.lexId = wordData[constants.W_LEX_ID];
		this.lex = wordData[constants.W_LEX];
		this.nameType = wordData[constants.W_NAME_TYPE];
		this.lexSet = wordData[constants.W_LEX_SET];
		this.state = wordData[constants.W_STATE];
		this.language = wordData[constants.W_LANGUAGE];
		this.qere = wordData[constants.W_QERE];
		this.ketiv = wordData[constants.W_KETIV];
		this.nominalEnding = wordData[constants.W_NOMINAL_ENDING];
		this.preformative = wordData[constants.W_PREFORMATIVE];
		this.pronominalSuffix = wordData[constants.W_PRONOMINAL_SUFFIX];
		this.univalentFinal = wordData[constants.W_UNIVALENT_FINAL];
		this.verbalEnding = wordData[constants.W_VERBAL_ENDING];
		this.rootFormation = wordData[constants.W_ROOT_FORMATION];

		// General Attributes
		this.wordSpan = wordSpan;
		this.isSelected = false;
		this.highlightColor = "";
		this.timer = null;

		// init functions
		this.setHandlers();
	}

	/**
	 * @returns {void}
	 */
	setHandlers() {
		$(this.wordSpan).on("click", () => {
			this.toggleSelected();
		});
		$(this.wordSpan).on("mouseover", () => {
			this.timer = setTimeout(() => {
				this.showSummary();
			}, 750);
		});
		$(this.wordSpan).on("mouseout", () => {
			// Unhighlight the lexemes that were highlighted.
			this.highlightMatchingLexemes(true);
			clearTimeout(this.timer);
			$(summaryDivId).hide();
		});
	}

	/**
	 * @returns {boolean}
	 */
	isProperNoun() {
		return this.speech == "nmpr" || this.lexSet == "gntl";
	}

	// /**
	//  * @returns {JQuery<HTMLElement>}
	//  */
	// wordSpan() {
	// 	return $(`#word-${this.id}`);
	// }

	/**
	 * @param {String} [attribute]
	 * @param {String} [color]
	 */
	setColor(attribute, color) {
		$(this.wordSpan).css(attribute, color);
	}

	/**
	 * @param {Boolean} [markProperNouns]
	 * @param {Number} [penalty]
	 */
	setDefaultTextColor(markProperNouns = true, penalty = null) {
		penalty = penalty || this.penalty;
		let attr = "color";
		if (markProperNouns && this.isProperNoun()) {
			this.setColor(attr, COLORS.PROPER_NOUN);
		} else {
			let color = utils.getGradientColor(penalty);
			this.setColor(attr, color);
		}
	}

	/**
	 * @param {String} [color]
	 */
	highlight(color = null) {
		color = color !== null ? color : this.highlightColor;
		this.setColor("background-color", color);
	}

	/**
	 * @param {String} [color]
	 */
	setConditionHighlight(color) {
		this.highlightColor = color;
		this.highlight();
	}

	/**
	 * @param {Boolean} [resetHighlights]
	 */
	highlightMatchingLexemes(resetHighlights = false) {
		utils.getWords().forEach((word) => {
			if (this.lexId === word.lexId && !resetHighlights) {
				word.highlight(COLORS.HIGHLIGHT);
			} else {
				word.highlight();
			}
		});
	}

	toggleSelected() {
		if (this.isSelected) {
			this.unselect();
		} else {
			let currentlySelected = utils.getWords().find((w) => w.isSelected);
			if (currentlySelected) {
				currentlySelected.unselect();
			}
			this.select();
			this.showAttributes();
		}
	}

	unselect() {
		this.isSelected = false;
		$(this.wordSpan).css({ fontWeight: "normal" });
		$(selectedDivId).hide();
	}

	select() {
		this.isSelected = true;
		$(this.wordSpan).css({ fontWeight: "bold" });
	}

	showAttributes() {
		const excludedAttributes = [
			"isSelected",
			"wordSpan",
			"timer",
			"highlightColor",
		];

		const attributes = Object.entries(this)
			.filter(([key]) => !excludedAttributes.includes(key)) // Exclude certain attributes
			.sort(([keyA], [keyB]) => keyA.localeCompare(keyB)) // Sort by key
			.map(([key, value]) => {
				if (value) {
					// Check if value is not null, empty string, etc.
					let displayValue = value
						.toString()
						.replace("<", "&lt;")
						.replace(">", "&gt;");
					return `<b>${key}:</b> ${displayValue}`;
				}
				return null;
			})
			.filter((attr) => attr !== null)
			.join("<br>");

		// Update the HTML of the attributes div
		$("#word-attributes").html(attributes);
		$(selectedDivId).show();
		$(`${selectedDivId} .dismiss-btn`)
			.off()
			.on("click", () => {
				this.toggleSelected();
			});
	}

	/**
	 * Description placeholder
	 * @date 1/19/2024 - 5:49:52 PM
	 */
	async showSummary() {
		this.highlightMatchingLexemes();

		$("#text").text(this.text);
		$("#english").text(this.gloss);
		$("#speech").text(this.speech);

		const morphologyParsing = [
			this.person,
			this.number,
			this.gender,
			this.verbStem,
			this.verbTense,
		]
			.filter((item) => item !== null && item !== "")
			.join(", ");
		$("#morph").text(morphologyParsing);

		const book = await utils.getBookByNumber(this.book);
		$("#ref").text(`${book.name} ${this.chapter}:${this.verse}`);

		$("#lex-freq").text(this.lexFrequency + " occ");
		$(summaryDivId).show();
	}
}
