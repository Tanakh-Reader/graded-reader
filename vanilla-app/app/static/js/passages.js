
import * as utils from './utils/utils.js';
import * as constants from './utils/constants.js';


let selectedPassages = [];

// TEMP CODE
let books;
export function init(booksData) {
    books = booksData;
}

function selectPassage(event) {
    const checkbox = event.target;
    const passageCard = checkbox.closest(".passage-card");

    if (checkbox.checked) {
        if (selectedPassages.length < 2) {
            selectedPassages.push(passageCard);
        } else {
            checkbox.checked = false;
            alert("You can only select two passages.");
        }
    } else {
        selectedPassages = selectedPassages.filter((card) => card !== passageCard);
    }
}

function submitSelectedPassages() {
    if (selectedPassages.length === 2) {
        const passageIds = selectedPassages.map((card) => card.getAttribute("data-id"));
        const queryParams = new URLSearchParams();
        utils.setParamIfValid(queryParams, 'p1_id', passageIds[0]);
        utils.setParamIfValid(queryParams, 'p2_id', passageIds[1]);
        window.location.href = `${constants.COMPARE_PAGE}?${queryParams.toString()}`;
    } else {
        alert("Please select exactly two passages.");
    }
}

// Search a passage via a reference.
function searchPassages() {
  const searchTerm = $("#searchInput").val();
  const bookFilter = $("#book").val();
  const passages = $(".passage-card");

  passages.each(function () {
    const ref = $(this).data("ref");
    const passageBook = $(this).data("book");
    const isBookMatch = bookFilter === "ALL" || bookFilter === passageBook;
    const isRefMatch = utils.isReferenceMatch(searchTerm, ref)

    if (isBookMatch && isRefMatch) {
      $(this).css("display", "block");
    } else {
      $(this).css("display", "none");
    }
  });
}

function submitPassage(passage) {
    passage = utils.contextToJson(passage);
    utils.submitPassageSelection(
        passage.book,
        passage.start_chapter,
        passage.start_verse,
        passage.end_chapter,
        passage.end_verse
    );
} 

function getBackgroundColorByPenalty(penalty) {
    const minPenalty = 1;
    const maxPenalty = 10;
    const percentage = (penalty - minPenalty) / (maxPenalty - minPenalty);

    const r = 255;
    const g = 255 - Math.round(percentage * 255);
    const b = 255 - Math.round(percentage * 255);
    // ORANGE
    // const g = Math.round(255 - (percentage * (255 - 165)));
    // const b = Math.round(255 - (percentage * 255));

    return `rgb(${r}, ${g}, ${b})`;
}

function applyBackgroundColorToPassages() {
    const passageCards = document.querySelectorAll(".passage-card");
    passageCards.forEach((card) => {
        const penalty = parseFloat(card.dataset.penalty);
        const bgColor = getBackgroundColorByPenalty(penalty);
        card.style.backgroundColor = bgColor;
    });
}

function filterPassages() {
    let bookNumber = document.getElementById("book").value;
    let passages = document.querySelectorAll(".passage-card");
    passages.forEach(passage => {
        let passageBookNumber = passage.getAttribute("data-book");
        if (bookNumber === "ALL" || passageBookNumber === bookNumber) {
            passage.style.display = "block";
        } else {
            passage.style.display = "none";
        }
    });
}

function sortPassages() {
    let sortBy = document.getElementById("sort").value;
    let sortOrder = document.getElementById("order").value;
    let passages = document.querySelectorAll(".grid > div");

    let sortedPassages = Array.from(passages).sort((a, b) => {
        let aValue, bValue;

        switch (sortBy) {
            case "word_count":
                aValue = parseInt(a.getAttribute("data-word-count"));
                bValue = parseInt(b.getAttribute("data-word-count"));
                break;
            case "id":
                aValue = parseInt(a.getAttribute("data-id"));
                bValue = parseInt(b.getAttribute("data-id"));
                break;
            case "penalty":
                aValue = parseFloat(a.getAttribute("data-penalty"));
                bValue = parseFloat(b.getAttribute("data-penalty"));
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
    sortedPassages.forEach(passage => container.appendChild(passage));
}

utils.subscribe('DOMContentLoaded', (event) => {
    applyBackgroundColorToPassages();
})

window.filterPassages = filterPassages
window.sortPassages = sortPassages
window.searchPassages = searchPassages
window.submitSelectedPassages = submitSelectedPassages
window.selectPassage = selectPassage
window.submitPassage = submitPassage