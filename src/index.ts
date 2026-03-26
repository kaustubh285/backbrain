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
import { tuiCommandInk, tuiCommandRezi } from "./commands/ui.command";
import { mcpServerCommand, mcpSetupCommand } from "./mcp-config";
const program = new Command();

program
	.name(`flux`)
	.description("Git-aware CLI context manager for ADHD developers")
	.version(packageJson.version);

program
	.command("i")
	.alias("init")
	.option("-y, --yes", "Accept all default options for initialization")
	.description("Initialize flux in the current repository")
	.action(initFluxCommand);

program
	.command("reset")
	.description("Resets flux in the current repository")
	.action(resetFluxCommand);


program
	.command("d [message...]")
	.alias("dump")
	.option("-m, --multiline", "Enable multiline input mode")
	.option("-n, --notes", "Jot down a note")
	.option("-i, --important", "Jot down a link")
	.option("-d, --ideas", "Jot down an idea")
	.option("-t, --tasks", "Jot down a task")
	.option("-b, --bugs", "Jot down a bug")
	.option("-l, --links", "Jot down a link")
	.option("-a, --ai", "AI jotted down something for you")
	.option("--tag [custom]", "Jot down a custom tagged")
	.description(
		"Add a brain dump with a message. Use --multiline for multi-line input.",
	)
	.action(async (message, options) => {
		await handleBrainDump(message, options);
	});

program
	.command("s [query...]")
	.alias("search")
	.description(
		"Search brain dumps with smart ranking. Examples:\n" +
		"  flux s auth        # Find auth-related dumps"
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


program
	.command("mcp-config")
	.description("Help configure MCP server for Flux-cap")
	.action(async () => {
		await mcpSetupCommand();
	});

program
	.command("mcp-server")
	.description("Start MCP server (used internally by IDEs)")
	.action(async () => {
		mcpServerCommand();
	});

program
	.command("u")
	.alias("ui")
	.description("Open interactive search TUI built using rezi")
	.action(tuiCommandRezi);

program
	.command("ui-ink")
	.description("Open interactive search TUI built using ink")
	.action(tuiCommandInk);

program.parse(process.argv);
