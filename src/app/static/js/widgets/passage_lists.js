import * as utils from "../utils/utils.js";
import apis from "../utils/api.js";
import * as events from "../utils/events.js";
import * as constants from "../utils/constants.js";
import * as alg from "../utils/algorithms.js";
import * as sel from "../utils/selectors.js";

import { Passage } from "../models/passage.js";
import { PenaltyData } from "../models/penalty.js";
import { Algorithm } from "../models/algorithm.js";
// https://anseki.github.io/leader-line/

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
const compareAlgorithmsForm = $("#compare-algorithms-form");
const textDivs = widgetsContainer.querySelectorAll(".passage-widget");

function getDiffInnerHTML(diff, index1, index2) {
	return `<span class="passage-diff">${diff}</span>: ${index1}→${index2}`;
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
		this.passageItems = $(`#column-1 ${sel.CLASS.passageListItem}`);
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
		/** @type {JQuery<HTMLElement>} */
		this.selectedPassage = null;
	}

	show() {
		this.contentDiv.css("display", "flex");
	}

	collectPassageData() {
		this.passageItems.each((i, passageDiv) => {
			let passageId = $(passageDiv).attr(sel.DATA.passageId);
			const passage = utils.getPassageById(passageId);
			const match = $(
				`#column-2 ${sel.CLASS.passageListItem}[${sel.DATA.passageId}='${passage.id}']`,
			).first();
			const color = colors[i % colors.length];
			const itemIndex = $(passageDiv).attr(sel.DATA.passageIndex);
			// Set beyongd the bounds, in case the match isn't in the second array.
			// TODO find a way to get values of out-of-bounds passages
			let matchingIndex = this.passageItems.length + 1;
			if (match) {
				matchingIndex = match.attr(sel.DATA.passageIndex);
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
				this.loadMatchingIndexTexts(indexDiv);
			});
		});
	}

	/**
	 * @param {JQuery<HTMLElement>} [div]
	 */
	isSelected(div) {
		return this.selectedPassage
			? div.attr(sel.DATA.passageId) ===
					this.selectedPassage.attr(sel.DATA.passageId)
			: false;
	}

	/**
	 * @param {JQuery<HTMLElement>} [passageDiv]
	 */
	addPassageEventListeners(passageDiv) {
		passageDiv.off().on("mouseenter", () => {
			if (!this.isSelected(passageDiv)) {
				this.highlightPassageAndLine(passageDiv, "gray");
			}
		});
		passageDiv.on("mouseleave", () => {
			if (!this.isSelected(passageDiv)) {
				this.highlightPassageAndLine(passageDiv, null, true); // Reset on mouse leave
			}
		});
		passageDiv.on("click", () => this.handlePassageClicked(passageDiv));
	}

	/**
	 * @param {JQuery<HTMLElement>} [div]
	 */
	handlePassageClicked(div) {
		if (this.selectedPassage && this.isSelected(div)) {
			// Clicking the same passage again: unselect and reset highlight
			this.highlightPassageAndLine(this.selectedPassage, null, true); // Reset the highlight
			this.selectedPassage = null;
		} else {
			// New passage clicked or no current selection
			if (this.selectedPassage) {
				// Reset previous selection
				this.highlightPassageAndLine(this.selectedPassage, null, true);
			}
			// Highlight and select the new passage
			this.selectedPassage = div;
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
		const passageId = div.attr(sel.DATA.passageId);
		const lineSize = reset ? 1 : 4;
		const borderWidth = reset ? "" : "2px";
		color = color || this.passageObjects[passageId].color;
		this.lineReferences[passageId].setOptions({
			color: color,
			size: lineSize,
		});
		// Highlight passages
		this.contentDiv
			.find(`[${sel.DATA.passageId}="${passageId}"]`)
			.each((i, passageDiv) => {
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
				const diffHTML = getDiffInnerHTML(
					Math.abs(passageObj.diff),
					passageObj.index,
					passageObj.matchingIndex,
				);
				const passageDiv = $("<div>").attr({
					class: sel.CLASS.passageListItem.replace(".", ""),
					[sel.DATA.passageId]: passageId,
				}).html(`
				<div class="pr-2 w-1/2 bg-gray-100 text-right">${passageObj.passage.referenceAbbr}</div>
				<div class="pl-2 w-1/2 bg-yellow-50">${diffHTML}</div>
				`);
				this.addPassageEventListeners(passageDiv);
				$("#summary-passages").append(passageDiv);
			},
		);
	}

	/**
	 * @param {JQuery<HTMLElement>} [div]
	 */
	showHoverText(div) {
		// Get the text
		const passageId = div.attr(sel.DATA.passageId);
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
			this.passageObjects[passageId].diff,
			startIndex,
			endIndex,
		);
		$(this.hoverTextDiv).show();
	}

	loadMatchingIndexTexts(indexDiv) {
		const indexA = indexDiv || this.passageIndeces[0];
		const indexB = document.querySelector(
			`#column-2 .index-${$(indexA).attr(sel.DATA.passageIndex)}`,
		);
		getPassageText(
			indexA.parentNode.querySelector(sel.CLASS.passageListItem),
			textDivs[0],
		);
		getPassageText(
			indexB.parentNode.querySelector(sel.CLASS.passageListItem),
			textDivs[1],
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
		this.algorithmDropdowns.each((i, dropdown) => {
			let matchingItem = $(dropdown).find(`option[value='${algorithm.id}']`);
			// If not, add the new option
			if (matchingItem.length < 1) {
				const option = new Option(algorithm.name, algorithm.id);
				$(option).attr(sel.DATA.formIndex, i + 1);
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
					$(selectedOption).attr(sel.DATA.formIndex),
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
	let listIndex = $(passageDiv).hasClass("col-1") ? 0 : 1;
	let passageId = $(passageDiv).attr(sel.DATA.passageId);
	apis
		.getHebrewText(passageId, true)
		.then((response) => {
			$(textDiv).html(response);
			// Remove del buttons for passage list case
			$(compareListsDiv).find(".remove-widget.del-btn").remove();
			let passage = utils.getPassageById(passageId);
			// Update the penalty of the widget with the penalty from this algorithm (rather than the DB value).
			let newPenalty = $(passageDiv).attr(sel.DATA.passagePenalty);
			$(textDiv).find(".passage-penalty").text(newPenalty);
			// Use the penalty data from the passage to set up the algorithm buttons
			// for toggling words in the passage.
			let penaltyData = new PenaltyData(
				utils.toJson($(passageDiv).attr(sel.DATA.passagePenalties)),
			);
			alg.buildAlgorithmDisplayButtons(penaltyData, listIndex);
			// Dispatch an event for text updates.
			if (publishEvent) {
				events.publish(events.PASSAGE_LISTS_TEXT_COMPARISON_EVENT, {
					div: textDiv,
					penalties: penaltyData.penalties,
				});
				console.log("Comparison passage", passage);
			}
		})
		.catch((error) => {
			console.error(error);
		});
}
