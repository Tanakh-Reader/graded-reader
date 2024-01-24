import * as utils from "../utils/utils.js";
import apis from "../utils/api.js";
import * as events from "../utils/events.js";
import * as constants from "../utils/constants.js";
import * as alg from "../utils/algorithms.js";
import { Passage } from "../models/passage.js";
import { PenaltyData } from "../models/penalty.js";
import { Algorithm } from "../models/algorithm.js";
// https://anseki.github.io/leader-line/

// CONSTANTS
// ----------------------------------------------------------------
// ----------------------------------------------------------------

const diffColor = "text-red-500";
const passageDivClasses =
	"data-passage flex w-64 overflow-hidden rounded-md border border-black".split(
		" ",
	);

const colors = [
	"#E53E3E",
	"#DD6B20",
	"#38A169",
	"#3182CE",
	"#805AD5",
	"#D53F8C",
	"#0F766E",
	"#ECC94B",
	"#7B341E",
	"#4C51BF",
];

const topDiffsCount = 5;

const compareListsDiv = $("#compare-lists-mode")[0];
const widgetsContainer = compareListsDiv.querySelector(".comparison-container");
const textDivs = widgetsContainer.querySelectorAll(".passage-widget");
const compareAlgorithmsForm = $("#compare-algorithms-form");

function getDiffInnerHTML(color, diff, index1, index2) {
	return `<span class="font-bold ${color}">${diff}</span>: ${index1}→${index2}`;
}

class PassageComparisonObject {
	/**
	 * Creates a PassageComparisonObject.
	 * @param {Object} param0 - The constructor parameters.
	 * @param {Passage} param0.passage - The passage object.
	 * @param {HTMLElement} param0.div - The HTML element representing the passage.
	 * @param {HTMLElement} param0.matchingDiv - The HTML element representing the matching passage.
	 * @param {number} param0.index - The index of the passage.
	 * @param {number} param0.matchingIndex - The index of the matching passage.
	 * @param {number} param0.diff - The difference metric for comparison.
	 * @param {string} param0.color - The color used for highlighting or other visual representation.
	 */
	constructor({
		passage,
		div,
		matchingDiv,
		index,
		matchingIndex,
		diff,
		color,
	}) {
		this.passage = passage;
		this.div = div;
		this.matchingDiv = matchingDiv;
		this.index = index;
		this.matchingIndex = matchingIndex;
		this.diff = diff;
		this.color = color;
	}
}

export class PassageListsComparison {
	init() {
		// Remove any existing lines.
		this.deleteLines();
		this.passageItems = $("#column-1 .passage-item");
		this.passageIndeces = $("#column-1 .passage-index");
		this.hoverTextDiv = $("#hover-text")[0];
		this.contentDiv = $("#list-comparisons");
		/** @type {Object<string, PassageComparisonObject>} */
		this.passageObjects = {};
		this.lineReferences = {};
		this.diffsTotalSum = 0;
		this.maxDiff = -1;
		this.minDiff = 1000;
		this.collectPassageData();
		this.buildDiffSummaryDiv();
	}

	show() {
		this.contentDiv.css("display", "flex");
	}

	collectPassageData() {
		this.passageItems.each((i, passageDiv) => {
			const passage = new Passage($(passageDiv).data("definition"));
			const match = $(
				`#column-2 .passage-item[data-id='${passage.id}']`,
			).first();
			const color = colors[i % colors.length];
			const itemIndex = $(passageDiv).data("index");
			// Set beyongd the bounds, in case the match isn't in the second array.
			// TODO find a way to get values of out-of-bounds passages
			let matchingIndex = this.passageItems.length + 1;
			if (match) {
				matchingIndex = match.data("index");
			}

			// Calculate index differences.
			const diff = Math.abs(itemIndex - matchingIndex);
			this.diffsTotalSum += diff;
			if (diff > this.maxDiff) {
				this.maxDiff = diff;
			}
			if (diff < this.minDiff) {
				this.minDiff = diff;
			}

			this.passageObjects[passage.id] = new PassageComparisonObject({
				passage: passage,
				div: passageDiv,
				matchingDiv: match ? match[0] : null,
				index: itemIndex,
				matchingIndex: matchingIndex,
				diff: diff,
				color: color,
			});

			[passageDiv, match].forEach((div) => {
				if (div) {
					$(div).css({ borderColor: color });
					this.addPassageEventListeners($(div));
				}
			});
		});

		this.passageIndeces.each((i, indexDiv) => {
			$(indexDiv).on("click", () => {
				// const passage = utils.contextToJson(
				// 	passageIndex.getAttribute("data-passage"),
				// );
				// utils.submitPassageSelection(
				// 	passage.book,
				// 	passage.start_chapter,
				// 	passage.start_verse,
				// 	passage.end_chapter,
				// 	passage.end_verse,
				// );
				// document.querySelectorAll(".passage-text").forEach((div) => {
				// 	const id = div.getAttribute("data-id");

				// });
				this.loadMatchingIndexTexts(indexDiv);
			});
		});
	}

