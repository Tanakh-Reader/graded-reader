import * as utils from "./utils/utils.js";
import apis from "./utils/api.js";
import * as events from "./utils/events.js";
import * as constants from "./utils/constants.js";
import * as alg from "./utils/algorithms.js";
import * as compare from "./passages_compare.js";
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

let lineReferences = {};
let passageObjects = {};
const topDiffsCount = 5;
const dropdowns = $(document).find("select").toArray();
const maxLines = 75;
const widgetContainer = document.querySelector(
	"#compare-lists-mode .comparison-container",
);

var col1Items = null;
var passageIndeces = null;
var hoverTextDiv = null;

var allLines = true;
var diffsAdded = 0;
var maxDiff = -1;
var minDiff = 1000;
var currentPassage = null;

function getDiffInnerHTML(color, diff, index1, index2) {
	return `<span class="font-bold ${color}">${diff}</span>: ${index1}→${index2}`;
}

function showHoverText(div) {
	// Get the text
	const passageId = div.dataset.id;
	let startIndex = null;
	let endIndex = null;

	if (div.classList.contains("col-1")) {
		startIndex = passageObjects[passageId].index1;
		endIndex = passageObjects[passageId].index2;
	} else if (div.classList.contains("col-2")) {
		startIndex = passageObjects[passageId].index2;
		endIndex = passageObjects[passageId].index1;
	} else {
		return;
	}

	// Position the hover text div next to the hovered div
	const rect = div.getBoundingClientRect();
	hoverTextDiv.style.top = `${rect.top + window.scrollY}px`;
	hoverTextDiv.style.left = `${rect.right + window.scrollX + 10}px`; // 10px to the right
	hoverTextDiv.innerHTML = getDiffInnerHTML(
		"text-red-500",
		-passageObjects[passageId].diff,
		startIndex,
		endIndex,
	);
	hoverTextDiv.classList.remove("hidden"); // Show the div
}

function handlePassageClicked(div) {
	const currentSelection = document.querySelector(".selected-passage");
	if (currentSelection && div.dataset.id === currentSelection.dataset.id) {
		// Clicking the same passage again: unselect and reset highlight
		highlightPassageAndLine(currentSelection, null, true); // Reset the highlight
		currentSelection.classList.remove("selected-passage");
	} else {
		// New passage clicked or no current selection
		if (currentSelection) {
			// Reset previous selection
			highlightPassageAndLine(currentSelection, null, true);
			currentSelection.classList.remove("selected-passage");
		}
		// Highlight and select the new passage
		div.classList.add("selected-passage");
		highlightPassageAndLine(div, "#242423"); // Highlight with new color
	}

	const textDivs = widgetContainer.querySelectorAll(".passage-widget");
	let i = div.classList.contains("col-1") ? 0 : 1;
	x(div.dataset.id, textDivs[i]);
	widgetContainer.scrollIntoView();
}

function highlightPassageAndLine(div, color = null, reset = false) {
	const passageId = div.dataset.id;
	const lineSize = reset ? 1 : 4;
	const borderWidth = reset ? "" : "2px";
	color = color || passageObjects[passageId].color;
	lineReferences[passageId].setOptions({
		color: color,
		size: lineSize,
	});
	// Highlight passages
	document.querySelectorAll(`[data-id="${passageId}"]`).forEach((div) => {
		div.style.borderColor = color;
		div.style.borderWidth = borderWidth;
	});
	showHoverText(div);
	if (reset) {
		hoverTextDiv.classList.add("hidden");
	}
}

function addPassageEventListeners(item) {
	item.addEventListener("mouseenter", () => {
		if (!item.classList.contains("selected-passage")) {
			highlightPassageAndLine(item, "gray");
		}
	});
	item.addEventListener("mouseleave", () => {
		if (!item.classList.contains("selected-passage")) {
			highlightPassageAndLine(item, null, true); // Reset on mouse leave
		}
	});
	item.addEventListener("click", () => handlePassageClicked(item));
}

function buildDiffSummaryDiv() {
	// Sort the entries in reverse order by the absolute difference
	const sortedPassages = Object.entries(passageObjects).sort(
		(a, b) => Math.abs(b[1].diff) - Math.abs(a[1].diff),
	);

	// Get the top 10 passages with the largest differences
	const topDiffs = sortedPassages.slice(0, topDiffsCount);

	document.getElementById("summary-heading").innerHTML = `
    <div><span class="underline">Average Shift</span>: ${Math.floor(
			diffsAdded / col1Items.length,
		)} rows</div>
    <div><span class="underline">Max Shift</span>: ${maxDiff} rows</div>
    <div><span class="underline">Min Shift</span>: ${minDiff} rows</div>
    `;

	// Create divs programmatically and append them to the container
	topDiffs.forEach(([key, value]) => {
		// Create a new div element
		const div = document.createElement("div");
		div.classList =
			"data-passage flex w-64 overflow-hidden rounded-md border border-black";
		div.setAttribute("data-id", value.id);
		// Set the text content of the div
		const diffHTML = getDiffInnerHTML(
			"text-red-500",
			Math.abs(value.diff),
			value.index1,
			value.index2,
		);
		div.innerHTML = `
        <div class="pr-2 w-32 bg-gray-100 text-right">${value.ref}</div>
        <div class="pl-2 w-32 bg-yellow-50">${diffHTML}</div>
        `;
		addPassageEventListeners(div);
		// Append the newly created div to the container
		document.getElementById("summary-passages").appendChild(div);
	});
}

