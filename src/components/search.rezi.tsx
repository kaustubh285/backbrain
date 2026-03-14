/** @jsxImportSource @rezi-ui/jsx */
import { createNodeApp } from "@rezi-ui/node";
import { Column, Row, Text, Input, Button, Box, Divider, Table, Page } from "@rezi-ui/jsx";
import { searchBrainDumpCommand } from "@/commands/search.command";
import { getAllBrainDumpFilePaths, getFluxPath, getTimeAgo } from "@/utils";
import type { SearchResult } from "@/types";
import { darkTheme, draculaTheme, nordTheme, rgb } from "@rezi-ui/core";

type AppState = {
	query: string;
	results: SearchResult[];
	selectedIndex: number;
	loading: boolean;
	availableFiles: string[];
	// selectedId?: string | null;
	selectedFile: string | null;
};

export const FluxTui = async () => {
	const fluxPath = await getFluxPath();
	const allFiles = await getAllBrainDumpFilePaths(fluxPath);
	const fileNames = allFiles
		.map(p => p.match(/(\d{4}-\d{2})\.json$/)?.[1] ?? null)
		.filter((f): f is string => f !== null)
		.sort()
		.reverse();

	const app = createNodeApp<AppState>({
		initialState: {
			query: '',
			results: [],
			selectedIndex: 0,
			loading: false,
			availableFiles: fileNames,
			// selectedId: null;
			selectedFile: "all",
		},
		theme: draculaTheme,
	});

	const loadDumps = async (query?: string, selectedFile?: string) => {
		app.update(prev => ({ ...prev, loading: true }));
		const specificFiles = (selectedFile && selectedFile !== "all") ? [allFiles.find(f => f.endsWith(`${selectedFile}.json`))!] : null;
		try {
			const raw = query?.trim()
				? await searchBrainDumpCommand(query.split(' '), true, 15, specificFiles)
				: await searchBrainDumpCommand([], true, 20, specificFiles);
			app.update(prev => ({
				...prev,
				results: (raw as SearchResult[]) || [],
				loading: false,
				selectedIndex: 0,
			}));
		} catch {
			app.update(prev => ({ ...prev, results: [], loading: false }));
		}
	};

	await loadDumps();

	const getContextTags = (result: SearchResult): string => {
		const tags: string[] = [];
		if (result.scores) {
			if (result.scores.recency > 0.8) tags.push('recent');
			if (result.scores.gitContext >= 1.0) tags.push('branch');
			if (result.scores.gitContext >= 1.5) tags.push('dir');
		}
		if (result.item.tags?.length) tags.push(...result.item.tags);
		return tags.join(', ');
	};

	app.view((state) => {
		const selected = state.results[state.selectedIndex] ?? null;

		return (
			<Page
				header={
					<Row gap={2} p={1}>
						<Text variant="label" style={{ bold: true }}>flux</Text>
						<Text variant="caption" style={{ dim: true }}>·</Text>
						<Row gap={0}>
							<Text variant="label">Search {state.query && `[searching for:`}</Text> <Text style={{
								fg: rgb(200, 100, 200),
								underline: true,
								bold: true,
								italic: true,
							}}>{state.query}</Text>
							{state.query && `]`}
						</Row>
						<Box flex={1} border="none" />
						<Text variant="caption" style={{ dim: true }}>
							{state.loading ? 'searching...' : `${state.results.length} results`}
						</Text>
					</Row>
				}
				body={
					<Row flex={1} gap={0}>
						<Column flex={1} gap={0}>
							<Table
								id="results-table"
								columns={[
									// { key: "index", header: "#", width: 0 },
									// { key: "id", header: "ID", width: 0 },
									// { key: "score", header: "Score", width: 0 },
									{ key: "time", header: "Time", width: 10 },
									{ key: "message", header: "Message", flex: 1, overflow: "ellipsis" },
									// { key: "tags", header: "Tags", width: 22, overflow: "ellipsis" },
								]}
								onRowPress={(value) => {
									const index = state.results.findIndex(r => `#${r.item.id.substring(0, 8)}` === value.id);
									if (index !== -1) {
										app.update(prev => ({ ...prev, selectedIndex: index }));
									}
								}}
								data={state.results.map((result, index) => ({
									index: String(index + 1),
									id: `#${result.item.id.substring(0, 8)}`,
									score: result.scores?.final?.toFixed(2) ?? '0.00',
									time: getTimeAgo(new Date(result.item.timestamp)).replace(" ago", ""),
									message: result.item.message ?? '',
									// tags: getContextTags(result),
								}))}
								stripedRows={true}
								// stripeStyle={{
								// 	odd: rgb(40, 42, 54),
								// 	even: rgb(68, 71, 90)
								// }}
								getRowKey={(_row, index) => `row-${index}`}
								selectionMode="single"
								selection={[`row-${state.selectedIndex}`]}
								borderStyle={{ variant: "rounded" }}
							/>
						</Column>

						<Column flex={2} gap={1} p={2} scrollY={100}>
							{selected && (
								<Row>
									<Row gap={2} flex={1}>
										<Text variant="caption" style={{ dim: true }}>ID</Text>
										<Text style={{
											underline: true,
											fg: rgb(200, 0, 200)
										}}>#{selected.item.id.substring(0, 8)}</Text>
									</Row>
									<Column gap={0}>
										<Row gap={2}>
											<Text variant="caption" style={{ dim: true }}>Created</Text>
											<Text>{new Date(selected.item.timestamp).toLocaleString()}</Text>
										</Row>
										{selected.item.branch && (
											<Row gap={2}>
												<Text variant="caption" style={{ dim: true }}>Branch</Text>
												<Text style={{
													fg: rgb(200, 200, 25)
												}}>
													{selected.item.branch}
													{selected.item.hasUncommittedChanges ? ' (uncommitted)' : ''}
												</Text>
											</Row>
										)}
										{selected.item.workingDir && <Row gap={2}>
											<Text variant="caption" style={{ dim: true }}>Dir</Text>
											<Text >{(() => {
												const parts = selected.item.workingDir?.split("/") || [];
												return parts.length >= 2
													? `${parts[parts.length - 2]} / ${parts[parts.length - 1]}`
													: selected.item.workingDir || '';
											})()}</Text>
										</Row>}
									</Column>
								</Row>
							)}
							<Divider />
							{selected ? (
								<Column gap={1}>
									<Column gap={0} wrap>
										<Text variant="caption" style={{ dim: true }}>Message:</Text>
										<Text wrap={true}>{selected.item.message}</Text>
									</Column>


									{selected.scores && (
										<Column gap={0}>
											<Text variant="caption" style={{ dim: true }}>Context Rating: </Text>
											<Row gap={1}>
												<Column gap={0}>
													<Text variant="caption" style={{ dim: true }}>final</Text>
													<Text>{(selected.scores.final * 100).toFixed(0)}%</Text>
												</Column>
												<Column gap={0}>
													<Text variant="caption" style={{ dim: true }}>fuzzy</Text>
													<Text>{(selected.scores.fuzzyMatch * 100).toFixed(0)}%</Text>
												</Column>
												<Column gap={0}>
													<Text variant="caption" style={{ dim: true }}>recency</Text>
													<Text>{(selected.scores.recency * 100).toFixed(0)}%</Text>
												</Column>
												<Column gap={0}>
													<Text variant="caption" style={{ dim: true }}>git</Text>
													<Text>{(selected.scores.gitContext * 100).toFixed(0)}%</Text>
												</Column>
											</Row>
										</Column>
									)}
								</Column>
							) : (
								<Text variant="caption" style={{ dim: true }}>
									Use j / k or ↑ ↓ to select a dump
								</Text>
							)}
						</Column>
					</Row>
				}
				footer={
					<Column gap={0}>
						<Divider />
						<Row gap={2} p={1} items="center">
							<Button
								id={`file-all`}
								label={"all"}
								dsVariant={state.selectedFile === "all" ? "solid" : "ghost"}
								dsTone={state.selectedFile === "all" ? "primary" : "default"}
								dsSize="sm"
								onPress={() => {
									loadDumps("", "all");
									app.update(prev => ({
										...prev,
										selectedFile: prev.selectedFile === "all" ? null : "all"
									}))
								}}

							/>
							{state.availableFiles.slice(0, 5).map(file => (

								<Button
									key={file}
									id={`file-${file}`}
									label={file}
									dsVariant={state.selectedFile === file ? "solid" : "ghost"}
									dsTone={state.selectedFile === file ? "primary" : "default"}
									dsSize="sm"
									onPress={() => {
										loadDumps("", file);
										app.update(prev => ({
											...prev,
											selectedFile: prev.selectedFile === file ? null : file
										}))
									}}

								/>
							))}
							{/*<Box flex={1} />*/}
							<Text variant="caption" style={{ dim: true }}>j/k navigate · q quit</Text>
						</Row>
						<Row gap={1} p={1} items="center">
							<Text variant="caption" style={{ dim: true }}>Search:</Text>
							<Box width={"full"} flex={1}>
								<Input
									focusable={true}
									style={{
										blink: true,
									}}
									focusConfig={
										{ indicator: "bracket", ringVariant: "dotted", animation: "pulse" }
									}
									dsSize="lg"
									id="search"
									value={state.query}
									placeholder="type to search using ..."
									onInput={(value) => {
										app.update(prev => ({ ...prev, query: value }));
										loadDumps(value);
									}}
								/>
							</Box>
						</Row>
					</Column>
				}
			/>
		);
	});

	app.keys({
		'q': () => app.stop(),
		'j': () => app.update(prev => ({
			...prev,
			selectedIndex: Math.min(prev.results.length - 1, prev.selectedIndex + 1),
		})),
		'k': () => app.update(prev => ({
			...prev,
			selectedIndex: Math.max(0, prev.selectedIndex - 1),
		})),
		'down': () => app.update(prev => ({
			...prev,
			selectedIndex: Math.min(prev.results.length - 1, prev.selectedIndex + 1),
		})),
		'up': () => app.update(prev => ({
			...prev,
			selectedIndex: Math.max(0, prev.selectedIndex - 1),
		})),
	});

	await app.start();
};
