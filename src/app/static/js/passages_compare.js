import * as constants from "./utils/constants.js";
import * as utils from "./utils/utils.js";
import * as events from "./utils/events.js";
import apis from "./utils/api.js";
import { CompareListsMode } from "./widgets/passage_lists.js";
import { CompareWidgetsMode } from "./widgets/passage_widgets.js";
import { colorWords } from "./widgets/hebrew_text.js";

const MODE = {
	LISTS: "Lists",
	WIDGETS: "Widgets",
};

const compareModeBtn = document.querySelector("#compare-mode-btn");
const compareModeTitle = document.querySelector("#compare-mode-title");

class ComparePassages {
	constructor() {
		this.currentMode = MODE.LISTS;
		this.compareListsContent = new CompareListsMode();
		this.compareWidgetsContent = new CompareWidgetsMode();
	}

	init() {
		this.compareListsContent.init();
		this.compareWidgetsContent.init();

		if (this.currentMode === MODE.LISTS) {
			if (this.compareWidgetsContent.passageWidgets().length < 2) {
				this.compareListsContent.show();
			} else {
				this.updateCompareMode();
			}
		} else {
			this.compareWidgetsContent.show();
		}

		this.updateButtonAndHeader();

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
			// color words when switching to widget view.
			colorWords();
			compareModeBtn.textContent = `Switch to Lists`;
			compareModeTitle.textContent = "Compare Features: Passage Text Widgets";
		}
	}
}

const comparePassages = new ComparePassages();

$(window).on("load", (event) => {
	comparePassages.init();
});

events.subscribe(events.TEXT_SUBMITTED_BY_PASSAGE_SELECTOR_EVENT, (event) => {
	comparePassages.compareWidgetsContent.fetchText(
		event.detail.passageId,
		event.detail.div,
	);
});
