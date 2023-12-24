import * as constants from './utils/constants.js';
import * as utils from './utils/utils.js';
import * as events from './utils/events.js';
import apis from './utils/api.js';

function submitPassage(passageItem) {
  const passageId = $(passageItem).data("id");
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

// Add event listener to "add" button
document.querySelector('.add-widget').addEventListener('click', function () {
  var widgets = document.querySelectorAll('.passage-container');

  // Only clone widget if there are less than 4
  if (widgets.length < 4) {
    var lastWidget = widgets[widgets.length - 1];
    var newWidget = lastWidget.cloneNode(true);

    // Append the new widget to the container
    document.querySelector('.comparison-container').appendChild(newWidget);

    // You might need to initialize some stuff on the new widget here
  } else {
    utils.showToast("Maximum of 4 text widgets.", 2000);
  }
});

// Add event listener to "minus" buttons
document.querySelectorAll('.passage-container .remove-widget').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var widgets = document.querySelectorAll('.passage-container');

    // Only remove widget if there are more than 2
    if (widgets.length > 2) {
      // 'this' is the button that was clicked
      this.parentNode.parentNode.remove();
    } else {
      utils.showToast("Minimum of 2 text widgets.", 2000);
    }
  });
});


window.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll('.passage-container .passage-item').forEach(item => {
    item.addEventListener('click', event => submitPassage(event.target));
  });


  // Fetch the Hebrew text for each passage on initial page load
  document.querySelectorAll('.passage-text').forEach(div => {
    const id = div.getAttribute('data-id');
    getHebrewText(id, div);
  });

});
