#!/usr/bin/env node
import { Command } from "commander";
import packageJson from "../package.json";
import { configCommand } from "./commands/config.command";
import { brainDumpAddCommand, handleBrainDump } from "./commands/dump.command";
import { helpOption } from "./commands/flux.option";
import { initFluxCommand, resetFluxCommand } from "./commands/init.command";
import { searchBrainDumpCommand } from "./commands/search.command";
import { getFluxPath } from "./utils";
import { searchV2Command } from "./commands/search.v2.command";
const program = new Command();

program
	.name(`flux`)
	.description("Git-aware CLI context manager for ADHD developers")
	.version(packageJson.version);

program
	.command("init")
	.option("-y, --yes", "Accept all default options for initialization")
	.description("Initialize flux in the current repository")
	.action(initFluxCommand);

program
	.command("reset")
	.description("Resets flux in the current repository")
	.action(resetFluxCommand);

program
	.command("look [message...]")
	.description(
		"Search brain dumps with a query using the new search algorithm",
	)
	.action(searchV2Command);

program
	.command("dump [message...]")
	.option("-m, --multiline", "Enable multiline input mode")
	.option("-n, --notes", "Jot down a note")
	.option("-i, --important", "Jot down a link")
	.option("-d, --ideas", "Jot down an idea")
	.option("-t, --tasks", "Jot down a task")
	.option("-b, --bugs", "Jot down a bug")
	.option("-l, --links", "Jot down a link")
	.option("--tag [custom]", "Jot down a custom tagged")
	.description(
		"Add a brain dump with a message. Use --multiline for multi-line input.",
	)
	.action(async (message, options) => {
		await handleBrainDump(message, options);
	});

program
	.command("search [query...]")
	.description(
		"Search brain dumps with a query. If no query is provided, lists all brain dumps for the current month.",
	)
	.action((query?: string[]) => {
		searchBrainDumpCommand(query ? query : [""]);
	});

// .alias("cfg")
program
	.command("config [data...]")
	.description(
		"Update configuration fields. Example: flux config search.limit 10",
	)
	.action(configCommand);

program.parse(process.argv);
