import * as constants from "./constants.js";
import * as events from "./events.js";

function getHebrewText(passageId, as_widget = false) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.GET_HEBREW_TEXT_API,
			method: "POST",
			data: {
				passage_id: passageId,
				as_widget: as_widget,
			},
			success: function (response) {
				resolve(response.html); // Resolve the promise with the response
			},
			error: function (error) {
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}

// api.js
function getAlgorithmForm() {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.GET_ALGORITHM_FORM_API,
			method: "GET",
			data: {
				// 'ref': passageId
			},
			success: function (response) {
				// console.log(response.html);
				// var formDiv = $("<div>").html(response.html);
				// console.log(formDiv);
				// $("body").append(formDiv);
				$("#algorithm-form-container").html(response.html);

				// Ensure that the DOM has finished updating
				setTimeout(() => {
					events.publish(constants.ALG_FORM_LOADED_EVENT);
				}, 0);

				resolve();
			},
			error: function (error) {
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}

function submitForm(formData, formUrl) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: formUrl,
			method: "POST",
			data: formData,
			processData: false,
			contentType: false,
		})
			.done(function (data) {
				if (data.status === "success") {
					// The form was processed successfully
					console.log(data);
				} else {
					// Something went wrong
					console.error("Error:", data);
					alert(JSON.stringify(data.message || data));
					// resolve(data);
				}
			})
			.fail(function (error) {
				console.error("Error:", error);
			});
	});
}

function getAllBooks() {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.GET_BOOKS_API,
			method: "GET",
			success: function (response) {
				resolve(response.books); // Resolve the promise with the response
			},
			error: function (error) {
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}

function getAllAlgorithms() {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.GET_ALGORITHMS_API,
			method: "GET",
			success: function (response) {
				resolve(response.algorithms); // Resolve the promise with the response
			},
			error: function (error) {
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}

function getAllPassages() {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.GET_PASSAGES_API,
			method: "GET",
			success: function (response) {
				resolve(response.passages); // Resolve the promise with the response
			},
			error: function (error) {
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}

function deleteAlgorithm(id) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.DELETE_ALGORITHM_API,
			method: "POST",
			data: {
				id: id,
			},
			success: function (response) {
				window.location.reload();
				resolve(response);
			},
			error: function (error) {
				alert("Deletion failed");
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}

// Check on data that is being initialized
function checkDataReady(dataSource) {
	const queryParams = new URLSearchParams();

	queryParams.set("data_source", dataSource);
	// Append query parameters to the URL
	const requestUrl = `${constants.DATA_LOADED_API}?${queryParams.toString()}`;

	// Send GET request
	fetch(requestUrl)
		.then((response) => {
			// Check if the response status is OK (200)
			console.log(response);
			if (response.ok) {
				return response.json();
			} else {
				console.error("Request failed with status:", response.status);
			}
		})
		.then((data) => {
			console.log(data);
			if (data && data.data_loaded) {
				location.reload();
			} else {
				setTimeout(() => checkDataReady(dataSource), 10000); // Check every 10 seconds
			}
		})
		.catch((error) => {
			console.error("Request error:", error);
		});
}

function postAlgorithm(configuration, task, text = null) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.POST_ALGORITHM_API,
			method: "POST",
			contentType: "application/json", // for parsing in the backend
			data: JSON.stringify({
				configuration: configuration,
				task: task,
				text: text,
			}),
			success: function (response) {
				resolve(response); // Resolve the promise with the response
			},
			error: function (error) {
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}

function compareAlgorithms(body) {
	return new Promise((resolve, reject) => {
		$.ajax({
			url: constants.COMPARE_ALGORITHMS_API,
			method: "POST",
			data: body,
			success: function (response) {
				console.log(response);
				$("#passage-penalty-comparisons").html(response.html);

				// Ensure that the DOM has finished updating
				setTimeout(() => {
					events.publish(constants.PASSAGE_LISTS_PENALTY_COMPARISON_EVENT);
				}, 0);

				resolve();
			},
			error: function (error) {
				reject(error); // Reject the promise if there's an error
			},
		});
	});
}
export default {
	getHebrewText,
	getAllBooks,
	getAllAlgorithms,
	getAllPassages,
	checkDataReady,
	getAlgorithmForm,
	submitForm,
	postAlgorithm,
	deleteAlgorithm,
	compareAlgorithms,
};
