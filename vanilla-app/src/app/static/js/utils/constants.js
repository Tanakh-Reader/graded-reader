export const READ_PAGE = "/read";
export const PASSAGES_PAGE = "/passages";
export const COMPARE_PAGE = "/passages/compare";

// API ENDPOINTS
export const DATA_LOADED_API = "/api/check-data-ready";
export const GET_HEBREW_TEXT_API = "/api/hebrew-text";
export const GET_ALGORITHM_FORM_API = "/api/algorithm-form";
export const GET_BOOKS_API = "/api/get-books";
export const POST_ALGORITHM_API = "/api/algorithm";
export const DELETE_WORDS_API = "/api/delete-words";
export const DELETE_PASSAGES_API = "/api/delete-passages";
export const DELETE_ALGORITHM_API = "/api/delete-algorithm";

// PUB / SUB EVENTS
export const TEXT_LOADED_EVENT = "hebrewTextLoaded";
export const ALG_FORM_LOADED_EVENT = "algorithmFormLoaded";

// WORD ATTRIBUTES
export const W_ID = "id";
export const W_BOOK = "book";
export const W_CHAPTER = "chapter";
export const W_VERSE = "verse";
export const W_TEXT = "text";
export const W_TRAILER = "trailer";
export const W_SPEECH = "speech";
export const W_PERSON = "person";
export const W_GENDER = "gender";
export const W_NUMBER = "number";
export const W_VERB_TENSE = "verb_tense";
export const W_VERB_STEM = "verb_stem";
export const W_SUFFIX_PERSON = "suffix_person";
export const W_SUFFIX_GENDER = "suffix_gender";
export const W_SUFFIX_NUMBER = "suffix_number";
export const W_GLOSS = "gloss";
export const W_LEX_FREQUENCY = "lex_frequency";
export const W_OCC_FREQUENCY = "occ_frequency";
export const W_PENALTY = "penalty";
export const W_LEX_ID = "lex_id";

export const W_LEX = "lex";
export const W_NAME_TYPE = "name_type";
export const W_LEX_SET = "lex_set";
export const W_STATE = "state";
export const W_LANGUAGE = "language";

export const W_QERE = "qere";
export const W_KETIV = "ketiv";

// Morphemes
export const W_NOMINAL_ENDING = "nominal_ending";
export const W_PREFORMATIVE = "preformative";
export const W_PRONOMINAL_SUFFIX = "pronominal_suffix";
export const W_UNIVALENT_FINAL = "univalent_final";
export const W_VERBAL_ENDING = "verbal_ending";
export const W_ROOT_FORMATION = "root_formation";

// Feature matching rules
export const EQUALS = "EQUALS";
export const EXISTS = "EXISTS";

// API Tasks
export const TASKS = {
	RUN_ALGORITHM: "RUN_ALGORITHM",
	SAVE: "SAVE",
};

// Form values
export const FIELD_NULL_VALUE = "na";
export const FIELD_NULL_NAME = "N/A";

// Hyperlinks for other Bible resources
export const HYPERLINKS = {
	// Resources using BHSA
	SHEBANQ: {
		// e.g., https://shebanq.ancient-data.org/hebrew/text?version=4b&book=Genesis&chapter=1&verse=1
		// shebanq book format
		URI: "https://shebanq.ancient-data.org/hebrew/text?version=4b&",
		BOOK: "book=",
		CHAPTER: "&chapter=",
		VERSE: "&verse=",
		BOOK_KEY: "name_shebanq",
	},
	PARABIBLE: {
		// e.g., https://parabible.com/1-Samuel/2#1
		// most book name formats are supported.
		URI: "https://parabible.com",
		BOOK: "/",
		CHAPTER: "/",
		VERSE: "#",
		BOOK_KEY: "name_osis",
	},
	BIBLE_OL: {
		// e.g., https://bibleol.3bmoodle.dk/text/show_text/ETCBC4/Genesis/1
		// shebanq book format
		URI: "https://bibleol.3bmoodle.dk/text/show_text/ETCBC4",
		BOOK: "/",
		CHAPTER: "/",
		VERSE: null,
		BOOK_KEY: "name_shebanq",
	},
	// Other Hebrew resources
	LOGOS: {
		// e.g., logosres:bhssesb;ref=BibleBHS.Genesis8.1
		// most book name formats are supported.
		URI: "logosres:bhssesb;ref=BibleBHS",
		BOOK: ".",
		CHAPTER: "",
		VERSE: ".",
		BOOK_KEY: "name_osis",
	},
	CLEAR_BIBLE: {
		// e.g., https://doric-symphony-preview.netlify.app/?workspace=reading&osisRef=Gen.1.1
		// OSIS book format
		URI: "https://doric-symphony-preview.netlify.app/?workspace=reading&",
		BOOK: "osisRef=",
		CHAPTER: ".",
		VERSE: ".",
		BOOK_KEY: "name_osis",
	},
	STEP_BIBLE: {
		// e.g., https://www.stepbible.org/?q=version=THOT|version=ESV|reference=Gen.1&options=NVUHGV&display=INTERLEAVED
		// most book name formats are supported.
		URI: "https://www.stepbible.org/?q=version=THOT|version=ESV|",
		BOOK: "reference=",
		CHAPTER: ".",
		VERSE: ".",
		BOOK_KEY: "name_osis",
	},
};