	/**
	 * @param {JQuery<HTMLElement>} [passageDiv]
	 */
	addPassageEventListeners(passageDiv) {
		passageDiv.off();
		passageDiv.on("mouseenter", () => {
			if (!passageDiv.hasClass("selected-passage")) {
				this.highlightPassageAndLine(passageDiv, "gray");
			}
		});
		passageDiv.on("mouseleave", () => {
			if (!passageDiv.hasClass("selected-passage")) {
				this.highlightPassageAndLine(passageDiv, null, true); // Reset on mouse leave
			}
		});
		passageDiv.on("click", () => this.handlePassageClicked(passageDiv));
	}

	/**
	 * @param {JQuery<HTMLElement>} [div]
	 */
	handlePassageClicked(div) {
		const currentSelection = $(".selected-passage");
		if (currentSelection && div.data("id") === currentSelection.data("id")) {
			// Clicking the same passage again: unselect and reset highlight
			this.highlightPassageAndLine(currentSelection, null, true); // Reset the highlight
			currentSelection.removeClass("selected-passage");
		} else {
			// New passage clicked or no current selection
			if (currentSelection[0]) {
				// Reset previous selection
				this.highlightPassageAndLine(currentSelection, null, true);
				currentSelection.addClass("selected-passage");
			}
			// Highlight and select the new passage
			div.addClass("selected-passage");
			this.highlightPassageAndLine(div, "#242423"); // Highlight with new color
		}

		// Fetch the text for the clicked on passage.
		let i = div.hasClass("col-1") ? 0 : 1;
		if (i === 0 || div.hasClass("col-2")) {
			getPassageText(div[0], textDivs[i], true);
			widgetsContainer.scrollIntoView();
		}
	}

	/**
	 * @param {JQuery<HTMLElement>} [div]
	 * @param {String} [color]
	 * @param {Boolean} [reset]
	 */
	highlightPassageAndLine(div, color = null, reset = false) {
		const passageId = div.data("id");
		const lineSize = reset ? 1 : 4;
		const borderWidth = reset ? "" : "2px";
		color = color || this.passageObjects[passageId].color;
		this.lineReferences[passageId].setOptions({
			color: color,
			size: lineSize,
		});
		// Highlight passages
		this.contentDiv.find(`[data-id="${passageId}"]`).each((i, passageDiv) => {
			passageDiv.style.borderColor = color;
			passageDiv.style.borderWidth = borderWidth;
		});
		this.showHoverText(div);
		if (reset) {
			$(this.hoverTextDiv).hide();
		}
	}

	/**
	 * @param {PassageComparisonObject} [passageObj]
	 */
	drawLine(passageObj) {
		let currentLine = this.lineReferences[passageObj.passage.id];
		if (currentLine) {
			currentLine.remove();
		}
		// @ts-ignore
		var line = new LeaderLine(passageObj.div, passageObj.matchingDiv, {
			size: 1,
			color: passageObj.color,
			path: "straight",
			endPlug: "behind",
		});
		this.lineReferences[passageObj.passage.id] = line;
	}

	drawLines() {
		if (this.lineReferences && this.passageObjects) {
			setTimeout(() => {
				Object.entries(this.passageObjects).forEach(
					([passageId, passageObj], index) => {
						if (passageObj && passageObj.matchingDiv) {
							this.drawLine(passageObj);
						}
					},
				);
			}, 150);
		}
	}

