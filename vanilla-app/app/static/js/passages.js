function submitPassage(passage) {
    passage = contextToJson(passage);
    submitPassageSelection(
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
        console.log(passageBookNumber, bookNumber)
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

document.addEventListener("DOMContentLoaded", function () {
    applyBackgroundColorToPassages();
});
