import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import type { BBConfig } from "../types";
import { BB_DUMP_PATH, BB_CONFIG_PATH } from "./constants";
import packageJson from "../../package.json";
export async function getBBPath() {
	const cwd = process.cwd();

	const fullPath = cwd.split(path.sep);
	while (true) {
		const parentPath = fullPath.join(path.sep) + "/.bb";
		if (fs.existsSync(parentPath)) {
			return parentPath.split(".bb")[0];
			break;
		}
		fullPath.pop();
		if (fullPath.length === 0) {
			break;
		}
	}
	console.error(
		"No .bb directory found in the current or parent directories. Please run 'bb init' or 'backbrain init' to initialize.",
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
	bbPath?: string,
) {
	await createIfNotExists(
		`${bbPath}${BB_DUMP_PATH}${dateString}.json`,
		"file",
		JSON.stringify({
			bbVersion: packageJson.version,
			month: dateString,
			dumps: [],
		}),
	);
}

export async function getConfigFile(bbPath?: string): Promise<BBConfig> {
	const fs = await import("fs");
	const configPath = `${bbPath}${BB_CONFIG_PATH}`;
	const config: BBConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
	return config;
}

export async function getAllBrainDumpFilePaths(
	bbPath?: string,
): Promise<string[]> {
	const fs = await import("fs");
	const path = await import("path");
	const files = fs.readdirSync(bbPath + BB_DUMP_PATH);
	return files
		.filter((file) => file.endsWith(".json"))
		.map((file) => path.join(bbPath + BB_DUMP_PATH, file));
}

export async function init() {
	const bbPath = await getBBPath();
	const config = await getConfigFile(bbPath);

	return {
		bbPath,
		config,
	};
}
