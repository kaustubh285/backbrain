import Fuse from "fuse.js";
import type { BBConfig } from "../types";

export function createFuseInstance(data: any[], config: BBConfig) {
	return new Fuse(data, {
		keys: config.search.searchFields,
		includeScore: config.search.fuseOptions?.includeScore || true,
		threshold: config.search.fuseOptions?.threshold || 0.5,
	});
}
