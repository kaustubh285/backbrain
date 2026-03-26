#!/usr/bin/env bun
// ASSISTED BY AI: This file sets up an MCP server that integrates with the flux-cap CLI tool. It provides two main functionalities:
// 1. Finding the nearest .flux directory to ensure that flux-cap is initialized and available.
// 2. Searching brain dumps using the flux search command, with intelligent ranking based on relevance, recency, and git context.
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

const findFluxDirectory = () => {
	const fs = require("fs");
	const path = require("path");

	let currentDir = process.cwd();
	const root = path.parse(currentDir).root;

	while (currentDir !== root) {
		const fluxDir = path.join(currentDir, '.flux');
		if (fs.existsSync(fluxDir)) {
			return currentDir;
		}
		currentDir = path.dirname(currentDir);
	}
	return null;
};

server.registerTool(
	"find_flux_directory",
	{
		title: "Find Flux Directory",
		description: "Locate the nearest .flux directory by traversing up the directory tree. Use this first to ensure flux-cap is available.",
		inputSchema: z.object({})
	},
	async () => {
		try {
			const fluxDir = findFluxDirectory();
			return {
				content: [{
					type: "text",
					text: fluxDir
						? `Found flux directory: ${fluxDir}`
						: "❌ No .flux directory found. User needs to run 'flux init' in their project."
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `❌ Error finding flux directory: ${error instanceof Error ? error.message : 'Unknown error'}`
				}]
			};
		}
	}
);


server.registerTool(
	"search_dumps",
	{
		title: "Search Brain Dumps with Intelligent Ranking",
		description: `Search user's brain dumps with AI-powered ranking (relevance + recency + git context).

			WHEN TO USE:
			• User asks about past work: "What was I working on with auth?"
			• User needs context: "What bugs did I find in the payment system?"
			• User seems stuck: "I'm having trouble with React hooks" → search "react hooks"
			• Before suggesting new dumps: Always search first to provide context

			SEARCH STRATEGY:
			• Use specific keywords from user's conversation
			• Try broader terms if specific search returns nothing
			• Empty query returns recent dumps (good for "what was I doing lately")

			OUTPUT: Returns ranked results with git context, timestamps, and relevance scores.`,

		inputSchema: z.object({
			query: z.string().optional().describe("Search keywords extracted from user conversation (leave empty for recent activity)")
		})
	},
	async ({ query = "" }) => {
		const fluxDir = findFluxDirectory();
		if (!fluxDir) {
			return {
				content: [{ type: "text", text: "❌ Flux-cap not initialized. No .flux directory found." }]
			};
		}

		try {
			const cmd = query ? `flux s "${query.replace(/"/g, '\\"')}"` : "flux s";
			const output = safeExec(cmd, fluxDir);
			return {
				content: [{
					type: "text",
					text: output || "No brain dumps found matching your criteria."
				}]
			};
		} catch (error) {
			return {
				content: [{
					type: "text",
					text: `❌ Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`
				}]
			};
		}
	}
);

const transport = new StdioServerTransport();
await server.connect(transport);
