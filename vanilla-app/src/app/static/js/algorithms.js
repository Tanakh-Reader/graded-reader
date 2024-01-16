import * as constants from "./utils/constants.js";
import * as utils from "./utils/utils.js";
import apis from "./utils/api.js";
import * as alg from "./utils/algorithms.js";

const algorithmDivs = $(document).find(".algorithm-definition").toArray();
algorithmDivs.forEach((div) => {
	const definition = utils.contextToJson(div.dataset.definition);
	alg.buildAlgorithmDisplay(definition, definition.id);
});

$(document).ready(function () {
	$(".delete-btn").on("click", function (e) {
		e.preventDefault();
		var algorithmId = $(this).data("id");
		apis.deleteAlgorithm(algorithmId);
	});
});
