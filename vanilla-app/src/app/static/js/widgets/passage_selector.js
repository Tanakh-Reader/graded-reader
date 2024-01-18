/* See passages_compare.js for an example of how to override this.

```
document.querySelectorAll('.passage-dropdown-item').forEach(item => {
        item.addEventListener('click', event => selectPassage(event.target));
    });
```
*/

import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";
import { getBackgroundColorByPenalty } from "../passages.js";

window.currentButton = null;

// Scroll to current passage.
function scrollToSelectedPassage() {
	let reference = currentButton.textContent.trim();
	let dropdownList = passagesDropdownMenu.querySelector("ul");
	let passageItems = dropdownList.querySelectorAll(".passage-dropdown-item");
	for (let passageItem of passageItems) {
		if (passageItem.getAttribute("data-ref").trim() === reference) {
			passageItem.style.fontWeight = "bold";
			dropdownList.scrollTop = passageItem.offsetTop - dropdownList.offsetTop;
		} else {
			passageItem.style.fontWeight = "";
		}
	}
}

function showDropdown(button) {
	// Get positioning.
	let rect = button.getBoundingClientRect();
	passagesDropdownMenu.style.top =
		rect.top + window.scrollY + button.offsetHeight + "px";
	passagesDropdownMenu.style.left = rect.left + window.scrollX + "px";

	if (button.classList.contains("selected")) {
		// Button was clicked while dropdown was open.
		passagesDropdownMenu.style.display = "none";
		button.classList.remove("selected");
	} else {
		// Button was clicked while dropdown was closed.
		passagesDropdownMenu.style.display = "block";
		button.classList.add("selected");
		currentButton = button;
		scrollToSelectedPassage();
	}
}

// Search a passage via a reference.
function filterDropdown() {
	const searchTerm = $("#searchInput").val();
	const dropdownItems = $(".passage-dropdown-item");
	dropdownItems.each(function () {
		const ref = $(this).data("ref");
		const isRefMatch = utils.isReferenceMatch(searchTerm, ref);

		if (isRefMatch) {
			$(this).css("display", "block");
		} else {
			$(this).css("display", "none");
		}
	});
}

function colorPassageItem(passage) {
	const wordCount = passage.getAttribute("data-word-count");
	const penalty = passage.getAttribute("data-penalty");
	const color = getBackgroundColorByPenalty(penalty);

	const gradientPercentage = Math.min(wordCount / 500, 1) * 100;

	passage.style.background = `linear-gradient(90deg, ${color} ${gradientPercentage}%, white ${gradientPercentage}%)`;
}

function selectPassage(passage) {
	let selectedReference = $(passage).data("ref-abbr");
	// Update the button text.
	$(currentButton).text(selectedReference);
	$(currentButton).attr("data-id", $(passage).data("id"));
	currentButton.classList.remove("selected");
	// Dismiss the dropdown.
	passagesDropdownMenu.style.display = "none";
}

events.addListeners(
	["DOMContentLoaded", constants.ALG_FORM_LOADED_EVENT],
	(event) => {
		document.querySelectorAll(".passage-dropdown-item").forEach((item) => {
			colorPassageItem(item);
			item.addEventListener("click", (event) => selectPassage(event.target));
		});

		window.showDropdown = showDropdown;
		window.filterDropdown = filterDropdown;

		// Needs to be here for the algorithm page, for some reason.
		window.passagesDropdownMenu = document.querySelector(".passage-dropdown");
	},
);
