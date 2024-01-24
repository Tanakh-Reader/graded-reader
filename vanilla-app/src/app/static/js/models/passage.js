import * as constants from "../utils/constants.js";
import { COLORS } from "../utils/theme.js";
import * as utils from "../utils/utils.js";

export class Passage {
	constructor(passageData) {
		this.id = passageData[constants.P_ID];
		this.startWord = passageData[constants.P_START_WORD];
		this.endWord = passageData[constants.P_END_WORD];
		this.book = passageData[constants.P_BOOK];
		this.startChapter = passageData[constants.P_START_CHAPTER];
		this.endChapter = passageData[constants.P_END_CHAPTER];
		this.startVerse = passageData[constants.P_START_VERSE];
		this.endVerse = passageData[constants.P_END_VERSE];
		this.wordCount = passageData[constants.P_WORD_COUNT];
		this.penalty = passageData[constants.P_PENALTY];
		this.tags = passageData[constants.P_TAGS];
		this.reference = passageData[constants.P_REFERENCE];
		this.referenceAbbr = passageData[constants.P_REFERENCE_ABBR];
		this.penaltyData = passageData[constants.P_PENALTY_DATA];
	}
}
