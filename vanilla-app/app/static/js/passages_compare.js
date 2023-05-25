import * as constants from './utils/constants.js';
import utils from './utils/utils.js';
import apis from './utils/apis.js';


// Search a passage via a reference.
function filterDropdown() {
    const searchTerm = $("#searchInput").val();
    // const dropdownItems = $("#dropdown > ul > li");
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

function selectPassage(event) {
    const selectedPassage = event.target;
    const passageId = $(selectedPassage).data("id");
    const selectedReference = $(selectedPassage).data("ref");
    // Update the button text.
    const selectedButton = $(selectedPassage).closest('.passage-container').find('button')
    selectedButton.text(selectedReference);
    // Update the Hebrew passage text.
    const hebrewTextDiv = $(selectedPassage).closest('.passage-container').find('.passage-text');
    getHebrewText(passageId, hebrewTextDiv);
}

function getHebrewText(passageId, div) {
    apis.getHebrewText(passageId).then(response => {
        $(div).html(response)
    })
        .catch(error => {
            console.error(error);  // Or handle any errors
        });
}

window.filterDropdown = filterDropdown;

window.addEventListener("DOMContentLoaded", (event) => {
    // document.querySelectorAll('.search-input').forEach(item => {
    //     item.addEventListener("input", filterDropdown);
    // });

    document.querySelectorAll('.passage-item').forEach(item => {
        item.addEventListener('click', event => selectPassage(event));
    });


    // Fetch the Hebrew text for each passage on initial page load
    document.querySelectorAll('.passage-text').forEach(div => {
        const id = div.getAttribute('data-id');
        getHebrewText(id, div);
    });
});

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