import { brainDumpAddCommand } from "../commands/dump.command";
import type { BrainDump, SearchResult } from "../types";

export function getMonthString(): string {
	const currentDate = new Date();
	const year = currentDate.getFullYear();
	const month = String(currentDate.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

export function searchResultFormat({
	message,
	timestamp,
	score,
	index,
}: {
	message: string;
	timestamp: string;
	score?: string;
	index?: number;
}): string {
	const formattedTimestamp = new Date(timestamp).toLocaleString();
	const indexStr = index !== undefined ? `${index + 1}.` : "";
	const scoreStr = `[${score || "0.00"}]`;
	const timeStr = `[${formattedTimestamp}]`;

	const formattedMessage = formatMessageForDisplay(message);

	return `${indexStr} ${scoreStr} ${timeStr} ${formattedMessage}`;
}

function formatMessageForDisplay(message: string): string {
	const lines = message
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (lines.length <= 1) {
		const singleLine = lines[0] || message;
		return singleLine.length > 80
			? singleLine.substring(0, 77) + "..."
			: singleLine;
	}

	const firstLine = lines[0];
	const truncatedFirst =
		firstLine?.length > 60 ? firstLine?.substring(0, 57) + "..." : firstLine;
	const remainingCount = lines.length - 1;

	return `${truncatedFirst} (+${remainingCount} more line${remainingCount === 1 ? "" : "s"})`;
}

export function displaySearchResults(
	results: Array<{
		item: BrainDump; scores?: {
			fuzzyMatch: Number;
			recency: Number;
			gitContext: Number;
			tagMatch: Number;
			final: Number;
		}
	}>,
	query?: string,
) {
	if (results.length === 0) {
		if (query) {
			console.log(`\n No brain dumps found matching "${query}"\n`);
		} else {
			console.log(
				"\nNo brain dumps found. Try 'flux dump' to create your first one!\n",
			);
		}
		return;
	}

	const queryText = query ? ` matching "${query}"` : "";
	console.log(
		`\n Found ${results.length} brain dump${results.length === 1 ? "" : "s"}${queryText}\n`,
	);

	const terminalWidth = process.stdout.columns || 100;
	const indexWidth = results.length.toString().length + 2;
	const idWidth = 10;
	const scoreWidth = 8;
	const timeWidth = 12;

	const header = `${"#".padEnd(indexWidth)}${"ID".padEnd(idWidth)}${"SCORE".padEnd(scoreWidth)}${"TIME".padEnd(timeWidth)}MESSAGE`;
	console.log(`\x1b[90m${header}\x1b[0m`);
	console.log(
		`\x1b[36m${"─".repeat(Math.min(terminalWidth - 5, header.length))}\x1b[0m`,
	);

	results.forEach((result, index) => {
		const dump = result.item;
		const score = result.scores?.final?.toFixed(2) || "0.00";
		const shortId = dump.id.substring(0, 8);
		const timeAgo = getTimeAgo(new Date(dump.timestamp));

		const indexStr = `${index + 1}.`.padEnd(indexWidth);
		const idStr = `\x1b[33m#${shortId}\x1b[0m`.padEnd(idWidth + 9);
		const scoreStr = `\x1b[90m[${score}]\x1b[0m`.padEnd(scoreWidth + 9);
		const timeStr = `\x1b[90m${timeAgo}\x1b[0m`.padEnd(timeWidth + 9);

		const lines = dump.message
			.split("\n")
			.map((l) => l.trim())
			.filter((l) => l.length > 0);
		const firstLine = lines[0] || "(empty)";

		console.log(`\n${indexStr}${idStr}${scoreStr}${timeStr}${firstLine}`);

		const messageIndent = " ".repeat(
			indexWidth + idWidth + scoreWidth + timeWidth,
		);
		if (lines.length > 1) {
			lines.slice(1).forEach((line) => {
				console.log(`${messageIndent}${line}`);
			});
		}
		const contextTags = getContextTags(result as SearchResult);

		const allTags = [...contextTags, ...(dump?.tags || [])];

		if (allTags.length > 0) {
			const tagsLine = `[${allTags.join(", ")}]`;
			console.log(`${messageIndent}\x1b[36m${tagsLine}\x1b[0m`);
		}

		if (dump.branch && dump.branch !== "main") {
			const gitInfo = `${dump.branch}${dump.hasUncommittedChanges ? " (uncommitted)" : ""}`;
			console.log(`${messageIndent}\x1b[33m${gitInfo}\x1b[0m`);
		}
	});

	console.log(
		`\n\x1b[90m Tip: Use the 8-character ID to reference dumps (e.g., flux edit ${results[0]?.item.id.substring(0, 8)})\x1b[0m\n`,
	);
}

export function getTimeAgo(date: Date): string {
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / (1000 * 60));
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString();
}

export const getContextTags = (result: SearchResult): string[] => {
	const contextTags = [];
	if (result.scores) {
		if (result.scores.recency > 0.8) contextTags.push('recent');
		if (result.scores.gitContext >= 1.0) contextTags.push('same-branch');
		if (result.scores.gitContext >= 1.5) contextTags.push('same-dir');
	}
	return contextTags;
};
