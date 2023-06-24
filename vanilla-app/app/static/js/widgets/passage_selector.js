
/* See passages_compare.js for an example of how to override this.

```
document.querySelectorAll('.passage-item').forEach(item => {
        item.addEventListener('click', event => selectPassage(event.target));
    });
```
*/

import * as utils from '../utils/utils.js';
import * as constants from '../utils/constants.js';
import { getBackgroundColorByPenalty } from '../passages.js';

// Scroll to current passage.
function scrollToSelectedPassage() {
    let reference = currentButton.textContent.trim();
    let dropdownList = dropdownMenu.querySelector("ul");
    let passageItems = dropdownList.querySelectorAll(".passage-item");
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
    dropdownMenu.style.top = (rect.top + window.scrollY + button.offsetHeight) + "px";
    dropdownMenu.style.left = (rect.left + window.scrollX) + "px";

    if (currentButton === button) {
        // Button was clicked while dropdown was open.
        dropdownMenu.style.display = "none";
        currentButton = null;
    } else {
        // Button was clicked while dropdown was closed.
        dropdownMenu.style.display = "block";
        currentButton = button;
        scrollToSelectedPassage();
    }
}

// Search a passage via a reference.
function filterDropdown() {
    const searchTerm = $("#searchInput").val();
    const dropdownItems = $(".passage-item");
    dropdownItems.each(function () {
        const ref = $(this).data("ref");
        const isRefMatch = utils.isReferenceMatch(searchTerm, ref)

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
    const selectedReference = $(passage).data("ref");
    // Update the button text.
    $(currentButton).text(selectedReference);
    $(currentButton).attr("data-id", $(passage).data("id"));
    console.log($(currentButton));
    // Dismiss the dropdown.
    dropdownMenu.style.display = "none";
    currentButton = null;
}

window.addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll('.passage-item').forEach(item => {
        colorPassageItem(item);
        item.addEventListener('click', event => selectPassage(event.target));
    });
});

window.showDropdown = showDropdown;
window.filterDropdown = filterDropdown;
// See usage in <passages_compare.js>
window.currentButton = null;
window.dropdownMenu = document.getElementById("dropdown-menu");