	deleteLines() {
		if (this.lineReferences && Object.keys(this.lineReferences).length > 0) {
			Object.entries(this.lineReferences).forEach(
				([passageId, line], index) => {
					line.remove();
				},
			);
			this.lineReferences = {};
		}
	}

	buildDiffSummaryDiv() {
		// Sort the entries in reverse order by the absolute difference
		const sortedPassages = Object.entries(this.passageObjects).sort(
			(a, b) => Math.abs(b[1].diff) - Math.abs(a[1].diff),
		);

		const topDiffs = sortedPassages.slice(0, topDiffsCount);

		$("#summary-heading").html(`
			<div><span class="underline">Average Shift</span>: ${Math.floor(
				this.diffsTotalSum / this.passageItems.length,
			)} rows</div>
			<div><span class="underline">Max Shift</span>: ${this.maxDiff} rows</div>
			<div><span class="underline">Min Shift</span>: ${this.minDiff} rows</div>
		`);

		// Create divs programmatically and append them to the container
		topDiffs.forEach(
			([passageId, /** @type {PassageComparisonObject} */ passageObj]) => {
				// Create a new div element
				const passageDiv = document.createElement("div");
				passageDiv.classList.add(...passageDivClasses);
				passageDiv.setAttribute("data-id", passageId);
				// Set the text content of the div
				const diffHTML = getDiffInnerHTML(
					diffColor,
					Math.abs(passageObj.diff),
					passageObj.index,
					passageObj.matchingIndex,
				);
				passageDiv.innerHTML = `
				<div class="pr-2 w-32 bg-gray-100 text-right">${passageObj.passage.referenceAbbr}</div>
				<div class="pl-2 w-32 bg-yellow-50">${diffHTML}</div>
				`;
				this.addPassageEventListeners($(passageDiv));
				// Append the newly created div to the container
				document.getElementById("summary-passages").appendChild(passageDiv);
			},
		);
	}

	/**
	 * @param {JQuery<HTMLElement>} [div]
	 */
	showHoverText(div) {
		// Get the text
		const passageId = div.data("id");
		let startIndex = null;
		let endIndex = null;

		if (div.hasClass("col-1")) {
			startIndex = this.passageObjects[passageId].index;
			endIndex = this.passageObjects[passageId].matchingIndex;
		} else if (div.hasClass("col-2")) {
			startIndex = this.passageObjects[passageId].matchingIndex;
			endIndex = this.passageObjects[passageId].index;
		} else {
			return;
		}

		// Position the hover text div next to the hovered div
		const rect = div[0].getBoundingClientRect();
		this.hoverTextDiv.style.top = `${rect.top + window.scrollY}px`;
		this.hoverTextDiv.style.left = `${rect.right + window.scrollX + 10}px`; // 10px to the right
		this.hoverTextDiv.innerHTML = getDiffInnerHTML(
			diffColor,
			this.passageObjects[passageId].diff,
			startIndex,
			endIndex,
		);
		$(this.hoverTextDiv).show();
	}

	loadMatchingIndexTexts(index) {
		const indexA = index || this.passageIndeces[0];
		const indexB = document.querySelector(
			`#column-2 .index-${indexA.dataset.index}`,
		);
		const textDivs = widgetsContainer.querySelectorAll(".passage-widget");
		getPassageText(
			indexA.parentNode.querySelector(".passage-item"),
			textDivs[0],
		);
		getPassageText(
			indexB.parentNode.querySelector(".passage-item"),
			textDivs[1],
			true,
		);
	}
}

export class CompareListsMode {
	init() {
		this.algorithmDropdowns = compareAlgorithmsForm.find("select");
		this.listComparison = new PassageListsComparison();
		this.setUpComparisonForm();
		this.setListeners();
	}

	show() {
		$(compareListsDiv).show();
		// this.listComparison.init();
		this.listComparison.drawLines();
	}

	hide() {
		this.listComparison.deleteLines();
		$(compareListsDiv).hide();
		// this.listComparison.deleteLines();
	}

