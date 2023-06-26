import * as constants from './utils/constants.js';
import * as utils from './utils/utils.js';
import * as events from './utils/events.js';
import apis from './utils/api.js';

function submitPassage(passage) {
    const passageId = $(passage).data("id");
    // Update the Hebrew passage text.
    const hebrewTextDiv = $(currentButton).closest('.passage-container').find('.passage-text')[0];
    getHebrewText(passageId, hebrewTextDiv);
}

function getHebrewText(passageId, div) {
    apis.getHebrewText(passageId).then(response => {
        $(div).html(response)
        // Dispatch a event for text updates.
        events.publish(constants.TEXT_LOADED_EVENT, div)
    })
        .catch(error => {
            console.error(error);
        });
}

window.addEventListener("DOMContentLoaded", (event) => {
    document.querySelectorAll('.passage-item').forEach(item => {
        item.addEventListener('click', event => submitPassage(event.target));
    });


    // Fetch the Hebrew text for each passage on initial page load
    document.querySelectorAll('.passage-text').forEach(div => {
        const id = div.getAttribute('data-id');
        getHebrewText(id, div);
    });

});

window.runAlgorithm = () => {console.log('PISS')}

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