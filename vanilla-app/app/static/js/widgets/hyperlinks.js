import * as utils from '../utils/utils.js';
import * as constants from '../utils/constants.js';
import * as events from '../utils/events.js';

var dropdownButtons = document.querySelectorAll('.hyperlink-btn');

function toggleMenuVisibility(event) {
    var dropdownMenu = event.srcElement.nextElementSibling;
    dropdownMenu.classList.toggle('hidden');
}

$(document).ready(function () {
    dropdownButtons.forEach(function (button) {
        button.addEventListener('click', toggleMenuVisibility, false);
    });

    // Add click event listener to all list items
    $(".hyperlinks a").click(function (e) {
        e.preventDefault();
        let resource = $(this).data('resource'); // Get the resource key
        let parent = $(this).closest('.hyperlink-menu'); // Get the parent element
        let bookNumber = parent.find('.hyperlinks').attr('data-book');
        let chapter = parent.find('.hyperlinks').attr('data-chapter');
        utils.openHyperlink(resource, bookNumber, chapter);
        parent.toggleClass('hidden'); // Use toggleClass instead of addClass
    });
});