	setListeners() {
		// form submitted
		events.subscribe(events.PASSAGE_LISTS_PENALTY_COMPARISON_EVENT, (event) => {
			this.listComparison.init();
			this.listComparison.show();
			this.listComparison.loadMatchingIndexTexts();
		});

		// text fetched
		events.subscribe(events.PASSAGE_LISTS_TEXT_COMPARISON_EVENT, (event) => {
			widgetsContainer.scrollIntoView();
			this.listComparison.drawLines();
		});

		// text fetched via selector
		events.subscribe(
			events.TEXT_SUBMITTED_BY_PASSAGE_SELECTOR_EVENT,
			(event) => {
				setTimeout(() => {
					this.listComparison.drawLines();
					// Remove del buttons for passage list case
					$(compareListsDiv).find(".remove-widget.del-btn").remove();
				}, 300);
			},
		);

		// Algorithm edited or created.
		events.subscribe(events.ALG_FORM_SUBMITTED_EVENT, (event) => {
			this.updateDropdownsAndDisplay(event.detail.algorithm);
		});
	}

	/**
	 * Update algorithm and display
	 * @param {Algorithm} [algorithm]
	 */
	updateDropdownsAndDisplay(algorithm) {
		console.log(algorithm);
		this.algorithmDropdowns.each((i, dropdown) => {
			let matchingItem = $(dropdown).find(`option[value='${algorithm.id}']`);
			console.log(matchingItem);
			// If not, add the new option
			if (matchingItem.length < 1) {
				const option = new Option(algorithm.name, algorithm.id);
				$(option).data("index", i + 1);
				$(dropdown).append(option);
			} // A currently display algorithm has been updated.
			else {
				matchingItem.text(algorithm.name);
			}
			// Trigger change if the item is selected.
			if (algorithm.id.toString() === $(dropdown).val()) {
				$(dropdown).trigger("change");
			}
		});
	}

	setUpComparisonForm() {
		// Listeners for selecting an algorithm and displaying it below.
		this.algorithmDropdowns.each((i, dropdown) => {
			$(dropdown).on("change", (event) => {
				const selectedOption = $(event.target).find(":selected");
				let algorithm = utils.getAlgorithmById(selectedOption.val());
				alg.buildAlgorithmDisplay(
					algorithm,
					$(selectedOption).data("index"),
					true,
				);
			});
		});

		// Add submit event listener
		compareAlgorithmsForm.on("submit", (e) => {
			// Prevent the form from submitting
			e.preventDefault();

			// Create an object to store the data
			var formData = {
				alg1: compareAlgorithmsForm.find('select[name="algorithm1"]').val(),
				alg2: compareAlgorithmsForm.find('select[name="algorithm2"]').val(),
				count: compareAlgorithmsForm.find('input[name="count"]').val(),
			};
			const invalidValues = ["0", "", null, undefined];
			if (
				invalidValues.includes(formData.count) ||
				invalidValues.includes(formData.alg1) ||
				invalidValues.includes(formData.alg2) ||
				formData.alg1 === formData.alg2
			) {
				const message = "Choose: {count > 0} and {2 unique algorithms}";
				window.alert(message);
				return false;
			} else {
				apis.compareAlgorithms(formData);
			}
		});
	}
}

/**
 * @param {HTMLElement} [passageDiv]
 * @param {HTMLElement} [textDiv]
 * @param {Boolean} [publishEvent]
 */
function getPassageText(passageDiv, textDiv, publishEvent = true) {
	apis
		.getHebrewText(passageDiv.dataset.id, true)
		.then((response) => {
			$(textDiv).html(response);
			// Remove del buttons for passage list case
			$(compareListsDiv).find(".remove-widget.del-btn").remove();
			let passage = new Passage(
				utils.contextToJson(passageDiv.dataset.definition),
			);
			let data = new PenaltyData(
				utils.contextToJson(passageDiv.dataset.penalties),
			);
			alg.buildAlgorithmDisplayButtons(data);
			// Dispatch an event for text updates.
			if (publishEvent) {
				events.publish(events.PASSAGE_LISTS_TEXT_COMPARISON_EVENT, {
					div: textDiv,
					penalties: passage.penaltyData.penalties,
				});
				console.log("Comparison passage", passage);
			}
		})
		.catch((error) => {
			console.error(error);
		});
}
