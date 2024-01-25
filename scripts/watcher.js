/**
 * A script that watches for file changes in specified directories and file types.
 * When an HTML, JS, CSS, or JSON file changes, it invokes a linting script (`lint.py`).
 * The linting process is throttled with a delay to prevent rapid consecutive runs.
 * Usage: Simply run the script to start watching the specified directories for changes.
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Add a delay to restart watching after linting (you can adjust this time)
const RESTART_WATCH_DELAY = 2000;

// Directories to watch
const dirsToWatch = ["."];

// Get the absolute path to the lint.py script
const lintScriptPath = path.join(__dirname, "lint.py");

// A flag to prevent processing when linting
let isLinting = false;

// Watch function
const watchDir = (dir) => {
	fs.watch(dir, { recursive: true }, (eventType, filename) => {
		if (filename && eventType === "change" && !isLinting) {
			const fullPath = path.resolve(dir, filename);
			console.log(`File changed: ${fullPath}`);

			// Set the flag to indicate linting process has started
			isLinting = true;

			// Execute linting script
			exec(
				`cd src && poetry run python ${lintScriptPath} ${fullPath}`,
				(error, stdout, stderr) => {
					if (error) {
						console.error(`exec error: ${error}`);
						return;
					}
					console.log(`\nLinting result: ${stdout}`);

					// Reset the flag after linting is done and after a delay
					setTimeout(() => {
						isLinting = false;
					}, RESTART_WATCH_DELAY);
				},
			);
		}
	});
	console.log(`Watching directory: ${dir}`);
};

// Start watching specified directories
dirsToWatch.forEach((dir) => watchDir(dir));
