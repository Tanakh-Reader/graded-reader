import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";
import { getBackgroundColorByPenalty } from "../passages.js";

class PassageSelectorDropdown {
	constuctor() {}

	init() {
		this.passagesDropdownMenu = $(".passage-dropdown");
		this.dropdownList = this.passagesDropdownMenu.find("ul");
		this.passageItems = this.dropdownList.find(".passage-dropdown-item");
		this.addListeners();
		console.log("INIT");
	}

	addListeners() {
		events.addListeners(
			["DOMContentLoaded", constants.ALG_FORM_LOADED_EVENT],
			(event) => {
				this.passageItems.each((i, item) => {
					this.colorPassageItem(item);
					item.addEventListener("click", this.selectPassage);
				});

				$(".searchInput").each((i, input) => {
					$(input).on("input", this.filterDropdown);
				});

				$(".passage-dropdown-btn").each((index, input) => {
					console.log("init, btn");
					$(input).on("click", this.showDropdown);
				});
			},
		);
	}

	// Scroll in the dropdown to the current passage.
	scrollToSelectedPassage(reference) {
		this.passageItems.each((i, passageItem) => {
			if (passageItem.getAttribute("data-ref").trim() === reference) {
				passageItem.style.fontWeight = "bold";
				this.dropdownList[0].scrollTop =
					passageItem.offsetTop - this.dropdownList[0].offsetTop;
			} else {
				passageItem.style.fontWeight = "";
			}
		});
	}

	showDropdown(event) {
		console.log(event);
		// Get the button that triggered the event and its position.
		let button = event.target;
		let rect = button.getBoundingClientRect();

		// Set the position of the dropdown menu.
		this.passagesDropdownMenu[0].style.top =
			rect.top + window.scrollY + button.offsetHeight + "px";
		this.passagesDropdownMenu[0].style.left = rect.left + window.scrollX + "px";

		// Toggle the dropdown menu and button class.
		if ($(button).hasClass("selected")) {
			// If the dropdown is already open (button has 'selected' class), hide it.
			this.passagesDropdownMenu.hide();
			$(button).removeClass("selected");
		} else {
			// If the dropdown is closed, show it and mark the button as 'selected'.
			this.passagesDropdownMenu.show();
			$(button).addClass("selected");
			this.scrollToSelectedPassage(); // Ensure the selected passage is in view.
		}
	}

	filterDropdown() {
		const searchTerm = $(".searchInput").val();
		this.passageItems.each(function () {
			const ref = $(this).data("ref");
			if (utils.isReferenceMatch(searchTerm, ref)) {
				$(this).show();
			} else {
				$(this).hide();
			}
		});
	}

	colorPassageItem(passage) {
		const wordCount = passage.getAttribute("data-word-count");
		const penalty = passage.getAttribute("data-penalty");
		const color = getBackgroundColorByPenalty(penalty);

		const gradientPercentage = Math.min(wordCount / 500, 1) * 100;

		passage.style.background = `linear-gradient(90deg, ${color} ${gradientPercentage}%, white ${gradientPercentage}%)`;
	}

	selectPassage(passage) {
		let selectedReference = $(passage).data("ref-abbr");
		// Update the button text.
		let selectedBtn = $(".passage-dropdown-btn .selected");
		selectedBtn.text(selectedReference);
		selectedBtn.attr("data-id", $(passage).data("id"));
		selectedBtn.removeClass("selected");
		// Dismiss the dropdown.
		this.passagesDropdownMenu.hide();
	}
}

console.log("SELECTOR");
const passageSelectorDropdown = new PassageSelectorDropdown();
passageSelectorDropdown.init();
