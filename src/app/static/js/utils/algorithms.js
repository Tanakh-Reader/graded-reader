import * as constants from "./constants.js";
import * as utils from "./utils.js";
import * as sel from "./selectors.js";

import apis from "./api.js";
import { PenaltyData } from "../models/penalty.js";
import { Algorithm } from "../models/algorithm.js";

let displays = [];
/**
 * @param {Algorithm} [algorithm]
 * @param {String} [id]
 * @param {Boolean} [asMasonry]
 */
export function buildAlgorithmDisplay(algorithm, id, asMasonry = false) {
	console.log(algorithm, id, asMasonry);
	let containerSelector = `#algorithm-${id} .data-summary`;
	if (asMasonry) {
		$(containerSelector).hide();
		containerSelector += "-masonry";
		$(containerSelector).css("display", "flex");
	}

	const freqsDiv = $(`${containerSelector} .frequencies`);
	const verbsDiv = $(`${containerSelector} .verbs`);
	const nounsDiv = $(`${containerSelector} .nouns`);
	const clausesDiv = $(`${containerSelector} .clauses`);
	const phrasesDiv = $(`${containerSelector} .phrases`);
	const freqExtrasDiv = $(`${containerSelector} .frequency-extras`);
	const verbExtrasDiv = $(`${containerSelector} .verb-extras`);
	const configExtrasDiv = $(`${containerSelector} .config-extras`);

	[freqsDiv, verbsDiv, nounsDiv, clausesDiv, phrasesDiv].forEach((div) => {
		$(div).empty().hide();
	});

	if (algorithm.frequencies.length > 0) {
		freqsDiv.html(`
		<div class="font-bold">Lexical Frequencies</div>
		`);
		algorithm.frequencies.forEach((freq) => {
			const minOcc = freq[0];
			const maxOcc = freq[1];
			const penalty = freq[2];
			const freqDiv = $("<div>").attr(
				sel.DATA.penaltyCondition,
				`${minOcc}-${maxOcc}`,
			).html(`
            <span class="font-bold text-red-500">${penalty}</span>: ${minOcc} - ${maxOcc} occ.
            `);
			freqsDiv.append(freqDiv);
		});
		freqsDiv.css("display", "flex");
	}

	freqExtrasDiv.html(`
		<div class="pill" ${sel.DATA.penaltyCondition}="fillers">את: <span class="font-bold text-red-500">${algorithm.includeStopWords}</span></div>
		<div class="pill" ${sel.DATA.penaltyCondition}="repeats"><span class="font-bold text-red-500">-${algorithm.taperDiscount}</span> / occ.</div>
		<div class="pill" ${sel.DATA.penaltyCondition}="proper_nouns">PN ÷ <span class="font-bold text-red-500">${algorithm.properNounDivisor}</span></div>
		<div class="pill" ${sel.DATA.penaltyCondition}="qere"><span class="font-bold text-red-500">${algorithm.qerePenalty}</span>: Q/K</div>
	`);

	if (algorithm.verbs.length > 0) {
		verbsDiv.html(`
		<div class="font-bold">Verbs</div>
		`);
		algorithm.verbs.forEach((morph) => {
			const morphConditions = morph[0];
			const penalty = morph[1];
			let text = "";
			let conditionText = "";
			morphConditions.forEach((morphCondition) => {
				// TODO : update with constants
				const feature = {
					verb_tense: "vt",
					verb_stem: "vs",
					pronominal_suffix: "ps",
				}[morphCondition.feature];
				conditionText += `${morphCondition.value}-`;
				text += ` <span class="font-bold">${feature}</span>=${morphCondition.value} &`;
			});
			const morphDiv = $("<div>").attr(
				sel.DATA.penaltyCondition,
				conditionText.substring(0, conditionText.length - 1),
			).html(`
            <span class="font-bold text-red-500">${penalty}</span>: ${text.substring(
							0,
							text.length - 2,
						)}
            `);
			verbsDiv.append(morphDiv);
		});
		verbsDiv.css("display", "flex");
	}

	verbExtrasDiv.html(`
	<div class="pill" ${sel.DATA.penaltyCondition}="stems">Stems: <span class="font-bold text-red-500">${algorithm.penalizeByVerbStem}</span></div>
	`);

	if (algorithm.constructNouns.length > 0) {
		nounsDiv.html(`
		<div class="font-bold">Construct Nouns</div>
		`);
		algorithm.constructNouns.forEach((noun) => {
			const chainLength = noun[0];
			const penalty = noun[1];
			const nounDiv = $("<div>").attr(sel.DATA.penaltyCondition, chainLength)
				.html(`
            <span class="font-bold text-red-500">${penalty}</span>: ${
							chainLength + 1
						}-noun chain
            `);
			nounsDiv.append(nounDiv);
		});
		nounsDiv.css("display", "flex");
	}

	if (algorithm.clauses.length > 0) {
		clausesDiv.html(`
		<div class="font-bold">Clause/Phrase Types</div>
		`);
		algorithm.clauses.forEach((clause) => {
			const clauseType = clause[0];
			const penalty = clause[1];
			const clauseDiv = $("<div>").attr(sel.DATA.penaltyCondition, clauseType)
				.html(`
            <span class="font-bold text-red-500">${penalty}</span>: ${clauseType}
			`);
			clausesDiv.append(clauseDiv);
		});
		clausesDiv.css("display", "flex");
	}

	if (algorithm.phrases.length > 0) {
		phrasesDiv.html(`
		<div class="font-bold">Phrase Functions</div>
		`);
		algorithm.phrases.forEach((phrase) => {
			const phraseFunction = phrase[0];
			const penalty = phrase[1];
			const phraseDiv = $("<div>").attr(
				sel.DATA.penaltyCondition,
				phraseFunction,
			).html(`
            <span class="font-bold text-red-500">${penalty}</span>: ${phraseFunction}
			`);
			phrasesDiv.append(phraseDiv);
		});
		phrasesDiv.css("display", "flex");
	}

	const divisor = {
		WORDS: "W",
		LEXEMES: "L",
	}[algorithm.totalPenaltyDivisor];

	configExtrasDiv.html(`
	<div class="pill" ${sel.DATA.penaltyCondition}>T ÷ <span class="font-bold text-red-500">${divisor}</span></div>
	`);

	$(`#algorithm-${id}`).css("display", "flex");

	if (asMasonry) {
		var masonryGrid = document.querySelector(containerSelector);
		var msnry = new Masonry(masonryGrid, {
			itemSelector: ".grid-item",
			columnWidth: masonryGrid.offsetWidth / 2,
		});
		$(window).on("resize", () => {
			msnry.layout();
		});
		displays.push(
			new AlgorithmDisplayButtonManager($(`#algorithm-${id}`), msnry),
		);
	}
}

