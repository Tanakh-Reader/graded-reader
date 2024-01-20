import * as constants from "./utils/constants.js";
import * as utils from "./utils/utils.js";
import * as events from "./utils/events.js";
import apis from "./utils/api.js";

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
		div ||
		compareWidgetsContent.querySelector(".comparison-container");
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

// Add event listener to "add" button
document.querySelector(".add-widget").addEventListener("click", function () {
	addTextWidget();
});

window.addEventListener("DOMContentLoaded", (event) => {
	compareModeBtn.textContent = MODE.WIDGETS;
	compareModeBtn.addEventListener("click", updateCompareMode);

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
});

events.subscribe(constants.TEXT_LOADED_EVENT, (event) => {
	addRemoveWidgetListeners();
	sortPassages();
	document
		.querySelectorAll(".passage-widget .passage-dropdown-item")
		.forEach((item) => {
			item.addEventListener("click", (event) => submitPassage(event.target));
		});
});

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
        this.currentCondition = null; // Track the current active condition
        this.frequencies = {};
        for (const [condition, value] of Object.entries(data.frequencies)) {
          this.frequencies[condition] = new Category(value)
        }
        for (const [condition, value] of Object.entries(data.verbs)) {
          this.frequencies[condition] = new Category(value)
        }
        for (const [condition, value] of Object.entries(data.nouns)) {
          this.frequencies[condition] = new Category(value)
        }
        for (const [condition, value] of Object.entries(data.clauses)) {
          this.frequencies[condition] = new Category(value)
        }
        for (const [condition, value] of Object.entries(data.phrases)) {
          this.frequencies[condition] = new Category(value)
        }
        for (const [condition, value] of Object.entries(data.constants)) {
          this.frequencies[condition] = new Category(value)
        }
    }

    apply(condition, btn) {
      const btnColor = "bg-orange-300";
        if (this.currentCondition === condition) {
            // If the same condition is clicked again, unhighlight all
            btn.classList.remove(btnColor);
            this.unhighlightAll();
            this.currentCondition = null;
        } else {
            // Unhighlight current, highlight new condition's words, and update current condition
            btn.classList.add(btnColor);
            this.unhighlightAll();
            this.frequencies[condition].wordMatches();
            this.currentCondition = condition;
        }
    }

    check(condition) {
      return this.frequencies[condition];
    }

    unhighlightAll() {
        // Implement logic to remove highlights from all words
        Object.values(this.frequencies).forEach(category => {
            category.words.forEach(wordId => {
                let word = document.getElementById(wordId);
                if (word) {
                    word.style.backgroundColor = ""; // Reset styles
                    // word.style.color = ""; // Reset color
                }
            });
        });
    }
}


export class Category {
	constructor(category) {
		this.words = category.words || category;
		this.penalties = category.penalties || [];
	}

	wordMatches() {
		this.words.forEach((wordId, i) => {
			let word = document.getElementById(wordId);
			word.style.backgroundColor = "orange";
			// word.style.color = getGradientColor(this.penalties[i]);
		});
	}

  wordColors() {
    this.words.forEach((wordId, i) => {
			let word = document.getElementById(wordId);
			word.style.backgroundColor = "orange";
			word.style.color = getGradientColor(this.penalties[i]);
		});
  }
}

function getGradientColor(penalty) {
	const green = [0, 0, 0];
	const red = [255, 0, 0];
	const ratio = penalty / 10;

	const r = green[0] + ratio * (red[0] - green[0]);
	const g = green[1] + ratio * (red[1] - green[1]);
	const b = green[2] + ratio * (red[2] - green[2]);

	return `rgb(${r}, ${g}, ${b})`;
}