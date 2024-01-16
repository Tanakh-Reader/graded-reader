import * as utils from "./utils/utils.js";
import apis from "./utils/api.js";
import * as events from "./utils/events.js";
import * as constants from "./utils/constants.js";

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

const lineReferences = {};
const passageObjects = {};
const col1Items = document.querySelectorAll("#column-1 .passage-item");
const passageIndeces = document.querySelectorAll(".passage-index");
const hoverTextDiv = document.getElementById("hover-text");
const topDiffsCount = 5;
const dropdowns = $(document).find("select").toArray();
const maxLines = 75;

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
	const passageId = div.getAttribute("data-id");
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
	if (
		currentSelection &&
		div.getAttribute("data-id") === currentSelection.getAttribute("data-id")
	) {
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
	const passageId = div.getAttribute("data-id");
	getHebrewText(passageId, document.getElementById("passage-text"));
}

function highlightPassageAndLine(div, color = null, reset = false) {
	const passageId = div.getAttribute("data-id");
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
			// const passage = item.getAttribute("data-passage");
			// const match = document.querySelector(
			// 	`#column-2 .passage-item[data-passage='${passage}']`,
			// );
			const passage = utils.contextToJson(item.getAttribute("data-passage"));
			const match = document.querySelector(
				`#column-2 .passage-item[data-id='${passage.id}']`,
			);
			const color = colors[index % colors.length];
			// TODO : look into setting null if there is not a match.
			// Get index difference.
			const itemIndex = item.getAttribute("data-index");
			const matchingIndex = match.getAttribute("data-index");
			const diff = Math.abs(itemIndex - matchingIndex);
			diffsAdded += diff;
			if (diff > maxDiff) {
				maxDiff = diff;
			} else if (diff < minDiff) {
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
				const passage = utils.contextToJson(
					passageIndex.getAttribute("data-passage"),
				);
				utils.submitPassageSelection(
					passage.book,
					passage.start_chapter,
					passage.start_verse,
					passage.end_chapter,
					passage.end_verse,
				);
			});
		});

		return true;
	}
}

function buildAlgorithmDisplay(algJSON, id) {
	const freqs = algJSON.frequencies;
	const verbs = algJSON.verbs;
	const nouns = algJSON.construct_nouns;
	const clauses = algJSON.clauses;

	const freqsDiv = document.querySelector(`#algorithm-${id} .frequencies`);
	const verbsDiv = document.querySelector(`#algorithm-${id} .verbs`);
	const nounsDiv = document.querySelector(`#algorithm-${id} .nouns`);
	const clausesDiv = document.querySelector(`#algorithm-${id} .clauses`);

	const freqExtrasDiv = document.querySelector(
		`#algorithm-${id} .frequency-extras`,
	);
	const verbExtrasDiv = document.querySelector(`#algorithm-${id} .verb-extras`);
	const configExtrasDiv = document.querySelector(
		`#algorithm-${id} .config-extras`,
	);

	if (freqs.length > 0) {
		freqsDiv.innerHTML = `<div class="font-bold">Lexical Frequency</div>`;
		freqs.forEach((freq) => {
			const freqDiv = document.createElement("div");
			const minOcc = freq[0];
			const maxOcc = freq[1];
			const penalty = freq[2];
			freqDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${minOcc} - ${maxOcc} occ.
            `;
			freqsDiv.appendChild(freqDiv);
		});
	}

	const pillClasses = "bg-yellow-50 rounded px-1";

	freqExtrasDiv.innerHTML = `
	<div class="${pillClasses}">Filler words: <span class="font-bold text-red-500">${algJSON.include_stop_words}</span></div>
	<div class="${pillClasses}"><span class="font-bold text-red-500">-${algJSON.taper_discount}</span> / occ.</div>
	<div class="${pillClasses}">Proper nouns ÷ <span class="font-bold text-red-500">${algJSON.proper_noun_divisor}</span></div>
	<div class="${pillClasses}"><span class="font-bold text-red-500">${algJSON.qere_penalty}</span>: Qere/Ketiv</div>
	`;

	if (verbs.length > 0) {
		verbsDiv.innerHTML = `<div class="font-bold">Verbs</div>`;
		verbs.forEach((morph) => {
			const morphDiv = document.createElement("div");
			const morphConditions = morph[0];
			const penalty = morph[1];
			let text = "";
			morphConditions.forEach((morphCondition) => {
				// TODO : update with constants
				const feature = {
					verb_tense: "vt",
					verb_stem: "vs",
					pronominal_suffix: "ps",
				}[morphCondition.feature];
				text += ` <span class="font-bold">${feature}</span>=${morphCondition.value} &`;
			});
			morphDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${text.substring(
							0,
							text.length - 2,
						)}
            `;
			verbsDiv.appendChild(morphDiv);
		});
	}

	verbExtrasDiv.innerHTML = `
	<div class="${pillClasses}">Penalize stems: <span class="font-bold text-red-500">${algJSON.penalize_by_verb_stem}</span></div>
	`;

	if (nouns.length > 0) {
		nounsDiv.innerHTML = `<div class="font-bold">Construct Nouns</div>`;
		nouns.forEach((noun) => {
			const nounDiv = document.createElement("div");
			const chainLength = noun[0];
			const penalty = noun[1];
			nounDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${chainLength}-noun chain
            `;
			nounsDiv.appendChild(nounDiv);
		});
	}

	if (clauses.length > 0) {
		clausesDiv.innerHTML = `<div class="font-bold">Clauses</div>`;
		clauses.forEach((clause) => {
			const clauseDiv = document.createElement("div");
			const clauseType = clause[0];
			const penalty = clause[1];
			clauseDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${clauseType}`;
			clausesDiv.appendChild(clauseDiv);
		});
	}

	configExtrasDiv.innerHTML = `
	<div class="${pillClasses}">Total penalty ÷ <span class="font-bold text-red-500">${algJSON.total_penalty_divisor}</span></div>
	`;

	document.querySelector(`#algorithm-${id}`).style.display = "flex";
}

function getHebrewText(passageId, div) {
	apis
		.getHebrewText(passageId)
		.then((response) => {
			$(div).html(response);
			// Dispatch a event for text updates.
			events.publish(constants.TEXT_LOADED_EVENT, div);
			div.style.display = "flex";
		})
		.catch((error) => {
			console.error(error);
		});
}

document.addEventListener("DOMContentLoaded", function () {
	dropdowns.forEach((dropdown) => {
		const currentSelection = dropdown.selectedOptions[0];
		const currentDef = utils.contextToJson(currentSelection.dataset.definition);
		if (currentDef) {
			buildAlgorithmDisplay(currentDef, currentSelection.dataset.index);
		}

		dropdown.addEventListener("change", (event) => {
			const selectedOption = event.target.selectedOptions[0];
			const definition = utils.contextToJson(selectedOption.dataset.definition);
			buildAlgorithmDisplay(definition, selectedOption.dataset.index);
		});
	});

	if (collectPassagesData()) {
		document.getElementById("comparisons").style.display = "flex";
		buildDiffSummaryDiv();
		if (col1Items.length > maxLines) {
			allLines = false;
			drawLines();
		} else {
			drawLines();
		}
	}
});
