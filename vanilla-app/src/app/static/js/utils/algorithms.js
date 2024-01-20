import * as constants from "./constants.js";
import * as utils from "./utils.js";
import apis from "./api.js";

export function buildAlgorithmDisplay(algJSON, id, asMasonry = false) {
	const pillClasses = "bg-yellow-50 rounded px-2 border border-yellow-300";

	let containerSelector = `#algorithm-${id} .data-summary`;
	if (asMasonry) {
		document.querySelector(containerSelector).style.display = "none";
		containerSelector += "-masonry";
		document.querySelector(containerSelector).style.display = "flex";
	}

	const freqs = algJSON.frequencies;
	const verbs = algJSON.verbs;
	const nouns = algJSON.construct_nouns;
	const clauses = algJSON.clauses;
	const phrases = algJSON.phrases;

	const freqsDiv = document.querySelector(`${containerSelector} .frequencies`);
	const verbsDiv = document.querySelector(`${containerSelector} .verbs`);
	const nounsDiv = document.querySelector(`${containerSelector} .nouns`);
	const clausesDiv = document.querySelector(`${containerSelector} .clauses`);
	const phrasesDiv = document.querySelector(`${containerSelector} .phrases`);

	[freqsDiv, verbsDiv, nounsDiv, clausesDiv, phrasesDiv].forEach((div) => {
		div.innerHTML = "";
		div.style.display = "none";
	});

	const freqExtrasDiv = document.querySelector(
		`${containerSelector} .frequency-extras`,
	);
	const verbExtrasDiv = document.querySelector(
		`${containerSelector} .verb-extras`,
	);
	const configExtrasDiv = document.querySelector(
		`${containerSelector} .config-extras`,
	);

	if (freqs.length > 0) {
		freqsDiv.innerHTML = `<div class="font-bold">Lexical Frequencies</div>`;
		freqs.forEach((freq) => {
			const freqDiv = document.createElement("div");
			const minOcc = freq[0];
			const maxOcc = freq[1];
			const penalty = freq[2];
			freqDiv.dataset.condition = `${minOcc}-${maxOcc}`;
			freqDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${minOcc} - ${maxOcc} occ.
            `;
			freqsDiv.appendChild(freqDiv);
		});
		freqsDiv.style.display = "flex";
	}

	freqExtrasDiv.innerHTML = `
	<div class="${pillClasses}" data-condition="fillers">את: <span class="font-bold text-red-500">${algJSON.include_stop_words}</span></div>
	<div class="${pillClasses}" data-condition="repeats"><span class="font-bold text-red-500">-${algJSON.taper_discount}</span> / occ.</div>
	<div class="${pillClasses}" data-condition="proper_nouns">PN ÷ <span class="font-bold text-red-500">${algJSON.proper_noun_divisor}</span></div>
	<div class="${pillClasses}" data-condition="qere"><span class="font-bold text-red-500">${algJSON.qere_penalty}</span>: Q/K</div>
	`;

	if (verbs.length > 0) {
		verbsDiv.innerHTML = `<div class="font-bold">Verbs</div>`;
		verbs.forEach((morph) => {
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
			verbsDiv.appendChild(morphDiv);
		});
		verbsDiv.style.display = "flex";
	}

	verbExtrasDiv.innerHTML = `
	<div class="${pillClasses}" data-condition="stems">Stems: <span class="font-bold text-red-500">${algJSON.penalize_by_verb_stem}</span></div>
	`;

	if (nouns.length > 0) {
		nounsDiv.innerHTML = `<div class="font-bold">Construct Nouns</div>`;
		nouns.forEach((noun) => {
			const nounDiv = document.createElement("div");
			const chainLength = noun[0];
			const penalty = noun[1];
			nounDiv.dataset.condition = chainLength;
			nounDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${chainLength}-noun chain
            `;
			nounsDiv.appendChild(nounDiv);
		});
		nounsDiv.style.display = "flex";
	}

	if (clauses.length > 0) {
		clausesDiv.innerHTML = `<div class="font-bold">Clause/Phrase Types</div>`;
		clauses.forEach((clause) => {
			const clauseDiv = document.createElement("div");
			const clauseType = clause[0];
			const penalty = clause[1];
			clauseDiv.dataset.condition = clauseType;
			clauseDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${clauseType}`;
			clausesDiv.appendChild(clauseDiv);
		});
		clausesDiv.style.display = "flex";
	}

	if (phrases.length > 0) {
		phrasesDiv.innerHTML = `<div class="font-bold">Phrase Functions</div>`;
		phrases.forEach((phrase) => {
			const phraseDiv = document.createElement("div");
			const phraseFunction = phrase[0];
			const penalty = phrase[1];
			phraseDiv.dataset.condition = phraseFunction;
			phraseDiv.innerHTML = `
            <span class="font-bold text-red-500">${penalty}</span>: ${phraseFunction}`;
			phrasesDiv.appendChild(phraseDiv);
		});
		phrasesDiv.style.display = "flex";
	}

	const divisor = {
		WORDS: "W",
		LEXEMES: "L",
	}[algJSON.total_penalty_divisor];

	configExtrasDiv.innerHTML = `
	<div class="${pillClasses}">T ÷ <span class="font-bold text-red-500">${divisor}</span></div>
	`;

	document.querySelector(`#algorithm-${id}`).style.display = "flex";

	if (asMasonry) {
		var masonryGrid = document.querySelector(containerSelector);
		new Masonry(masonryGrid, {
			itemSelector: ".grid-item",
			columnWidth: masonryGrid.offsetWidth / 2,
		});
	}
}


export function buildAlgorithmDisplayButtons(penaltyData) {
	// const freqs = displayDiv.querySelectorAll(`.frequencies div`);
	// console.log(freqsDiv);
	// const verbs = document.querySelectorAll(`.verbs div`);
	// const nouns = document.querySelectorAll(`.nouns div`);
	// const clauses = document.querySelectorAll(`.clauses div`);
	// const phrases = document.querySelectorAll(`.phrases div`);
	let buttonClasses = "hover:cursor-pointer hover:opacity-70 bg-green-100 border border-green-300 rounded";
	const conditions = document.querySelectorAll(`[data-condition]`);
	conditions.forEach((conditionDiv) => {
		let condition = conditionDiv.dataset.condition;
		console.log(condition);
		if (penaltyData.check(condition)) {
			// conditionDiv.classList = buttonClasses;
			buttonClasses.split(' ').forEach(c => conditionDiv.classList.add(c));


			conditionDiv.addEventListener("click", () => {
				penaltyData.apply(condition, conditionDiv);
			});
		} else {
			buttonClasses.split(' ').forEach(c => conditionDiv.classList.remove(c));
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