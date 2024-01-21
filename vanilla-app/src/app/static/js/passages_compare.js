import * as constants from "./utils/constants.js";
import * as utils from "./utils/utils.js";
import * as events from "./utils/events.js";
import * as passageLists from "./passage_lists.js";
import apis from "./utils/api.js";
import { colorWords } from "./widgets/hebrew_text.js";
import { CompareListsMode } from "./passage_lists.js";
import { CompareWidgetsMode } from "./passage_widgets.js";

const MODE = {
	LISTS: "Lists",
	WIDGETS: "Widgets",
};

const defaultMode = MODE.LISTS;
const compareModeBtn = document.querySelector("#compare-mode-btn");
const compareModeTitle = document.querySelector("#compare-mode-title");

class ComparePassages {
	constructor() {
		this.currentMode = defaultMode;
		this.compareListsContent = new CompareListsMode();
		this.compareWidgetsContent = new CompareWidgetsMode();
		this.init();
	}

	init() {
		this.compareListsContent.init();
		this.compareWidgetsContent.init();
		this.updateButtonAndHeader();

		if (
			this.currentMode === MODE.LISTS &&
			this.compareWidgetsContent.passageWidgets().length < 2
		) {
			this.compareListsContent.show();
		} else {
			this.compareWidgetsContent.show();
		}

		$(compareModeBtn).on("click", this.updateCompareMode.bind(this));
	}

	updateCompareMode() {
		this.currentMode =
			this.currentMode === MODE.LISTS ? MODE.WIDGETS : MODE.LISTS;
		this.updateButtonAndHeader();
		if (this.currentMode === MODE.LISTS) {
			this.compareWidgetsContent.hide();
			this.compareListsContent.show();
		} else {
			this.compareListsContent.hide();
			this.compareWidgetsContent.show();
		}
	}

	updateButtonAndHeader() {
		if (this.currentMode === MODE.LISTS) {
			compareModeBtn.textContent = `Switch to Widgets`;
			compareModeTitle.textContent =
				"Compare Algorithms: Passage Penalty Lists";
		} else {
			compareModeBtn.textContent = `Switch to Lists`;
			compareModeTitle.textContent = "Compare Features: Passage Text Widgets";
		}
	}
}

$(window).on("load", (event) => {
	const comparePassages = new ComparePassages();
});

events.subscribe(
	constants.TEXT_SUBMITTED_BY_PASSAGE_SELECTOR_EVENT,
	(event) => {
		getHebrewText(event.detail.passageId, event.detail.div);
	},
);

function getHebrewText(passageId, div) {
	apis
		.getHebrewText(passageId, true)
		.then((response) => {
			$(div).html(response);
			// Dispatch a event for text updates.
			events.publish(constants.TEXT_FETCHED_COMPLETED_EVENT, div);
		})
		.catch((error) => {
			console.error(error);
		});
}
