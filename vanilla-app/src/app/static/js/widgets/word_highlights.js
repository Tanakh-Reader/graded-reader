import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";
import { Word } from "../models/word.js";
import { HIGHLIGHT_COLORS } from "../utils/theme.js";

// Get a reference to the dropdown menu
const highlightsDropdownMenu = document.getElementById(
	"word-highlights-dropdown-menu",
);

class Condition {
	constructor({ checkboxId, title, color, conditionFunc }) {
		this.checkboxId = checkboxId;
		this.title = title;
		this.color = color;
		this.conditionFunc = conditionFunc;
		// this.actionFunc = actionFunc;
		this.menuItem = null;
	}

	/**
	 * @param {Word} [word]
	 */
	actionFunc(word) {
		setTimeout(() => {
			if (this.getCheckbox(true)) {
				word.setConditionHighlight(this.color);
			} else {
				word.setConditionHighlight("");
			}
		}, 0);
	}

	fire() {
		utils.getWords().forEach((word) => {
			if (this.conditionFunc(word)) {
				this.actionFunc(word);
			}
		});
	}

	attach() {
		this.getCheckbox().on("change", () => {
			this.fire();
		});
	}

	getCheckbox(getIsChecked = null) {
		let checkBox = $("#checkbox-" + this.checkboxId);
		return getIsChecked ? checkBox.prop("checked") : checkBox;
	}

	// Method to check if the condition is met by any word
	isMetByAnyWord() {
		return utils.getWords().some((word) => this.conditionFunc(word));
	}
}

const conditions = [
	new Condition({
		checkboxId: "verb-suffix",
		title: "Verb + suffix",
		color: HIGHLIGHT_COLORS.LIGHT_CORAL,
		conditionFunc: (/** @type {Word} */ word) =>
			word.speech === "verb" && has_data(word.pronominalSuffix),
		// For some reason this wasn't functioning correctly without the timout.
		// actionFunc: function (/** @type {Word} */ word, isChecked) {
		// 		word.style.backgroundColor = isChecked ? this.color : "";
		// },
	}),
	new Condition({
		checkboxId: "non-verb-suffix",
		title: "Other + suffix",
		color: HIGHLIGHT_COLORS.THISTLE,
		conditionFunc: (/** @type {Word} */ word) =>
			word.speech !== "verb" && has_data(word.pronominalSuffix),
	}),
	new Condition({
		checkboxId: "qere",
		title: "Qere / Ketiv",
		color: HIGHLIGHT_COLORS.POWDER_BLUE,
		conditionFunc: (/** @type {Word} */ word) => has_data(word.qere),
	}),
	new Condition({
		checkboxId: "construct-noun",
		title: "Construct noun",
		color: HIGHLIGHT_COLORS.LIGHT_SALMON,
		conditionFunc: (/** @type {Word} */ word) => word.state === "c",
	}),
];

function has_data(data) {
	return !["", null].includes(data);
}

function refreshDropdown() {
	// Update the visibility of the dropdown items
	conditions.forEach((condition) => {
		// Check if the condition is met by any word
		if (condition.isMetByAnyWord()) {
			$(condition.menuItem).show();
		} else {
			$(condition.menuItem).hide();
		}
	});

	// Run all conditions
	// conditions.forEach(condition => condition.fire());
}

// Populate the dropdown items
conditions.forEach((condition) => {
	// Only add items from the current page.
	const listItem = document.createElement("li");
	listItem.className = "rounded py-2 px-4 block whitespace-no-wrap title-sm";

	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.id = `checkbox-${condition.checkboxId}`;
	checkbox.className = "mr-2";

	listItem.appendChild(checkbox);
	listItem.appendChild(document.createTextNode(condition.title));

	listItem.style.background = condition.color;
	listItem.style.display = "none"; // initially hidden
	condition.menuItem = listItem; // attach the reference to the Condition object

	highlightsDropdownMenu.appendChild(listItem);
	condition.attach();
});

$(window).on("load", () => {
	// Prevent the box from closing when checkbox is clicked
	$(highlightsDropdownMenu).on("click", (event) => {
		event.stopPropagation();
	});
	$("#highlights-btn").on("click", (event) => {
		highlightsDropdownMenu.classList.toggle("hidden");
	});
	refreshDropdown();
});

events.subscribe(constants.TEXT_FETCHED_COMPLETED_EVENT, () => {
	// Give time for the words to be fetched.
	setTimeout(() => {
		refreshDropdown();
		conditions.forEach((condition) => condition.fire());
	}, 500);
});
