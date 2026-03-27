import packageJson from "../../package.json";

import type { BBConfig } from "../types";

export const BB_FOLDER_PATH = ".bb/";

export const BB_DUMP_PATH = `${BB_FOLDER_PATH}dumps/`;

export const BB_SESSION_PATH = `${BB_FOLDER_PATH}sessions/`;

export const BB_CONFIG_PATH = `${BB_FOLDER_PATH}config.json`;

export const BB_DEFAULT_CONFIG: BBConfig = {
	bbVersion: packageJson.version,
	defaultFocusDuration: 1500, // 25 minutes
	todoKeywords: ["TODO", "FIXME", "BUG", "OPTIMIZE", "HACK"],
	notifications: true,
	theme: "minimal",
	sorted: true,
	privacy: {
		hideWorkingDir: false,
		hideBranchName: false,
		hideUncommittedChanges: false,
	},
	search: {
		searchFields: ["message", "workingDir", "branch", "tags", "id"],
		resultLimit: 10,
		fuseOptions: {
			threshold: 0.3,
			includeScore: true,
		},
	},
	tags: ["notes", "ideas", "tasks", "bugs", "links", "imporatant", "ai"],
};

export const BB_DEFAULT_BRAIN_DUMP_CONTENT = {
	bbVersion: packageJson.version,
};
