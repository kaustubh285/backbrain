import { getConfigFile } from "../utils";

export async function versionOption() {
	const config = await getConfigFile();
	console.log(`Backbrain version: ${config?.bbVersion || "unknown"}`);
}

export function helpOption() {
	console.log(`
Backbrain - Keep a running memory of your work

USAGE:
  bb <command> [options]

COMMANDS:
  init                     Initialize Backbrain with privacy setup
  note <message...>        Capture a note with context
  search [query...]        Search notes with smart ranking
  config <fields...>       View or update configuration
  reset                    Complete reset (deletes all data)
  help                     Show this help message

EXAMPLES:
  # Initialize in your project
  bb init

  # Capture thoughts
  bb note "fix auth validation bug"
  bb note "remember to add error handling to auth module"
  bb note -i "add dark mode toggle"

  # Search your notes
  bb search "auth"
  bb search "validation bug"
  bb search              # List recent notes

  # Update configuration
  bb config search.resultLimit 20
  bb config privacy.hideWorkingDir true

FEATURES:
  Developer Journal     - Instantly capture thoughts without breaking flow
  Intelligent Search    - Multi-signal ranking with git context
  Privacy Controls      - Choose what information to track
  Git Integration       - Automatic branch context detection
  AI Integration        - MCP server for AI assistant access

DATA LOCATION:
  All data stored in .bb/ directory:
  - .bb/config.json      Your configuration
  - .bb/dumps/           Notes organized by month

LEGACY SUPPORT:
  The 'bb' command still works but is deprecated. Use 'bb' instead.

For more information, visit: https://github.com/kaustubh285/flux-cap
  `);
}
