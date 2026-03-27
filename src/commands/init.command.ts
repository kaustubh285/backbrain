import fs from "fs";
import inquirer from "inquirer";
import { createIfNotExists, getBBPath } from "../utils/";
import {
	BB_DUMP_PATH,
	BB_CONFIG_PATH,
	BB_DEFAULT_CONFIG,
	BB_FOLDER_PATH,
	BB_SESSION_PATH,
} from "../utils/constants";

export async function initBBCommand(options: { yes?: boolean }) {

	// CRITICAL SECTION
	try {
		// Check if .bb folder exists
		await createIfNotExists(BB_FOLDER_PATH, "directory");
		await createIfNotExists(BB_DUMP_PATH, "directory");
		await createIfNotExists(BB_SESSION_PATH, "directory");

		// Check if config.json exists
		const config = BB_DEFAULT_CONFIG;
		let answers: {
			includeWorkingDir: any;
			includeBranch: any;
			includeUncommitted: any;
		};
		if (options.yes) {
			console.log("Accepting all default options for initialization...");
			answers = {
				includeWorkingDir: true,
				includeBranch: true,
				includeUncommitted: true,
			};
		} else {
			answers = await inquirer.prompt([
				{
					type: "confirm",
					name: "includeWorkingDir",
					message: "Include your current working directory in logs?",
					default: true,
				},
				{
					type: "confirm",
					name: "includeBranch",
					message: "Include your git branch name in logs?",
					default: true,
				},
				{
					type: "confirm",
					name: "includeUncommitted",
					message: "Include uncommitted git changes in logs?",
					default: true,
				},
			]);
		}

		config.privacy.hideWorkingDir = !answers.includeWorkingDir;
		config.privacy.hideBranchName = !answers.includeBranch;
		config.privacy.hideUncommittedChanges = !answers.includeUncommitted;

		await createIfNotExists(
			BB_CONFIG_PATH,
			"file",
			JSON.stringify(config, null, 4),
		);

		console.log(
			"If you want to customize your configuration, you can edit the config.json file located in the .flux directory.",
		);
	} catch (error) {
		console.error("Error during initialization:", error);
		process.exit(1);
	}

	try {
		// NON-CRITICAL SECTION
		// If a git repo, add it to gitignore
		if (fs.existsSync(".git/")) {
			console.log("Git repository detected.");
		} else {
			console.log("Not a git repository. Skipping git integration.");
		}

		if (fs.existsSync(".gitignore")) {
			console.log("Gitignore file exists");
			const gitignoreContent = fs.readFileSync(".gitignore", "utf8");

			if (gitignoreContent.includes(BB_FOLDER_PATH)) {
				console.log(".bb is already in .gitignore");
			} else {
				fs.appendFileSync(".gitignore", `\n${BB_FOLDER_PATH}`);
			}
		} else {
			fs.writeFileSync(".gitignore", ".bb");
			console.log("Created .gitignore file.");
		}
	} catch (error) {
		console.error(
			`Error during git setup: ${error}. \n You may need to manually add .bb/ to your .gitignore file.`,
		);
	}

	console.log(
		`Backbrain folder structure created at ${BB_FOLDER_PATH}, with cwd as ${process.cwd()}`,
	);
	console.log("Backbrain initialized successfully!");
}

export const resetBBCommand = async () => {
	console.log("Resetting Backbrain...");
	const bbPath = (await getBBPath()) + BB_FOLDER_PATH;

	const { confirmed } = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirmed",
			message:
				"Are you sure? This will delete all your notes and sessions.",
			default: false,
		},
	]);

	if (!confirmed) {
		console.log("Reset cancelled.");
		return;
	}

	try {
		if (fs.existsSync(bbPath)) {
			fs.rmSync(bbPath, { recursive: true, force: true });
			console.log("Removed .bb directory and all its contents.");
		} else {
			console.log("Backbrain is not initialized in this repository.");
		}
	} catch (error) {
		console.error("Error during reset:", error);
		process.exit(1);
	}

	console.log("Backbrain reset successfully!");
};
