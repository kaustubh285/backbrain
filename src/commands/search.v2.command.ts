import { init } from "@/utils";

export async function searchV2Command() {
	console.log("search v2 command executed");

	const { bbPath, config } = await init();
}

export function searchNotesCommand() { }
export function searchTaskCommand() { }
export function searchImportantCommand() { }
export function searchIdeasCommand() { }
export function searchRecentCommand() { }
export function searchTodoCommand() { }
export function searchHereCommand() { }
export function searchLinkCommand() { }
