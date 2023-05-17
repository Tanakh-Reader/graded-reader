// Search a passage via a reference.
function filterDropdown() {
    const searchTerm = $("#searchInput").val();
    const dropdownItems = $("#dropdown > ul > li");

    dropdownItems.each(function () {
        const ref = $(this).data("ref");
        const isRefMatch = isReferenceMatch(searchTerm, ref)

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
    // const selectedButton = event.target.closest('div'); 
    const selectedButton = $(this).closest('.test').find('button')
    console.log(selectedButton)
    console.log(event.target.closest('.test'));
    selectedButton.textContent = selectedReference;
    // document.getElementById("selectedPassage").textContent = selectedReference;
    getHebrewText(passageId);
}




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