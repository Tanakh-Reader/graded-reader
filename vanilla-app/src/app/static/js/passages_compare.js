import * as constants from "./utils/constants.js";
import * as utils from "./utils/utils.js";
import * as events from "./utils/events.js";
import * as passageLists from "./passage_lists.js"
import apis from "./utils/api.js";
import { colorWords } from "./widgets/hebrew_text.js";

const MODE = {
	LISTS: "Lists",
	WIDGETS: "Widgets",
};

let compareMode = MODE.LISTS;

const compareModeBtn = document.querySelector("#compare-mode");
const compareListsContent = document.querySelector("#compare-lists-mode");
const compareWidgetsContent = document.querySelector("#compare-widgets-mode");

function updateCompareMode(toggle = true) {
	if (compareMode === MODE.WIDGETS) {
		compareMode = MODE.LISTS;
		// compareModeBtn.style.backgroundColor = "red";
	} else {
		compareMode = MODE.WIDGETS;
	}
	compareModeBtn.textContent = compareMode;
	if (toggle) {
		console.log("GETTING WORDS");
		colorWords(document);
		compareListsContent.classList.toggle("hidden");
		compareWidgetsContent.classList.toggle("hidden");
	}
}

function submitPassage(passageItem) {
	const passageId = $(passageItem).data("id");
	// Update the Hebrew passage text.
	const hebrewTextDiv = $(currentButton).closest(".passage-widget");
	// .find(".passage-widget")[0];
	getHebrewText(passageId, hebrewTextDiv);
	// hebrewTextDiv.parentElement.querySelector(".passage-penalty").textContent =
	// $(passageItem).data("penalty");
}

export function getHebrewText(passageId, div) {
	apis
		.getHebrewText(passageId, true)
		.then((response) => {
			$(div).html(response);
			// Dispatch a event for text updates.
			events.publish(constants.TEXT_LOADED_EVENT, div);
		})
		.catch((error) => {
			console.error(error);
		});
}

// Sort the passages according to their score.
function sortPassages() {
	let container = compareWidgetsContent.querySelector(".comparison-container");
	let passages = Array.from(container.getElementsByClassName("passage-widget"));
	if (passages.length < 2) {
		return;
	}
	passages.sort((a, b) => {
		let penaltyA = parseFloat(a.querySelector(".passage-penalty").innerText);
		let penaltyB = parseFloat(b.querySelector(".passage-penalty").innerText);
		return penaltyA - penaltyB; // for ascending order, swap penaltyA and penaltyB for descending order
	});

	passages.forEach((passage) => container.appendChild(passage));
}

function addRemoveWidgetListeners() {
	document
		.querySelectorAll(".passage-widget .remove-widget")
		.forEach(function (btn) {
			btn.addEventListener("click", function () {
				var widgets = document.querySelectorAll(".passage-widget");

				// Only remove widget if there are more than 2
				if (widgets.length > 1) {
					// 'this' is the button that was clicked
					this.closest(".passage-widget").remove();
				} else {
					utils.showToast("Minimum of 1 text widgets.", 2000);
				}
			});
		});
}

export function addTextWidget(div = null) {
	const container =
		div || compareWidgetsContent.querySelector(".comparison-container");
	var widgets = container.querySelectorAll(".passage-widget");

	// Only clone widget if there are less than 4
	if (widgets.length < 4) {
		var lastWidget = widgets[widgets.length - 1];
		var newWidget = lastWidget.cloneNode(true);

		// Append the new widget to the container
		container.appendChild(newWidget);
		addRemoveWidgetListeners();
		// You might need to initialize some stuff on the new widget here
	} else {
		utils.showToast("Maximum of 4 text widgets.", 2000);
	}
}


$(window).on("load", (event) => {
	compareModeBtn.textContent = MODE.WIDGETS;
	compareModeBtn.addEventListener("click", updateCompareMode);

		// Add event listener to "add" button
	$(".add-widget").on("click", function () {
		addTextWidget();
	});

	const passageWidgets =
		compareWidgetsContent.querySelectorAll(".passage-widget");

	if (passageWidgets.length > 1) {
		// Fetch the Hebrew text for each passage on initial page load
		passageWidgets.forEach((div) => {
			const id = div.getAttribute("data-id");
			getHebrewText(id, div);
		});
		compareMode = MODE.WIDGETS;
		compareListsContent.classList.toggle("hidden");
	} else {
		// Only one passage, default to the list compare.
		passageWidgets.forEach((div) => {
			const id = div.getAttribute("data-id");
			getHebrewText(id, div);
		});
		compareWidgetsContent.classList.toggle("hidden");
		compareMode = MODE.LISTS;
	}
	updateCompareMode(false);

	// TODO more organization
	passageLists.setUpComparisonForm();

});

events.subscribe(constants.TEXT_LOADED_EVENT, (event) => {
	addRemoveWidgetListeners();
	// sortPassages();
	document
		.querySelectorAll(".passage-widget .passage-dropdown-item")
		.forEach((item) => {
			item.addEventListener("click", (event) => submitPassage(event.target));
		});
});


events.subscribe(constants.PASSAGE_COMPARISON_EVENT, function () {
	passageLists.passageListsComparison.init();
	passageLists.passageListsComparison.loadMatchingIndexTexts();
	passageLists.passageListsComparison.drawLines();
	$("#list-comparisons").css("display", "flex");
});

events.subscribe(constants.TEXT_ROW_LOADED_EVENT, (event) => {
	passageLists.widgetContainer.scrollIntoView();
});
