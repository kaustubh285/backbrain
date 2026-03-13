import { Box } from "ink";
import { SearchInput } from "./search-input.component";
import { SearchResults } from "./search-results.component";
import { SearchStatus } from "./search-status.component";
import { useEffect, useState } from "react";
import { searchBrainDumpCommand } from "@/commands/search.command";
import type { SearchResult } from "@/types";

export const SearchApp = () => {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [loading, setLoading] = useState(false);
	const [totalDumps, setTotalDumps] = useState(0);
	const [searchTime, setSearchTime] = useState<number>();

	const loadRecentDumps = async () => {
		setLoading(true);
		const startTime = Date.now();

		try {
			const recentResults = await searchBrainDumpCommand([], true);
			const endTime = Date.now();

			setResults(recentResults as SearchResult[] || []);
			setTotalDumps((recentResults || []).length);
			setSearchTime(endTime - startTime);
		} catch (error) {
			console.error('Error loading dumps:', error);
			setResults([]);
			setTotalDumps(0);
		}

		setLoading(false);
	};

	useEffect(() => {
		loadRecentDumps();
	}, []);

	useEffect(() => {
		if (!query.trim()) {
			loadRecentDumps();
			return;
		}

		const performSearch = async () => {
			setLoading(true);
			const startTime = Date.now();

			try {
				const searchResults = await searchBrainDumpCommand(query.split(' '), true);
				const endTime = Date.now();

				setResults(searchResults as SearchResult[] || []);
				setSearchTime(endTime - startTime);
			} catch (error) {
				console.error('Search error:', error);
				setResults([]);
			}

			setLoading(false);
		};

		const debounceTimer = setTimeout(performSearch, 0);
		return () => clearTimeout(debounceTimer);
	}, [query]);

	const handleQueryChange = (newQuery: string) => {
		setQuery(newQuery);
	};

	const handleCommand = (command: string) => {
		if (command === 'exit') {
			process.exit(0);
		}
	};

	return (
		<Box flexDirection="column" height={35} width="100%">
			<Box height={3}>
				<SearchStatus searchTime={searchTime} totalResults={results.length} />
			</Box>

			<Box flexGrow={1} flexShrink={1} overflowY="hidden">
				<SearchResults results={results} loading={loading} query={query} />
			</Box>

			<Box height={3}>
				<SearchInput query={query} onQueryChange={handleQueryChange} onCommand={handleCommand} />
			</Box>
		</Box>
	);
};
