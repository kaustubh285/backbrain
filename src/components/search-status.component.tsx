import React from 'react';
import { Box, Text } from 'ink';

interface SearchStatusProps {
	searchTime?: number;
	totalResults: number;
}

export const SearchStatus = ({
	searchTime,
	totalResults
}: SearchStatusProps) => {
	// console.log('Rendering SearchStatus with:', { searchTime, totalResults });
	return (
		<Box flexDirection="column" borderStyle="single" borderColor="gray" padding={1}>
			<Text color="cyan" bold> Flux-Cap Interactive Search</Text>
			<Text color="gray">
				Results: {totalResults}
				{searchTime && ` | Search: ${searchTime}ms`}
				{' | Commands: /exit, /quit, /q'}
			</Text>
		</Box>
	);
};
