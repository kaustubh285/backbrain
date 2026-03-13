import React from 'react';
import { Box, Text } from 'ink';
import type { BrainDump, SearchResult } from '@/types';
import { getContextTags, getTimeAgo } from '@/utils';

interface SearchResultsProps {
	results: SearchResult[];
	loading: boolean;
	query: string;
}

export const SearchResults = ({
	results,
	loading,
	query
}: SearchResultsProps) => {
	if (loading) {
		return (
			<Box justifyContent="center" alignItems="center" height="100%">
				<Text color="yellow">Searching...</Text>
			</Box>
		);
	}

	if (results.length === 0) {
		return (
			<Box justifyContent="center" alignItems="center" height="100%" flexDirection="column">
				<Text color="gray">No brain dumps found.</Text>
				<Text color="gray">Try a different search term or /exit to quit.</Text>
			</Box>
		);
	}

	return (
		<Box flexDirection="column" padding={1} height="100%">
			{/* <Box borderStyle="single" borderColor="gray" marginBottom={1}> */}
			<Box marginBottom={1}>
				<Text color="white">
					{query
						? ` Found ${results.length} brain dump${results.length === 1 ? '' : 's'} matching "${query}"`
						: ` Showing ${results.length} recent brain dumps`
					}
				</Text>
			</Box>

			<Box marginBottom={1}>
				<Text color="gray">#  ID        SCORE   TIME        MESSAGE</Text>
			</Box>
			<Box marginBottom={1}>
				<Text color="cyan">────────────────────────────────────────</Text>
			</Box>

			<Box flexDirection="column" overflowY="hidden">
				{results.slice(0, 15).map((result, index) => {
					const dump = result.item;
					const score = result.scores?.final?.toFixed(2) || '0.00';
					const shortId = dump.id.substring(0, 8);
					const timeAgo = getTimeAgo(new Date(dump.timestamp));
					// const message = formatMessage(dump.message);
					const message = dump.message
					const contextTags = getContextTags(result);
					const allTags = [...contextTags, ...(dump.tags || [])];

					return (
						<Box key={dump.id} flexDirection="column" marginBottom={1}>
							<Box>
								<Text color="white">
									{`${index + 1}.`.padEnd(3)}
								</Text>
								<Text color="yellow">
									{`#${shortId}`.padEnd(10)}
								</Text>
								<Text color="gray">
									{`[${score}]`.padEnd(8)}
								</Text>
								<Text color="blue">
									{timeAgo.padEnd(12)}
								</Text>
								<Text color="white">
									{message}
								</Text>
							</Box>

							{allTags.length > 0 && (
								<Box paddingLeft={33}>
									<Text color="cyan">
										[{allTags.join(', ')}]
									</Text>
								</Box>
							)}

							{dump.branch && dump.branch !== 'main' && (
								<Box paddingLeft={33}>
									<Text color="yellow">
										{dump.branch}{dump.hasUncommittedChanges ? ' (uncommitted)' : ''}
									</Text>
								</Box>
							)}
						</Box>
					);
				})}

				{results.length > 15 && (
					<Box paddingLeft={1}>
						<Text color="gray">
							... and {results.length - 15} more results (showing first 15)
						</Text>
					</Box>
				)}
			</Box>
		</Box>)
};
