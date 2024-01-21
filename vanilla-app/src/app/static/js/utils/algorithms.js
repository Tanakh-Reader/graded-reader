import * as constants from "./constants.js";
import * as utils from "./utils.js";
import apis from "./api.js";
import { PenaltyData } from "../models/penalty.js";
import { Algorithm } from "../models/algorithm.js";
/**
 * @param {Algorithm} [algorithm]
 * @param {String} [id]
 * @param {Boolean} [asMasonry]
 */
export function buildAlgorithmDisplay(algorithm, id, asMasonry = false) {
	const pillClasses = "bg-yellow-50 rounded px-2 border border-yellow-300";

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
		$(div).empty();
		$(div).hide();
	});

	if (algorithm.frequencies.length > 0) {
		freqsDiv.html(`
		<div class="font-bold">Lexical Frequencies</div>
		`);
		algorithm.frequencies.forEach((freq) => {
			const freqDiv = document.createElement("div");
			const minOcc = freq[0];
			const maxOcc = freq[1];
			const penalty = freq[2];
			freqDiv.dataset.condition = `${minOcc}-${maxOcc}`;
			freqDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${minOcc} - ${maxOcc} occ.
            `;
			freqsDiv.append(freqDiv);
		});
		freqsDiv.css("display", "flex");
	}

	freqExtrasDiv.html(`
	<div class="${pillClasses}" data-condition="fillers">את: <span class="font-bold text-red-500">${algorithm.includeStopWords}</span></div>
	<div class="${pillClasses}" data-condition="repeats"><span class="font-bold text-red-500">-${algorithm.taperDiscount}</span> / occ.</div>
	<div class="${pillClasses}" data-condition="proper_nouns">PN ÷ <span class="font-bold text-red-500">${algorithm.properNounDivisor}</span></div>
	<div class="${pillClasses}" data-condition="qere"><span class="font-bold text-red-500">${algorithm.qerePenalty}</span>: Q/K</div>
	`);

	if (algorithm.verbs.length > 0) {
		verbsDiv.html(`
		<div class="font-bold">Verbs</div>
		`);
		algorithm.verbs.forEach((morph) => {
			const morphDiv = document.createElement("div");
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
			morphDiv.dataset.condition = conditionText.substring(
				0,
				conditionText.length - 1,
			);
			morphDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${text.substring(
							0,
							text.length - 2,
						)}
            `;
			verbsDiv.append(morphDiv);
		});
		verbsDiv.css("display", "flex");
	}

	verbExtrasDiv.html(`
	<div class="${pillClasses}" data-condition="stems">Stems: <span class="font-bold text-red-500">${algorithm.penalizeByVerbStem}</span></div>
	`);

	if (algorithm.constructNouns.length > 0) {
		nounsDiv.html(`
		<div class="font-bold">Construct Nouns</div>
		`);
		algorithm.constructNouns.forEach((noun) => {
			const nounDiv = document.createElement("div");
			const chainLength = noun[0];
			const penalty = noun[1];
			nounDiv.dataset.condition = chainLength;
			nounDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${chainLength}-noun chain
            `;
			nounsDiv.append(nounDiv);
		});
		nounsDiv.css("display", "flex");
	}

	if (algorithm.clauses.length > 0) {
		clausesDiv.html(`
		<div class="font-bold">Clause/Phrase Types</div>
		`);
		algorithm.clauses.forEach((clause) => {
			const clauseDiv = document.createElement("div");
			const clauseType = clause[0];
			const penalty = clause[1];
			clauseDiv.dataset.condition = clauseType;
			clauseDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${clauseType}`;
			clausesDiv.append(clauseDiv);
		});
		clausesDiv.css("display", "flex");
	}

	if (algorithm.phrases.length > 0) {
		phrasesDiv.html(`
		<div class="font-bold">Phrase Functions</div>
		`);
		algorithm.phrases.forEach((phrase) => {
			const phraseDiv = document.createElement("div");
			const phraseFunction = phrase[0];
			const penalty = phrase[1];
			phraseDiv.dataset.condition = phraseFunction;
			phraseDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${phraseFunction}`;
			phrasesDiv.append(phraseDiv);
		});
		phrasesDiv.css("display", "flex");
	}

	const divisor = {
		WORDS: "W",
		LEXEMES: "L",
	}[algorithm.totalPenaltyDivisor];

	configExtrasDiv.html(`
	<div class="${pillClasses}">T ÷ <span class="font-bold text-red-500">${divisor}</span></div>
	`);

	$(`#algorithm-${id}`).css("display", "flex");

	if (asMasonry) {
		var masonryGrid = document.querySelector(containerSelector);
		new Masonry(masonryGrid, {
			itemSelector: ".grid-item",
			columnWidth: masonryGrid.offsetWidth / 2,
		});
	}
}

/**
 * @param {PenaltyData} [penaltyData]
 */
export function buildAlgorithmDisplayButtons(penaltyData) {
	// const freqs = displayDiv.querySelectorAll(`.frequencies div`);
	// console.log(freqsDiv);
	// const verbs = document.querySelectorAll(`.verbs div`);
	// const nouns = document.querySelectorAll(`.nouns div`);
	// const clauses = document.querySelectorAll(`.clauses div`);
	// const phrases = document.querySelectorAll(`.phrases div`);
	let buttonClasses =
		"hover:cursor-pointer hover:opacity-70 bg-green-100 border border-green-300 rounded";
	const conditions = document.querySelectorAll(`[data-condition]`);
	conditions.forEach((conditionDiv) => {
		let condition = conditionDiv.dataset.condition;
		// console.log(condition);
		if (penaltyData.check(condition)) {
			// conditionDiv.classList = buttonClasses;
			buttonClasses.split(" ").forEach((c) => conditionDiv.classList.add(c));

			conditionDiv.addEventListener("click", () => {
				penaltyData.apply(condition, $(conditionDiv));
			});
		} else {
			buttonClasses.split(" ").forEach((c) => conditionDiv.classList.remove(c));
			// penaltyData.remove(condition, conditionDiv)
		}
	});

	// msnry.reloadItems();
	// msnry.layout();
	setTimeout(() => {
		var masonryGrid = conditions[0].closest(".data-summary-masonry");
		new Masonry(masonryGrid, {
			itemSelector: ".grid-item",
			columnWidth: masonryGrid.offsetWidth / 2,
		});
	}, 400);
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
