import * as constants from "./constants.js";
import * as utils from "./utils.js";
import apis from "./api.js";

export function buildAlgorithmDisplay(algJSON, id) {
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
