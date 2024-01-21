import * as constants from "./constants.js";
import api from "./api.js";
import { Word } from "../models/word.js";
import { Passage } from "../models/passage.js";
import { Algorithm } from "../models/algorithm.js";

let cachedBooks = null;
let cachedAlgorithms = {};
let cachedPassages = {};
let cachedWords = {};

// ----------------------------------------------------------------
// GET
// DATA
// ----------------------------------------------------------------

// GET BOOKS
// ----------------------------------------------------------------

export async function getBooks() {
	if (cachedBooks === null) {
		console.log("HITTING API - BOOKS");
		let result = await api.getAllBooks();
		cachedBooks = result;
	}
	return cachedBooks;
}

export async function getBookByNumber(number) {
	let _books = await getBooks();
	number = parseInt(number);
	const bookIndex = _books.findIndex((book) => book.number === number);
	const book = _books[bookIndex];
	return book;
}

export async function getBookByName(name) {
	let _books = await getBooks();
	const bookIndex = _books.findIndex((book) => book.name === name);
	const book = _books[bookIndex];
	return book;
}

// GET ALGORITHMS
// ----------------------------------------------------------------

/**
 * get all algorithms from DB
 *
 * @param {Boolean} [asArray=true]
 * @returns {Promise<Object<String, Object>>}
 */
export async function getAlgorithms(asArray = true) {
	if (Object.keys(cachedAlgorithms).length < 1) {
		console.log("HITTING API - ALGORITHMS");
		let result = await api.getAllAlgorithms();
		result.forEach((algObj) => {
			let algorithm = new Algorithm(algObj);
			cachedAlgorithms[algorithm.id.toString()] = algorithm;
		});
	}
	if (asArray) {
		return Object.values(cachedAlgorithms);
	}
	return cachedAlgorithms;
}

/**
 * get all .word spans in <div> and return as <Word> objects
 *
 * @param {any} [id]
 * @returns {Algorithm}
 */
export function getAlgorithmById(id) {
	return getAlgorithms(false)[id.toString()];
}

// GET PASSAGES
// ----------------------------------------------------------------

/**
 * get all passages from DB
 *
 * @param {Boolean} [asArray=true]
 * @returns {Promise<Object<String, Passage>>}
 */
export async function getPassages(asArray = true) {
	if (Object.keys(cachedPassages).length < 1) {
		console.log("HITTING API - PASSAGES");
		let result = await api.getAllPassages();
		result.forEach((passageObj) => {
			let passage = new Passage(passageObj);
			cachedPassages[passage.id.toString()] = passage;
		});
	}
	if (asArray) {
		return Object.values(cachedPassages);
	}
	return cachedPassages;
}

/**
 * get all .word spans in <div> and return as <Word> objects
 *
 * @param {any} [id]
 * @returns {Passage}
 */
export function getPassageById(id) {
	return getPassages(false)[id.toString()];
}

// GET WORDS
// ----------------------------------------------------------------

/**
 * get all .word spans in <div> and return as <Word> objects
 *
 * @param {HTMLElement} [div=null]
 * @param {Boolean} [asArray=true]
 * @returns {Object<String, Word>}
 */
export function getWords(div = null, asArray = true) {
	if (Object.keys(cachedWords).length < 1 || div != null) {
		console.log("FETCHING - WORDS");
		let _div = div || document;
		let wordSpans = $(_div).find(".word");
		// Map wordDivs' data into <Word> objects
		wordSpans.each(function () {
			let word = new Word(this);
			cachedWords[word.id.toString()] = word;
		});
	}
	if (asArray) {
		return Object.values(cachedWords);
	}
	return cachedWords;
}

/**
 * get all .word spans in <div> and return as <Word> objects
 *
 * @param {any} [id]
 * @returns {Word}
 */
export function getWordById(id) {
	return getWords(null, false)[id.toString()];
}

// ----------------------------------------------------------------
// OTHER
// ----------------------------------------------------------------

// Make sure a query param is valid
export function setParamIfValid(queryParams, key, value) {
	if (value !== undefined && value !== "" && value !== null) {
		queryParams.append(key, value);
	}
}

// Used to search by reference.
export function isReferenceMatch(searchTerm, reference) {
	const regex = new RegExp(searchTerm.split(" ").join(".*"), "i");
	return regex.test(reference);
}

// Convert a context object JS json
export function contextToJson(context) {
	if ([null, undefined, ""].includes(context)) {
		return context;
	}
	context = context.replace(/'/g, '"').replace(/None/g, null);
	return JSON.parse(context);
}

export function getBookAndChapter(clickEvent) {
	if (window.location.href.includes(constants.COMPARE_PAGE)) {
		// The main read page.
	} else {
		return null;
	}
}

export async function openHyperlink(hyperlinkKey, bookNumber, chapter) {
	let hyperlinkObj = constants.HYPERLINKS[hyperlinkKey];
	let book = await getBookByNumber(bookNumber);
	let bookName = book[hyperlinkObj.BOOK_KEY];
	let uri =
		hyperlinkObj.URI +
		hyperlinkObj.BOOK +
		bookName +
		hyperlinkObj.CHAPTER +
		chapter;
	console.log(uri);
	window.open(uri, "_blank");
}

/**
 * Submit a passage to render on the read screen.
 *
 * @param {Passage} [passage]
 */
export function submitPasssageSelection(passage) {
	submitTextSelection(
		passage.book,
		passage.startChapter,
		passage.startVerse,
		passage.endChapter,
		passage.endVerse,
	);
}

// Submit text to render on the read screen.
export function submitTextSelection(
	bookNumber,
	startChapter,
	startVerse,
	endChapter,
	endVerse,
) {
	const queryParams = new URLSearchParams();

	setParamIfValid(queryParams, "bk", bookNumber);
	setParamIfValid(queryParams, "ch_s", startChapter);
	setParamIfValid(queryParams, "vs_s", startVerse);
	setParamIfValid(queryParams, "ch_e", endChapter);
	setParamIfValid(queryParams, "vs_e", endVerse);

	const newUrl = `${window.location.origin}${
		constants.READ_PAGE
	}?${queryParams.toString()}`;

	if (window.location.href.includes(constants.PASSAGES_PAGE)) {
		window.open(newUrl);
	} else {
		window.location.href = newUrl;
	}
}

export function showToast(message, duration) {
	const toast = document.createElement("div");
	toast.textContent = message;
	toast.classList.add("toast");
	document.body.appendChild(toast);
	setTimeout(() => {
		document.body.removeChild(toast);
	}, duration);
}

export function getGradientColor(penalty) {
	penalty = parseFloat(penalty);
	const green = [0, 0, 0];
	const red = [255, 0, 0];
	const ratio = penalty / 10;

	const r = green[0] + ratio * (red[0] - green[0]);
	const g = green[1] + ratio * (red[1] - green[1]);
	const b = green[2] + ratio * (red[2] - green[2]);

	return `rgb(${r}, ${g}, ${b})`;
}
