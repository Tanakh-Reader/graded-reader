import * as constants from './utils/constants.js';
import * as utils from './utils/utils.js';
import apis from './utils/apis.js';


let currentButton = null;
let dropdownMenu = document.getElementById("dropdown-menu");

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

function selectPassage(passage) {
    const passageId = $(passage).data("id");
    const selectedReference = $(passage).data("ref");
    // Update the button text.
    $(currentButton).text(selectedReference);
    // Update the Hebrew passage text.
    const hebrewTextDiv = $(currentButton).closest('.passage-container').find('.passage-text')[0];
    getHebrewText(passageId, hebrewTextDiv);
    dropdownMenu.style.display = "none";
    currentButton = null;
}

function getHebrewText(passageId, div) {
    apis.getHebrewText(passageId).then(response => {
        $(div).html(response)
        // Dispatch a event for text updates.
        utils.publish(constants.TEXT_LOADED_EVENT, div)
    })
        .catch(error => {
            console.error(error);
        });
}


window.addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll('.passage-item').forEach(item => {
        item.addEventListener('click', event => selectPassage(event.target));
    });


    // Fetch the Hebrew text for each passage on initial page load
    document.querySelectorAll('.passage-text').forEach(div => {
        const id = div.getAttribute('data-id');
        getHebrewText(id, div);
    });
});

window.filterDropdown = filterDropdown;
window.showDropdown = showDropdown;


/*

function toggleDropdown(event) {
  const dropdown = event.target.nextElementSibling;
  dropdown.classList.toggle("hidden");
  dropdown.setAttribute("data-event-source", event.target.id);
}

function selectPassage(event) {
  const selectedPassage = event.target;
  const selectedReference = $(selectedPassage).data("ref");
  const passageId = $(selectedPassage).data("id");
  const dropdown = selectedPassage.closest("#dropdown");
  const eventSourceId = dropdown.getAttribute("data-event-source");
  const selectedButton = document.getElementById(eventSourceId);

  selectedButton.textContent = selectedReference;
  const ancestorDiv = selectedButton.closest(".flex.flex-col.w-1/2.mx-4");
  const divId = ancestorDiv.id.replace("passage", "");

  getHebrewText(passageId, divId);
  toggleDropdown({ target: selectedButton });
}

// You only need to add one event listener, and it will automatically work for newly added elements too
document.querySelector("#dropdown ul").addEventListener("click", function(event) {
  if (event.target.tagName === "LI") {
    selectPassage(event);
  }
});

*/