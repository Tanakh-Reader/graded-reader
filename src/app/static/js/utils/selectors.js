export const CLASS = {
	algorithm: ".algorithm",

	passageCard: ".passage-card",

	// styling
	passageListItem: ".passage-list-item",
};

// ----------------------------------------------------------------
// DATA ATTRIBUTES
// ----------------------------------------------------------------

// for JQuery e.attr()
const DATA_BASE = "data-";

export const DATA = {
	// Algorithm
	algorithmId: DATA_BASE + "algorithm-id",
	algorithmObject: DATA_BASE + "algorithm-object",

	passageId: DATA_BASE + "passage-id",
	passagePenalty: DATA_BASE + "passage-penalty",
	passageBook: DATA_BASE + "passage-book",
	passageWordCount: DATA_BASE + "passage-word-count",
	passageRef: DATA_BASE + "passage-ref",
	passageRefAbbr: DATA_BASE + "passage-ref-abbr",

	passagePenalties: DATA_BASE + "passage-penalties",
	passageIndex: DATA_BASE + "passage-index",

	// penalty
	penaltyCondition: DATA_BASE + "penalty-condition",

	formIndex: DATA_BASE + "form-index",
};
