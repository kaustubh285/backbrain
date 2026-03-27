#!/usr/bin/env bun
// ASSISTED BY AI: This file sets up an MCP server that integrates with the Backbrain CLI tool. It provides two main functionalities:
// 1. Finding the nearest .bb directory to ensure that Backbrain is initialized and available.
// 2. Searching notes using the bb search command, with intelligent ranking based on relevance, recency, and git context.
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { execSync } from "child_process";
import { z } from "zod";
import packageJson from "../package.json";

const server = new McpServer({
	name: packageJson.name,
	version: packageJson.version,
});

const safeExec = (command: string, workingDir?: string, options: { suppressErrors?: boolean } = {}) => {
	try {
		return execSync(command, {
			cwd: workingDir || process.cwd(),
			encoding: "utf8",
			stdio: options.suppressErrors ? "pipe" : ["inherit", "pipe", "pipe"]
		}).toString().trim();
	} catch (error) {
		if (options.suppressErrors) {
			return `Error: ${error instanceof Error ? error.message : 'Command failed'}`;
		}
		throw error;
	}
};

const findBBDirectory = () => {
	const fs = require("fs");
	const path = require("path");

	let currentDir = process.cwd();
	const root = path.parse(currentDir).root;

	while (currentDir !== root) {
		const bbDir = path.join(currentDir, '.bb');
		if (fs.existsSync(bbDir)) {
			return currentDir;
		}
		currentDir = path.dirname(currentDir);
	}
	return null;
};

server.registerTool(
	"find_bb_directory",
	{
		title: "Find BackBrain Directory",
		description: "Locate the nearest .bb directory by traversing up the directory tree. Use this first to ensure Backbrain is available.",
		inputSchema: z.object({})
	},
	async () => {
		try {
			const bbDir = findBBDirectory();
			return {
				content: [{
					type: "text",
					text: bbDir
						? `Found bb directory: ${bbDir}`
						: " No .bb directory found. User needs to run 'bb init' in their project."
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: ` Error finding bb directory: ${error instanceof Error ? error.message : 'Unknown error'}`
				}]
			};
		}
	}
);


