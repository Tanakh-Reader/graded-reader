import * as utils from "../utils/utils.js";
import * as constants from "../utils/constants.js";
import * as events from "../utils/events.js";

function setListeners() {
	$(".hyperlink-btn").each(function () {
		$(this)
			.off()
			.on("click", function () {
				$(this).parent().find(".hyperlink-menu").toggleClass("hidden");
			});
	});

	// Add click event listener to all list items
	$(".hyperlinks a")
		.off()
		.on("click", function (e) {
			e.preventDefault();
			let resource = $(this).data("resource"); // Get the resource key
			let parent = $(this).closest(".hyperlink-menu"); // Get the parent element
			let bookNumber = parent.find(".hyperlinks").attr("data-book");
			let chapter = parent.find(".hyperlinks").attr("data-chapter");
			utils.openHyperlink(resource, bookNumber, chapter);
			parent.toggleClass("hidden"); // Use toggleClass instead of addClass
		});
}

events.addListeners(
	[
		"load",
		events.PASSAGE_WIDGET_ADDED_EVENT,
		events.TEXT_FETCHED_COMPLETED_EVENT,
		events.PASSAGE_LISTS_TEXT_COMPARISON_EVENT,
	],
	setListeners,
);
