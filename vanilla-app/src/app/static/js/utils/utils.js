import * as constants from "./constants.js";
import api from "./api.js";
import { Word } from "../models/word.js";

let cached_books = null;
let cached_algorithms = null;
let cached_words = null;

export async function getBooks() {
	if (cached_books === null) {
		console.log("HITTING API - BOOKS");
		cached_books = await api.getAllBooks();
	}
	return cached_books;
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

export async function getAlgorithms() {
	if (cached_algorithms === null) {
		console.log("HITTING API - ALGORITHMS");
		cached_algorithms = await api.getAllAlgorithms();
	}
	return cached_algorithms;
}

export async function getAlgorithmById(id) {
	let _algorithms = await getAlgorithms();
	const algIndex = _algorithms.findIndex((alg) => alg.id === id);
	const algorithm = _algorithms[algIndex];
	return algorithm;
}

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

// Submit a passage to render on the read screen.
export function submitPassageSelection(
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

/**
 * get all .word spans in <div> and return as <Word> objects
 *
 * @param {HTMLElement} [div=null]
 * @returns {Array<Word>}
 */
export function getWords(div = null) {
	if (cached_words === null || div != null) {
		let _div = div || document;
		let wordSpans = $(_div).find(".word");
		// Map wordDivs' data into <Word> objects
		let words = wordSpans
			.map((i, wordSpan) => {
				return new Word(wordSpan);
			})
			.get();
		// Don't cache words if we're only fetching a div's worth.
		if (div != null) {
			return words;
		}
		cached_words = words;
	}
	return cached_words;
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

// export default {
//   setParamIfValid,
//   isReferenceMatch,
//   contextToJson,
//   getBookByName,
//   getBookByNumber,
//   submitPassageSelection
// }
