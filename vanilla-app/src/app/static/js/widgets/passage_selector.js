import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";
import { getBackgroundColorByPenalty } from "../passages.js";
import { Passage } from "../models/passage.js";

class PassageSelectorDropdown {
	async init() {
		this.passagesDropdownMenu = $(".passage-dropdown");
		this.dropdownList = this.passagesDropdownMenu.find("ul");
		this.passageItems = await this.buildPassageDropdown();
		this.addListeners();
	}

	addButtonListener() {
		// Unbind any existing listeners
		$(".passage-dropdown-btn").off();
		$(".passage-dropdown-btn").on("click", this.showDropdown.bind(this));
	}

	addListeners() {
		// Dropdown buttons
		this.addButtonListener();
		// Click on passage dropdown items
		this.passageItems.each((i, item) => {
			this.colorPassageItem(item);
			item.addEventListener("click", this.selectPassage.bind(this));
		});
		// Type into the search box.
		$(".search-input").on("input", this.filterDropdown.bind(this));
		// Handle re-initialization for dropdown buttons
		events.addListeners(
			[
				constants.PASSAGE_WIDGET_ADDED_EVENT,
				constants.TEXT_FETCHED_COMPLETED_EVENT,
			],
			() => {
				this.addButtonListener(); // Call the method directly
			},
		);
	}

	/**
	 * build passage items list with passage objects from DB
	 *
	 * @returns {Promise<JQuery<HTMLElement>>}
	 */
	async buildPassageDropdown() {
		let passages = await utils.getPassages();
		let listItemTemplate = this.dropdownList.find("li")[0];
		this.dropdownList.empty(); // Clear existing list items

		passages.forEach((passage) => {
			let listItem = $(listItemTemplate).clone();
			$(listItem)
				.attr({
					"data-id": passage.id,
					"data-ref": passage.reference,
					"data-ref-abbr": passage.referenceAbbr,
					"data-word-count": passage.wordCount,
					"data-penalty": passage.penalty,
				})
				.text(passage.reference);
			this.dropdownList.append(listItem);
		});

		return this.dropdownList.find("li");
	}

	/**
	 * Scroll in the dropdown to the current passage.
	 *
	 * @param {String} [reference]
	 */
	scrollToSelectedPassage(reference) {
		this.passageItems.each((i, passageItem) => {
			if (
				passageItem.getAttribute("data-ref-abbr").trim() === reference.trim()
			) {
				passageItem.style.fontWeight = "bold";
				this.dropdownList[0].scrollTop =
					passageItem.offsetTop - this.dropdownList[0].offsetTop;
			} else {
				passageItem.style.fontWeight = "";
			}
		});
	}

	/**
	 * @param {any} event
	 */
	showDropdown(event) {
		// Get the button that triggered the event and its position.
		let button = event.target;
		let rect = button.getBoundingClientRect();
		this.passagesDropdownMenu = $(".passage-dropdown");

		let topPosition = rect.top + window.scrollY + button.offsetHeight;
		let leftPosition = rect.left + window.scrollX;

		this.passagesDropdownMenu.css({
			top: topPosition + "px",
			left: leftPosition + "px",
		});

		// Toggle the dropdown menu and button class.
		if ($(button).hasClass("selected")) {
			// If the dropdown is already open (button has 'selected' class), hide it.
			this.passagesDropdownMenu.hide();
			$(button).removeClass("selected");
		} else {
			// Deselect any other selected buttons.
			$(".passage-dropdown-btn.selected").removeClass("selected");
			// If the dropdown is closed, show it and mark the button as 'selected'.
			this.passagesDropdownMenu.show();
			$(button).addClass("selected");
			this.scrollToSelectedPassage($(button).text()); // Ensure the selected passage is in view.
		}
	}

	/**
	 * @param {InputEvent} event
	 */
	filterDropdown(event) {
		const searchTerm = $(event.target).val();
		this.passageItems.each(function () {
			const ref = $(this).data("ref");
			if (utils.isReferenceMatch(searchTerm, ref)) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	}

	/**
	 * @param {HTMLElement} passageDiv
	 */
	colorPassageItem(passageDiv) {
		const wordCount = $(passageDiv).data("word-count");
		const penalty = $(passageDiv).data("penalty");
		const color = getBackgroundColorByPenalty(penalty);

		const gradientPercentage = Math.min(wordCount / 500, 1) * 100;

		passageDiv.style.background = `linear-gradient(90deg, ${color} ${gradientPercentage}%, white ${gradientPercentage}%)`;
	}

	/**
	 * @param {MouseEvent} event
	 */
	selectPassage(event) {
		let selectedBtn = $(".passage-dropdown-btn.selected");
		// Publish an event that will be consumed and handled elsewhere.
		events.publish(constants.TEXT_SUBMITTED_BY_PASSAGE_SELECTOR_EVENT, {
			passageId: $(event.target).data("id"),
			div: $(selectedBtn).closest(".passage-widget")[0],
		});
		this.passagesDropdownMenu.hide();
	}
}

$(window).on("load", () => {
	const passageSelectorDropdown = new PassageSelectorDropdown();
	passageSelectorDropdown.init();
});
