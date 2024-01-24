import * as constants from "../utils/constants.js";
import * as utils from "../utils/utils.js";
import * as events from "../utils/events.js";
import apis from "../utils/api.js";

const compareWidgetsDiv = $("#compare-widgets-mode")[0];
const widgetsContainer = compareWidgetsDiv.querySelector(
	".comparison-container",
);
const minTextWidgets = 1;
const maxTextWidgets = 4;

export class CompareWidgetsMode {
	init() {
		this.setListeners();
		this.fetchTextWidgets();
	}

	show() {
		$(compareWidgetsDiv).show();
	}

	hide() {
		$(compareWidgetsDiv).hide();
	}

	fetchTextWidgets() {
		this.passageWidgets().each((i, div) => {
			const id = div.getAttribute("data-id");
			this.fetchText(id, div);
		});
	}

	setListeners() {
		this.setAddButtonListeners();
		this.setDeleteButtonListeners();

		events.subscribe(events.PASSAGE_WIDGET_ADDED_EVENT, (event) => {
			this.setDeleteButtonListeners();
		});

		events.subscribe(events.TEXT_FETCHED_COMPLETED_EVENT, (event) => {
			this.setDeleteButtonListeners();
			this.sortPassages();
		});
	}

	setAddButtonListeners() {
		$(compareWidgetsDiv)
			.find(".add-widget")
			.off()
			.on("click", (event) => {
				this.addTextWidget();
				events.publish(events.PASSAGE_WIDGET_ADDED_EVENT);
			});
	}

	setDeleteButtonListeners() {
		$(compareWidgetsDiv)
			.find(".remove-widget")
			.off()
			.on("click", (event) => {
				// Only remove widget if there are more than 1
				if (this.passageWidgets().length > minTextWidgets) {
					event.currentTarget.closest(".passage-widget").remove();
				} else {
					utils.showToast(`Minimum of ${minTextWidgets} text widgets.`, 2000);
				}
			});
		// Remove height constraint -- only used in list view.
		$(compareWidgetsDiv).find(".passage-container").removeClass("max-h-144");
		$(compareWidgetsDiv)
			.find(".overflow-y-scroll")
			.removeClass("overflow-y-scroll");
	}

	passageWidgets() {
		return $(widgetsContainer).find(".passage-widget");
	}

	sortPassages() {
		let passages = Array.from(this.passageWidgets());
		if (passages.length < 2) {
			return;
		}
		passages.sort((a, b) => {
			let penaltyA = parseFloat($(a).find(".passage-penalty").text());
			let penaltyB = parseFloat($(b).find(".passage-penalty").text());
			return penaltyA - penaltyB; // for ascending order, swap penaltyA and penaltyB for descending order
		});

		passages.forEach((passage) => widgetsContainer.appendChild(passage));
	}

	addTextWidget() {
		var passages = this.passageWidgets();
		// Only clone widget if there are less than 4
		if (passages.length < maxTextWidgets) {
			var lastWidget = passages[passages.length - 1];
			var newWidget = lastWidget.cloneNode(true);
			// Append the new widget to the container
			widgetsContainer.appendChild(newWidget);
		} else {
			utils.showToast(`Maximum of ${maxTextWidgets} text widgets.`, 2000);
		}
	}

	/**
	 * @param {any} [passageId]
	 * @param {HTMLElement} [textDiv]
	 */
	fetchText(passageId, textDiv) {
		apis
			.getHebrewText(passageId, true)
			.then((response) => {
				$(textDiv).html(response);
				// Dispatch a event for text updates.
				events.publish(events.TEXT_FETCHED_COMPLETED_EVENT, textDiv);
			})
			.catch((error) => {
				console.error(error);
			});
	}
}
