import { editor } from "@inquirer/prompts";
import { randomUUID } from "crypto";
import type { BrainDump, BrainDumpOptions, BBConfig } from "../types";
import {
	createBrainDumpFileIfNotExists,
	getConfigFile,
	getCurrentBranch,
	getBBPath,
	getGitUncommittedChanges,
	getMonthString,
	getTags,
	getWorkingDir,
} from "../utils/";
import { BB_DUMP_PATH, BB_CONFIG_PATH } from "../utils/constants";

export async function handleBrainDump(
	message: string[],
	options: BrainDumpOptions,
) {
	try {
		let finalMessage: string;

		if (options.multiline) {
			console.log("Opening editor for multiline input...");
			const initialText = message ? message.join(" ") : "";

			const multilineInput = await editor({
				message: "Enter your note (save & exit when done):",
				default: initialText,
				waitForUserInput: false,
			});

			if (!multilineInput.trim()) {
				console.log("Note cancelled - no content provided");
				return;
			}

			finalMessage = multilineInput.trim();
		} else {
			if (!message || message.length === 0) {
				console.log('Please provide a message: bb note "your message"');
				return;
			}
			finalMessage = message.join(" ");
		}

		await brainDumpAddCommand(finalMessage, options);
	} catch (error) {
		console.error(
			"Error creating note:",
			error instanceof Error ? error.message : "Unknown error",
		);
		process.exit(1);
	}
}

export async function brainDumpAddCommand(
	message: string,
	options: BrainDumpOptions,
) {
	const bbPath = await getBBPath();
	const fs = await import("fs");

	console.log("Creating note...");

	const monthString = getMonthString();
	await createBrainDumpFileIfNotExists(monthString, bbPath);

	const config = await getConfigFile(bbPath);
	const workingDir = await getWorkingDir(config);
	const branch = getCurrentBranch(config);
	const hasUncommittedChanges = getGitUncommittedChanges(config);
	const tags = getTags(options, config);

	const newDump: BrainDump = {
		id: randomUUID(),
		timestamp: new Date().toISOString(),
		message: message,
		workingDir,
		branch,
		hasUncommittedChanges,
		tags,
	};

	const data: { dumps: BrainDump[] } = JSON.parse(
		fs.readFileSync(
			`${bbPath}${BB_DUMP_PATH}/${monthString}.json`,
			"utf8",
		),
	);

	config.sorted ? data.dumps.unshift(newDump) : data.dumps.push(newDump);

	fs.writeFileSync(
		`${bbPath}${BB_DUMP_PATH}/${monthString}.json`,
		JSON.stringify(data, null, 2),
	);

	const displayMessage =
		message.length > 50 ? message.substring(0, 47) + "..." : message;

	const preview = message.includes("\n")
		? `${message.split("\n")[0]}... (multiline)`
		: displayMessage;

	console.log(` Note saved: "${preview}"`);
}
