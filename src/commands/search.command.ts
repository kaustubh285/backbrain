import fs from "fs";
import Fuse from "fuse.js";
import type { BrainDump } from "../types";
import {
	displaySearchResults,
	FLUX_BRAIN_DUMP_PATH,
	getAllBrainDumpFilePaths,
	getConfigFile,
	getFluxPath,
	getMonthString,
	searchResultFormat,
} from "../utils";
import { createFuseInstance } from "../utils/fuse.instance";
import { searchV2Helper } from "@/utils/search/helper";

export async function searchBrainDumpCommand(query: string[]) {
	console.log("Searching all brain dumps...");
	const fluxPath = await getFluxPath();
	const config = await getConfigFile(fluxPath);
	const combinedQuery = query.join(" ").trim();

	const searchResults: Array<{
		item: BrainDump; scores?: {
			fuzzyMatch: Number;
			recency: Number;
			gitContext: Number;
			tagMatch: Number;
			final: Number;
		}
	}> = [];
	const allFilePaths = await getAllBrainDumpFilePaths(fluxPath);

	if (combinedQuery) {
		for (const searchQuery of query) {
			for await (const filePath of allFilePaths) {
				const fileData: { dumps: BrainDump[] } = JSON.parse(
					fs.readFileSync(filePath, "utf8"),
				);
				const fuse = createFuseInstance(fileData.dumps, config);
				const results = fuse.search(searchQuery);
				searchResults.push(...await searchV2Helper(config, results));
			}
		}
	} else {
		for await (const filePath of allFilePaths) {
			const fileData: { dumps: BrainDump[] } = JSON.parse(
				fs.readFileSync(filePath, "utf8"),
			);
			const recentDumps = fileData.dumps
				.filter((dump) => dump && dump.message && dump.message.trim() !== "")
				.map((dump) => ({
					item: dump,
					scores: {
						fuzzyMatch: 0,
						recency: 0,
						gitContext: 0,
						tagMatch: 0,
						final: 0,
					},
					timestamp: new Date(dump.timestamp).getTime(),
				}));
			searchResults.push(...await searchV2Helper(config, recentDumps));
		}
	}

	if (combinedQuery) {
		searchResults.sort((a, b) => Number(b.scores?.final || 0) - Number(a.scores?.final || 0));
	} else {
		searchResults.sort((a, b) => {
			const timeA = new Date(a.item.timestamp).getTime();
			const timeB = new Date(b.item.timestamp).getTime();
			return timeB - timeA;
		});
	}

	const resultLimit = config?.search?.resultLimit || (combinedQuery ? 10 : 5);
	const limitedResults = searchResults.slice(0, resultLimit);

	if (searchResults.length > limitedResults.length) {
		console.log(
			`\n(Showing ${limitedResults.length} of ${searchResults.length} results)`,
		);
	}

	displaySearchResults(limitedResults, combinedQuery || undefined);
}
