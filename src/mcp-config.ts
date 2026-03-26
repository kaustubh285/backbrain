export const mcpSetupCommand = async () => {
	console.log("Flux-Cap MCP Integration Setup!!");

	const mcpConfig = {
		mcpServers: {
			"flux-cap": {
				command: "flux",
				args: ["mcp-server"],
				env: {}
			}
		}
	};

	console.log(`Add this to your IDE's MCP configuration:\n ${JSON.stringify(mcpConfig, null, 2)} \n ${"=".repeat(50)}`);

	console.log(`Files:\n- Cursor: ~/.cursor/mcp.json\n- Zed: ~/.config/zed/settings.json (add to 'language_models' section)\n- Claude Desktop: ~/Library/Application Support/Claude/claude_desktop_config.json (or equivalent on your OS)`)
};

export const mcpServerCommand = () => {
	console.log("Starting Flux-Cap MCP Server...");

	import("./mcp-server").catch((err) => {
		console.error("Failed to start MCP server:", err);
		process.exit(1);
	});
};
