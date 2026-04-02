#!/usr/bin/env node
import { Command } from "commander";
import packageJson from "../package.json";
import { configCommand } from "./commands/config.command";
import { brainDumpAddCommand, handleBrainDump } from "./commands/dump.command";
import { helpOption } from "./commands/flux.option";
import { initBBCommand, resetBBCommand } from "./commands/init.command";
import { searchBrainDumpCommand } from "./commands/search.command";
import { getBBPath } from "./utils";
import { searchV2Command } from "./commands/search.v2.command";
import { tuiCommandRezi } from "./commands/ui.command";
import { mcpServerCommand, mcpSetupCommand } from "./mcp-config";
const program = new Command();

program
	.name(`bb`)
	.description("Backbrain: keep a running memory of your work, searchable from the CLI and readable by your AI")
	.version(packageJson.version);

program
	.command("i")
	.alias("init")
	.option("-y, --yes", "Accept all default options for initialization")
	.description("Initialize BackBrain in the current repository")
	.action(initBBCommand);

program
	.command("reset")
	.description("Resets BackBrain in the current repository")
	.action(resetBBCommand);


program
	.command("note [message...]")
	.alias("n")
	.option("-m, --multiline", "Enable multiline input mode")
	.option("-n, --notes", "Tag as note")
	.option("-i, --important", "Tag as important")
	.option("-d, --ideas", "Tag as idea")
	.option("-t, --tasks", "Tag as task")
	.option("-b, --bugs", "Tag as bug")
	.option("-l, --links", "Tag as link")
	.option("-a, --ai", "AI-generated note")
	.option("--tag [custom]", "Add custom tag")
	.description(
		"Add a note with a message. Use --multiline for multi-line input.",
	)
	.action(async (message, options) => {
		await handleBrainDump(message, options);
	});

// Legacy alias for backwards compatibility (deprecated)
program
	.command("d [message...]")
	.alias("dump")
	.option("-m, --multiline", "Enable multiline input mode")
	.option("-n, --notes", "Tag as note")
	.option("-i, --important", "Tag as important")
	.option("-d, --ideas", "Tag as idea")
	.option("-t, --tasks", "Tag as task")
	.option("-b, --bugs", "Tag as bug")
	.option("-l, --links", "Tag as link")
	.option("-a, --ai", "AI-generated note")
	.option("--tag [custom]", "Add custom tag")
	.description(
		"[DEPRECATED] Use 'bb note' instead. Add a note with a message.",
	)
	.action(async (message, options) => {
		await handleBrainDump(message, options);
	});

program
	.command("search [query...]")
	.alias("s")
	.option("--ai", "Output in AI-optimized format for MCP server")
	.description(
		"Search notes with smart ranking. Examples:\n" +
		"  bb search auth     # Find auth-related notes\n" +
		"  bb s payment       # Search payment notes"
	)
	.action((query?: string[], options?: { ai?: boolean }) => {
		searchBrainDumpCommand(query ? query : [""], false, undefined, null, options?.ai || false);
	});

// .alias("cfg")
program
	.command("config [data...]")
	.description(
		"Update configuration fields. Example: bb config search.limit 10",
	)
	.action(configCommand);


program
	.command("mcp-config")
	.description("Help configure MCP server for Backbrain")
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

program.parse(process.argv);