server.registerTool(
	"search_notes",
	{
		title: "Search Notes with Intelligent Ranking",
		description: `Search user's notes with AI-powered ranking (relevance + recency + git context).

			WHEN TO USE:
			• User asks about past work: "What was I working on with auth?"
			• User needs context: "What bugs did I find in the payment system?"
			• User seems stuck: "I'm having trouble with React hooks" → search "react hooks"
			• Before suggesting new notes: Always search first to provide context

			SEARCH STRATEGY:
			• Use specific keywords from user's conversation
			• Try broader terms if specific search returns nothing
			• Empty query returns recent notes (good for "what was I doing lately")

			OUTPUT: Returns ranked results with git context, timestamps, and relevance scores.`,

		inputSchema: z.object({
			query: z.string().optional().describe("Search keywords extracted from user conversation (leave empty for recent activity)")
		})
	},
	async ({ query = "" }) => {
		const bbDir = findBBDirectory();
		if (!bbDir) {
			return {
				content: [{ type: "text", text: " Backbrain not initialized. No .bb directory found." }]
			};
		}

		try {
			const cmd = query ? `bb s "${query.replace(/"/g, '\\"')}"` : "bb s";
			const output = safeExec(cmd, bbDir);
			return {
				content: [{
					type: "text",
					text: output || "No notes found matching your criteria."
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: ` Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
				}]
			};
		}
	}
);


server.registerTool(
	"add_note",
	{
		title: "Capture Note with Smart Tagging",
		description: `Capture a note with appropriate tags based on content type.

		AVAILABLE TAGS & WHEN TO USE:
		• -i (ideas): Creative thoughts, feature suggestions, "what if we...", brainstorming
		• -n (notes): Meeting notes, reminders, general information, documentation
		• -t (tasks): TODOs, action items, "need to do", work assignments
		• -b (bugs): Issues, errors, problems, "this is broken", debugging notes
		• -l (links): URLs, references, resources, documentation links
		• -d (ideas alt): Alternative ideas tag (same as -i)
		• -a (AI made notes): All AI-generated entries need this for easy filtering
		• --tag <custom>: Use custom tags like "meeting", "review", "research"

		SMART TAGGING EXAMPLES:
		• "I need to refactor the auth module" → -t (task)
		• "Found a bug in payment processing" → -b (bug)
		• "Idea: add dark mode toggle" → -i (idea)
		• "Meeting notes from standup" → -n (note)
		• "Check this documentation: https://..." → -l (link)`,

		inputSchema: z.object({
			message: z.string().describe("The note content to capture"),
			tag: z.enum(["i", "n", "t", "b", "l", "d", "a"]).optional().describe("Predefined tag: i=ideas, n=notes, t=tasks, b=bugs, l=links, d=ideas(alt), a=AI-notes"),
			customTag: z.string().optional().describe("Custom tag name (use instead of predefined tags for specific contexts)"),
			multiline: z.boolean().optional().describe("Enable multiline mode for longer content")
		})
	},
	async ({ message, tag, customTag, multiline }) => {
		const bbDir = findBBDirectory();
		if (!bbDir) {
			return {
				content: [{ type: "text", text: " Backbrain not initialized. No .bb directory found. User needs to run 'bb init' first." }]
			};
		}

		let cmd = "bb d";

		if (tag) {
			cmd += ` -${tag}`;
		} else if (customTag) {
			cmd += ` --tag ${customTag}`;
		}

		if (multiline) {
			cmd += " -m";
		}

		const escapedMessage = message.replace(/"/g, '\\"');
		cmd += ` "${escapedMessage}"`;

		try {
			const output = safeExec(cmd, bbDir);
			const tagLabel = tag ? `[${tag}]` : customTag ? `[${customTag}]` : '';
			return {
				content: [{
					type: "text",
					text: ` Note captured ${tagLabel}\n${output || `"${message.slice(0, 80)}${message.length > 80 ? '...' : ''}"`}`
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: ` Failed to capture note: ${error instanceof Error ? error.message : 'Unknown error'}`
				}]
			};
		}
	}
);

server.registerTool(
	"list_recent",
	{
		title: "List Recent Notes",
		description: "Get the most recent notes. Perfect for 'what was I doing' questions or getting recent context.",
		inputSchema: z.object({
			limit: z.number().optional().describe("Number of recent notes to show (default: according to config)")
		})
	},
	async ({ limit }) => {
		const bbDir = findBBDirectory();
		if (!bbDir) {
			return {
				content: [{ type: "text", text: " Backbrain not initialized. No .bb directory found." }]
			};
		}

		try {
			const output = safeExec("bb s", bbDir);

			if (limit && output) {
				const lines = output.split('\n');
				const resultStartIndex = lines.findIndex(line => line.includes('#') && line.includes('ID'));
				if (resultStartIndex >= 0) {
					const headers = lines.slice(0, resultStartIndex + 2);
					const results = lines.slice(resultStartIndex + 2, resultStartIndex + 2 + limit);
					const limitedOutput = [...headers, ...results].join('\n');
					return { content: [{ type: "text", text: limitedOutput }] };
				}
			}

			return {
				content: [{ type: "text", text: output || "No recent notes found." }]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: ` Failed to list recent notes: ${error instanceof Error ? error.message : 'Unknown error'}`
				}]
			};
		}
	}
);

server.registerTool(
	"get_status",
	{
		title: "Get Backbrain Status",
		description: "Check Backbrain status, current git context, and project information.",
		inputSchema: z.object({})
	},
	async () => {
		const bbDir = findBBDirectory();
		if (!bbDir) {
			return {
				content: [{ type: "text", text: " Backbrain not initialized. No .bb directory found." }]
			};
		}

		try {
			let status = "Backbrain Status\n\n";
			status += ` Project Directory: ${bbDir}\n`;

			try {
				const branch = safeExec("git branch --show-current", bbDir, { suppressErrors: true });
				status += `Git Branch: ${branch || "Not in git repo"}\n`;
			} catch {
				status += "Git Branch: Not in git repo\n";
			}

			try {
				const config = safeExec("bb config", bbDir, { suppressErrors: true });
				const configLines = config.split('\n').slice(0, 3);
				status += `\nConfiguration:\n${configLines.join('\n')}\n`;
			} catch {
				status += "\nConfiguration: Unable to load\n";
			}

			return {
				content: [{ type: "text", text: status }]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: ` Failed to get status: ${error instanceof Error ? error.message : 'Unknown error'}`
				}]
			};
		}
	}
);

const transport = new StdioServerTransport();
await server.connect(transport);
