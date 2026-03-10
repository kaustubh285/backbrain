import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { FluxConfig } from "../types";
import { FLUX_BRAIN_DUMP_PATH, FLUX_CONFIG_PATH } from "./constants";

export async function getFluxPath() {
	const cwd = process.cwd();

	const fullPath = cwd.split(path.sep);
	while (true) {
		const parentPath = fullPath.join(path.sep) + "/.flux";
		if (fs.existsSync(parentPath)) {
			return parentPath.split(".flux")[0];
			break;
		}
		fullPath.pop();
		if (fullPath.length === 0) {
			break;
		}
	}
	console.error(
		"No .flux directory found in the current or parent directories. Please run 'flux init' to initialize.",
	);
	process.exit(1);
}

export async function createIfNotExists(
	folderPath: string,
	type: "file" | "directory",
	data?: any,
): Promise<void> {
	try {
		const fs = await import("fs");
		if (!fs.existsSync(folderPath)) {
			if (type === "file") {
				fs.writeFileSync(folderPath, data || "");
				// console.log(`Created file: ${folderPath}`);
				return;
			}
			fs.mkdirSync(folderPath, { recursive: true });
			// console.log(`Created directory: ${folderPath}`);
		} else {
			if (type === "file") {
				try {
					const stats = fs.statSync(folderPath);
					if (stats.size === 0 && data) {
						// File exists but is empty
						fs.writeFileSync(folderPath, data);
					}
				} catch (writeError: any) {
					if (
						writeError.code === "EACCES" ||
						writeError.code === "EPERM"
					) {
						throw new Error(
							`No write permissions for file: ${folderPath}`,
						);
					}
					throw writeError;
				}
			} else {
				try {
					fs.accessSync(folderPath, fs.constants.W_OK);
				} catch (accessError: any) {
					if (
						accessError.code === "EACCES" ||
						accessError.code === "EPERM"
					) {
						throw new Error(
							`No write permissions for directory: ${folderPath}`,
						);
					}
				}
			}
			// console.log(`${type} already exists: ${folderPath}`);
		}
	} catch (error) {
		// console.error(`Error creating directory ${folderPath}:`, error);
		throw error;
	}
}

export async function createBrainDumpFileIfNotExists(
	dateString: string,
	fluxPath?: string,
) {
	await createIfNotExists(
		`${fluxPath}${FLUX_BRAIN_DUMP_PATH}${dateString}.json`,
		"file",
		JSON.stringify({
			fluxVersion: "0.0.1",
			month: dateString,
			dumps: [],
		}),
	);
}

export async function getConfigFile(fluxPath?: string): Promise<FluxConfig> {
	const fs = await import("fs");
	const configPath = `${fluxPath}${FLUX_CONFIG_PATH}`;
	const config: FluxConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
	return config;
}

export async function getAllBrainDumpFilePaths(
	fluxPath?: string,
): Promise<string[]> {
	const fs = await import("fs");
	const path = await import("path");
	const files = fs.readdirSync(fluxPath + FLUX_BRAIN_DUMP_PATH);
	return files
		.filter((file) => file.endsWith(".json"))
		.map((file) => path.join(fluxPath + FLUX_BRAIN_DUMP_PATH, file));
}

export async function init() {
	const fluxPath = await getFluxPath();
	const config = await getConfigFile(fluxPath);

	return {
		fluxPath,
		config,
	};
}
