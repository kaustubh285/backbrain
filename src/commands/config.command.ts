import { BB_CONFIG_PATH } from "../utils";
import { getConfigFile, getBBPath } from "../utils/lib";

export async function configCommand(data: string[]) {
	console.log(`Updating key: ${data[0]} to ${data[1]}`);
	const bbPath = await getBBPath();
	const fs = await import("fs");
	const config = await getConfigFile(bbPath);

	if (data.length < 2) {
		console.log(
			"Please provide a key and value to update the config. Example: bb config --add-tags notes ideas tasks",
		);
		return;
	}
	const key = data[0];
	const value = data.slice(1).join(" ");
	const editableKeys = [
		"hideWorkingDir",
		"hideBranchName",
		"hideUncommittedChanges",
		"resultLimit",
		"threshold",
		"includeScore",
		"defaultFocusDuration",
	];

	if (!editableKeys.includes(key)) {
		console.log(
			`Invalid config key.\nEditable keys are: ${editableKeys.join(", ")}`,
		);
		return;
	}

	// privacy
	if (key === "hideWorkingDir") {
		config.privacy.hideWorkingDir = value === "true";
	}
	if (key === "hideBranchName") {
		config.privacy.hideBranchName = value === "true";
	}
	if (key === "hideUncommittedChanges") {
		config.privacy.hideUncommittedChanges = value === "true";
	}

	// search
	if (key === "resultLimit") {
		const limit = parseInt(value, 10);
		if (!isNaN(limit)) {
			config.search.resultLimit = limit;
		} else {
			console.log("Invalid value for resultLimit. Please provide a number.");
			return;
		}
	}
	if (key === "threshold") {
		const threshold = parseFloat(value);
		if (!isNaN(threshold)) {
			if (config.search && config.search.fuseOptions) {
				config.search.fuseOptions.threshold = threshold;
			}
		} else {
			console.log("Invalid value for threshold. Please provide a number.");
			return;
		}
	}

	if (key === "includeScore") {
		if (config.search && config.search.fuseOptions) {
			config.search.fuseOptions.includeScore = value === "true";
		}
	}

	if (key === "defaultFocusDuration") {
		const duration = parseInt(value, 10);
		if (!isNaN(duration)) {
			config.defaultFocusDuration = duration;
		} else {
			console.log(
				"Invalid value for defaultFocusDuration. Please provide a number.",
			);
			return;
		}
	}

	fs.writeFileSync(
		bbPath + BB_CONFIG_PATH,
		JSON.stringify(config, null, 4),
	);

	console.log("Config updated successfully.");
}