/**
 * @param {PenaltyData} [penaltyData]
 */
export function buildAlgorithmDisplayButtons(penaltyData, defIndex) {
	// const freqs = displayDiv.querySelectorAll(`.frequencies div`);
	// console.log(freqsDiv);
	// const verbs = document.querySelectorAll(`.verbs div`);
	// const nouns = document.querySelectorAll(`.nouns div`);
	// const clauses = document.querySelectorAll(`.clauses div`);
	// const phrases = document.querySelectorAll(`.phrases div`);
	console.log(defIndex, displays[defIndex]);
	displays[defIndex].rebuild(penaltyData);
	// setTimeout(() => {
	// 	var masonryGrid = conditions[0].closest(".data-summary-masonry");
	// 	var msnry = new Masonry(masonryGrid, {
	// 		itemSelector: ".grid-item",
	// 		columnWidth: masonryGrid.offsetWidth / 2,
	// 	});
	// 	$(window).on("resize", () => {
	// 		msnry.layout();
	// 	});
	// }, 100);
	// msnry.reloadItems();
	// msnry.layout();
}

class AlgorithmDisplayButtonManager {
	constructor(container, msnry) {
		console.log(container, msnry);
		this.container = container;
		this.msnry = msnry;
		this.selectedCondition = null;
	}

	// Return true if the same button has been clicked.
	toggleSelected(conditionDiv) {
		$(conditionDiv).toggleClass("selected");
		if (this.selectedCondition === conditionDiv) {
			this.selectedCondition = null;
			return true;
		} else {
			this.resetSelected();
			this.selectedCondition = conditionDiv;
			return false;
		}
	}

	resetSelected() {
		if (this.selectedCondition) {
			$(this.selectedCondition).toggleClass("selected");
			this.selectedCondition = null;
		}
	}

	rebuild(penaltyData) {
		this.resetSelected();
		let conditions = this.container.find(`[${sel.DATA.penaltyCondition}]`);
		conditions.each((i, conditionDiv) => {
			$(conditionDiv).removeClass(`pill`).addClass(`penalty-condition-pill`);
			let condition = $(conditionDiv).attr(sel.DATA.penaltyCondition);
			if (penaltyData.check(condition)) {
				$(conditionDiv).addClass("selectable");
				$(conditionDiv)
					.off()
					.on("click", () => {
						let removeHighlights = this.toggleSelected(conditionDiv);
						penaltyData.apply(condition, removeHighlights);
					});
			} else {
				$(conditionDiv).removeClass("selectable");
			}
		});
		// Relay msnry
		this.msnry.layout();
	}
}
