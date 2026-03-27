import fs from "fs";
import Fuse from "fuse.js";
import type { BrainDump } from "../types";
import {
	displaySearchResults,
	BB_DUMP_PATH,
	getAllBrainDumpFilePaths,
	getConfigFile,
	getBBPath,
	getMonthString,
	searchResultFormat,
} from "../utils";
import { createFuseInstance } from "../utils/fuse.instance";
import { searchV2Helper } from "@/utils/search/helper";

export async function searchBrainDumpCommand(
	query: string[],
	returnResults: boolean = false,
	searchResultLimit?: number,
	specificListOfFiles: string[] | null = null,
	aiMode: boolean = false
) {
	if (!returnResults) console.log("Searching all notes...");
	const bbPath = await getBBPath();
	const config = await getConfigFile(bbPath);
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
	const allFilePaths = specificListOfFiles ? specificListOfFiles : await getAllBrainDumpFilePaths(bbPath);

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

	const resultLimit = searchResultLimit ? searchResultLimit : config?.search?.resultLimit || (combinedQuery ? 10 : 5);
	const limitedResults = searchResults.slice(0, resultLimit);

	if (returnResults) {
		return limitedResults;
	}
	if (searchResults.length > limitedResults.length) {
		console.log(
			`\n(Showing ${limitedResults.length} of ${searchResults.length} results)`,
		);
	}

	if (aiMode) {

		// TODO : CHECK TOON FORMAT FOR TOKEN OPTIMIZATION
		const aiOutput = {
			query: combinedQuery || "recent",
			total_results: searchResults.length,
			results: searchResults.slice(0, searchResultLimit || 10).map((result, index) => ({
				rank: index + 1,
				id: result.item.id.slice(0, 8),
				message: result.item.message,
				timestamp: result.item.timestamp,
				tags: result.item.tags?.join(", ") || "",
				branch: result.item.branch,
				working_dir: result.item.workingDir,
				score: result.scores?.final || 0,
				individual_scores: result.scores ? {
					fuzzy_match: result.scores.fuzzyMatch,
					recency: result.scores.recency,
					git_context: result.scores.gitContext
				} : null
			}))
		};

		console.log("## AI_OUTPUT");
		console.log(JSON.stringify(aiOutput, null, 2));
		console.log("## AI_OUTPUT_END");
	} else {
		displaySearchResults(limitedResults, combinedQuery || undefined);
	}

}
