import * as utils from "./utils/utils.js";
import * as constants from "./utils/constants.js";
import * as sel from "./utils/selectors.js";
import { Passage } from "./models/passage.js";

class PassageCards {
	constructor() {
		this.selectedPassages = [];
	}

	init() {
		utils.getPassages();
		this.passageCards = $(sel.CLASS.passageCard);
		this.applyBackgroundColorToPassages();
		this.setListeners();
	}

	setListeners() {
		$(".sort-btn").on("click", this.sortPassages.bind(this));
		$(".search-btn").on("click", this.filterPassages.bind(this));
		$(".submit-passages-btn").on(
			"click",
			this.submitSelectedPassages.bind(this),
		);
		$(".passage-select").on("click", this.selectPassage.bind(this));
		$(".open-passage").on("click", this.selectPassage.bind(this));
		$("#search-input").on("input", this.searchPassages.bind(this));
		$(".open-passage").on("click", this.submitPassage.bind(this));
	}

	selectPassage(event) {
		const checkbox = event.target;
		const passageCard = checkbox.closest(sel.CLASS.passageCard);

		if (checkbox.checked) {
			if (this.selectedPassages.length < constants.maxTextWidgets) {
				this.selectedPassages.push(passageCard);
			} else {
				checkbox.checked = false;
				alert(
					`You can only select up to ${constants.maxTextWidgets} passages.`,
				);
			}
		} else {
			// remove the passage when unchecked.
			this.selectedPassages = this.selectedPassages.filter(
				(card) => card !== passageCard,
			);
		}
	}

	submitSelectedPassages() {
		if (
			this.selectedPassages.length >= constants.minTextWidgets &&
			this.selectedPassages.length <= constants.maxTextWidgets
		) {
			const passageIds = this.selectedPassages.map((card) =>
				$(card).attr(sel.DATA.passageId),
			);
			const queryParams = new URLSearchParams();
			passageIds.forEach((id) => utils.setParamIfValid(queryParams, "id", id));
			window.location.href = `${
				constants.COMPARE_PAGE
			}?${queryParams.toString()}`;
		} else {
			alert(
				`Please select between ${constants.minTextWidgets} to ${constants.maxTextWidgets} passages.`,
			);
		}
	}

	// Search a passage via a reference.
	searchPassages() {
		const searchTerm = $("#search-input").val();
		const bookFilter = $("#book").val();

		this.passageCards.each((i, psg) => {
			const ref = $(psg).attr(sel.DATA.passageRef);
			const passageBook = $(psg).attr(sel.DATA.passageBook);
			const isBookMatch = bookFilter === "ALL" || bookFilter === passageBook;
			const isRefMatch = utils.isReferenceMatch(searchTerm, ref);

			if (isBookMatch && isRefMatch) {
				$(psg).css("display", "block");
			} else {
				$(psg).css("display", "none");
			}
		});
	}

	submitPassage(event) {
		const passageCard = event.target.closest(sel.CLASS.passageCard);
		const passageId = $(passageCard).attr(sel.DATA.passageId);
		const passage = utils.getPassageById(passageId);
		utils.submitPasssageSelection(passage);
	}

	applyBackgroundColorToPassages() {
		this.passageCards.each((i, card) => {
			const penalty = parseFloat($(card).attr(sel.DATA.passagePenalty));
			const bgColor = utils.getBackgroundColorByPenalty(penalty);
			card.style.backgroundColor = bgColor;
		});
	}

	filterPassages() {
		let bookNumber = $("#book").val();
		this.passageCards.each((i, card) => {
			let passageBookNumber = $(card).attr(sel.DATA.passageBook);
			if (bookNumber === "ALL" || passageBookNumber === bookNumber) {
				$(card).show();
			} else {
				$(card).hide();
			}
		});
	}

	sortPassages() {
		let sortBy = $("#sort").val();
		let sortOrder = $("#order").val();
		let sortedPassages = Array.from(this.passageCards).sort((a, b) => {
			let aValue, bValue;

			switch (sortBy) {
				case "word_count":
					aValue = parseInt($(a).attr(sel.DATA.passageWordCount));
					bValue = parseInt($(b).attr(sel.DATA.passageWordCount));
					break;
				case "id":
					aValue = parseInt($(a).attr(sel.DATA.passageId));
					bValue = parseInt($(b).attr(sel.DATA.passageId));
					break;
				case "penalty":
					aValue = parseInt($(a).attr(sel.DATA.passagePenalty));
					bValue = parseInt($(b).attr(sel.DATA.passagePenalty));
					break;
			}

			if (aValue < bValue) {
				return sortOrder === "asc" ? -1 : 1;
			} else if (aValue > bValue) {
				return sortOrder === "asc" ? 1 : -1;
			} else {
				return 0;
			}
		});

		let container = document.getElementById("passages-container");
		container.innerHTML = "";
		sortedPassages.forEach((passage) => container.appendChild(passage));
	}
}

const passageCards = new PassageCards();
$(window).on("load", (event) => {
	passageCards.init();
});
