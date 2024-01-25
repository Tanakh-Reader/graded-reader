import * as constants from "./utils/constants.js";
import * as utils from "./utils/utils.js";
import apis from "./utils/api.js";
import * as alg from "./utils/algorithms.js";
import * as events from "./utils/events.js";
import * as sel from "./utils/selectors.js";

class AlgorithmsDisplay {
	init() {
		this.algorithmDivs = $(sel.CLASS.algorithm);
		this.createDisplays();
		this.show();
		this.createMasonryLayout();
		this.setListeners();
	}

	show() {
		utils.toggleLoading();
		$(".algorithms-content").css("display", "flex");
	}

	setListeners() {
		// Delete button clicked
		$(".delete-btn").on("click", (event) => {
			event.preventDefault();
			if (
				window.confirm("Would you like to permanently delete this algorithm?")
			) {
				apis.deleteAlgorithm(
					$(event.target)
						.closest(sel.CLASS.algorithm)
						.attr(sel.DATA.algorithmId),
				);
			}
		});
	}

	createDisplays() {
		this.algorithmDivs.each((i, div) => {
			const algorithm = utils.getAlgorithmById(
				$(div).attr(sel.DATA.algorithmId),
			);
			alg.buildAlgorithmDisplay(algorithm, algorithm.id);
		});
	}

	createMasonryLayout() {
		if (this.algorithmDivs.length > 0) {
			var masonryGrid = $(".masonry-grid");
			var msnry = new Masonry(masonryGrid[0], {
				itemSelector: sel.CLASS.algorithm, // specify the grid item selector here
				columnWidth: ".grid-sizer", // use an element with this class or a pixel value
				percentPosition: true,
			});
			$(window).on("resize", () => {
				msnry.layout();
			});
		}
	}
}

const algorithmsDisplay = new AlgorithmsDisplay();

// Algorithm data is now available.
events.subscribe(events.ALG_FORM_LOADED_EVENT, () => {
	algorithmsDisplay.init();
});
