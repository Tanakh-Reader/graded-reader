import * as constants from "../utils/constants.js";
import * as utils from "../utils/utils.js";

export class Algorithm {
	constructor(algorithmData) {
		this.id = algorithmData[constants.A_ID];
		this.name = algorithmData[constants.A_NAME];
		this.frequencies = algorithmData[constants.A_FREQUENCIES];
		this.verbs = algorithmData[constants.A_VERBS];
		this.constructNouns = algorithmData[constants.A_CONSTRUCT_NOUNS];
		this.clauses = algorithmData[constants.A_CLAUSES];
		this.phrases = algorithmData[constants.A_PHRASES];
		this.qerePenalty = algorithmData[constants.A_QERE_PENALTY];
		this.penalizeByVerbStem = algorithmData[constants.A_PENALIZE_BY_VERB_STEM];
		this.taperDiscount = algorithmData[constants.A_TAPER_DISCOUNT];
		this.properNounDivisor = algorithmData[constants.A_PROPER_NOUN_DIVISOR];
		this.includeStopWords = algorithmData[constants.A_INCLUDE_STOP_WORDS];
		this.totalPenaltyDivisor = algorithmData[constants.A_TOTAL_PENALTY_DIVISOR];
	}
}
