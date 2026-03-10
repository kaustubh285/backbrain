import type { BrainDump, FluxConfig } from "../../types";
import { getCurrentBranch, getGitUncommittedChanges, getWorkingDir } from "../privacy";

export const searchV2Helper = async (config: FluxConfig, searchResults: {
	item: BrainDump;
	score?: number;
}[]) => {
	// Need to check if user's config allows branch name, working dir, uncommitted changes
	// SEVERELY Affects score!!
	// TODO: check if config should have bypass for search!
	const currentBranch = getCurrentBranch(config);
	const currentWorkingDir = await getWorkingDir(config);
	const currentHasUncommitted = getGitUncommittedChanges(config);

	return searchResults.map(({ item, score }) => {
		// fuzzy would be opposite score
		// fuzzy: low-> goood , high bad
		const fuseScore = 1 - (score || 0);

		const now = new Date();
		const itemDate = new Date(item.timestamp);
		const daysSince = (now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
		const recencyScore = Math.exp(-daysSince / 7);

		let gitContextScore = 0;


		if (item.branch && currentBranch && item.branch === currentBranch) {
			gitContextScore += 1.0;
		}

		if (item.workingDir && currentWorkingDir && item.workingDir === currentWorkingDir) {
			gitContextScore += 0.5;
		}

		if (item.hasUncommittedChanges) {
			gitContextScore += 0.3;
		}

		const tagMatchScore = 0;

		const fuzzyBoost = fuseScore > 0.8 ? 1.3 : 1.0;

		const gitBoost = currentHasUncommitted && item.hasUncommittedChanges ? 1.2 : 1.0;


		const weights = {
			fuzzyMatch: 2.0 * fuzzyBoost,
			recency: 1.0,
			gitContext: 1.5 * gitBoost,
			tagMatch: 1.2
		};

		const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);

		const finalScore = (
			fuseScore * weights.fuzzyMatch +
			recencyScore * weights.recency +
			gitContextScore * weights.gitContext +
			tagMatchScore * weights.tagMatch
		) / totalWeight;

		return {
			item,
			scores: {
				fuzzyMatch: fuseScore,
				recency: recencyScore,
				gitContext: gitContextScore,
				tagMatch: tagMatchScore,
				final: finalScore
			},
			finalScore
		};
	});

};
