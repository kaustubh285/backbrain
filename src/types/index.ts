export type FluxConfig = {
	fluxVersion: string;
	defaultFocusDuration: number;
	todoKeywords: string[];
	notifications: boolean;
	theme: "minimal";
	sorted: boolean;
	privacy: {
		hideWorkingDir: boolean;
		hideBranchName: boolean;
		hideUncommittedChanges: boolean;
	};
	search: {
		searchFields: ("message" | "workingDir" | "branch" | "tags" | "id")[];
		resultLimit: number | null;
		fuseOptions?: {
			threshold: number;
			includeScore: boolean;
		};
	};
	// ALL optional fields below this line - 24/02/26 - v0.3.0
	tags?: string[];
};

export type BrainDump = {
	id: string;
	timestamp: string;
	message: string;
	workingDir?: string;
	branch?: string | null;
	tags?: string[];
	hasUncommittedChanges?: boolean;
};

export type BrainDumpOptions = {
	multiline?: boolean;
	notes?: boolean;
	ideas?: boolean;
	tasks?: boolean;
	tag?: string;
};

export type searchTypes = "default" | "tags" | "time" | "branch";
