import * as constants from "./utils/constants.js";
import * as utils from "./utils/utils.js";
import apis from "./utils/api.js";
import * as alg from "./utils/algorithms.js";
import { Algorithm } from "./models/algorithm.js";

const algorithmDivs = $(".algorithm-definition");
algorithmDivs.each((i, div) => {
	const algoirthm = new Algorithm(utils.contextToJson(div.dataset.definition));
	alg.buildAlgorithmDisplay(algoirthm, algoirthm.id);
});

$(window).on("load", () => {
	$(".delete-btn").on("click", function (e) {
		e.preventDefault();
		var algorithmId = $(this).data("id");
		if (
			window.confirm("Would you like to permanently delete this algorithm?")
		) {
			apis.deleteAlgorithm(algorithmId);
		}
	});

	var masonryGrid = document.querySelector(".masonry-grid");
	var msnry = new Masonry(masonryGrid, {
		itemSelector: ".algorithm-definition", // specify the grid item selector here
		columnWidth: ".grid-sizer", // use an element with this class or a pixel value
		percentPosition: true,
	});
	window.addEventListener("resize", function () {
		msnry.layout();
	});
});