function drawLine(passageObj) {
	let currentLine = lineReferences[passageObj.id];
	if (currentLine) {
		currentLine.remove();
	}
	var line = new LeaderLine(passageObj.col1, passageObj.col2, {
		size: 1,
		color: passageObj.color,
		path: "straight",
		endPlug: "behind",
	});
	lineReferences[passageObj.id] = line;
}

function drawLines() {
	Object.entries(passageObjects).forEach(([key, value], index) => {
		if (value.col2) {
			drawLine(value);
		}
	});
}

function collectPassagesData() {
	if (col1Items.length > 0) {
		// Populate dictionaries and draw lines between passages.
		col1Items.forEach((item, index) => {
			const passage = utils.contextToJson(item.dataset.passage);
			const match = document.querySelector(
				`#column-2 .passage-item[data-id='${passage.id}']`,
			);
			const color = colors[index % colors.length];
			// TODO : look into setting null if there is not a match.
			// Get index difference.
			const itemIndex =
				item.parentNode.querySelector(".passage-index").dataset.index;
			const matchingIndex =
				match.parentNode.querySelector(".passage-index").dataset.index;
			const diff = Math.abs(itemIndex - matchingIndex);
			diffsAdded += diff;
			if (diff > maxDiff) {
				maxDiff = diff;
			}
			if (diff < minDiff) {
				minDiff = diff;
			}

			passageObjects[passage.id] = {
				ref: passage.reference_abbr,
				id: passage.id,
				col1: item,
				col2: match,
				index1: itemIndex,
				index2: matchingIndex,
				diff: diff,
				color: color,
			};

			[item, match].forEach((div) => {
				div.style.borderColor = color;
				addPassageEventListeners(div);
			});
		});

		passageIndeces.forEach((passageIndex) => {
			passageIndex.addEventListener("click", () => {
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
				loadMatchingIndexTexts(passageIndex);
			});
		});

		return true;
	}
}

function x(a, b, c = false) {
	apis
		.getHebrewText(a, true)
		.then((response) => {
			$(b).html(response);
			// Dispatch a event for text updates.
			if (c) {
				events.publish(constants.TEXT_ROW_LOADED_EVENT, b);
			}
		})
		.catch((error) => {
			console.error(error);
		});
}

function loadMatchingIndexTexts(index) {
	const indexA = index || passageIndeces[0];
	const indexB = document.querySelector(
		`#column-2 .index-${indexA.dataset.index}`,
	);
	const textDivs = widgetContainer.querySelectorAll(".passage-widget");
	console.log(textDivs);
	x(indexA.parentNode.querySelector(".passage-item").dataset.id, textDivs[0]);
	x(
		indexB.parentNode.querySelector(".passage-item").dataset.id,
		textDivs[1],
		true,
	);
}

document.addEventListener("DOMContentLoaded", function () {
	dropdowns.forEach((dropdown) => {
		const currentSelection = dropdown.selectedOptions[0];
		const currentDef = utils.contextToJson(currentSelection.dataset.definition);
		if (currentDef) {
			alg.buildAlgorithmDisplay(
				currentDef,
				currentSelection.dataset.index,
				true,
			);
		}

		dropdown.addEventListener("change", (event) => {
			const selectedOption = event.target.selectedOptions[0];
			const definition = utils.contextToJson(selectedOption.dataset.definition);
			alg.buildAlgorithmDisplay(definition, selectedOption.dataset.index, true);
		});
	});

	// Get the form element
	var form = document.querySelector("#compare-algorithms-form");

	// Add submit event listener
	form.addEventListener("submit", function (e) {
		// Prevent the form from submitting
		e.preventDefault();

		// Create an object to store the data
		var formData = {
			alg1: form.querySelector('select[name="algorithm1"]').value,
			alg2: form.querySelector('select[name="algorithm2"]').value,
			count: form.querySelector('input[name="count"]').value,
		};

		apis.compareAlgorithms(formData);
	});
});

events.subscribe(constants.PASSAGE_COMPARISON_EVENT, function () {
	col1Items = document.querySelectorAll("#column-1 .passage-item");
	passageIndeces = document.querySelectorAll("#column-1 .passage-index");
	lineReferences = {};
	passageObjects = {};

	hoverTextDiv = document.getElementById("hover-text");
	if (collectPassagesData()) {
		document.getElementById("comparisons").style.display = "flex";
		buildDiffSummaryDiv();
		loadMatchingIndexTexts();
		if (col1Items.length > maxLines) {
			allLines = false;
			drawLines();
		} else {
			drawLines();
		}
	}
});

events.subscribe(constants.TEXT_ROW_LOADED_EVENT, (event) => {
	widgetContainer.scrollIntoView();
	drawLines();
});
