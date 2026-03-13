import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface SearchInputProps {
	query: string;
	onQueryChange: (query: string) => void;
	onCommand: (command: string) => void;
}

export const SearchInput = ({
	query,
	onQueryChange,
	onCommand
}: SearchInputProps) => {
	const handleChange = (value: string) => {
		// if (value.includes('/q') || value.includes('/exit') || value.includes('/quit')) {
		// 	onCommand("exit")
		// 	return;
		// }
		if (value.startsWith('/')) {
			const command = value.slice(1).toLowerCase();
			if (command === 'exit' || command === 'quit' || command === 'q') {
				onCommand('exit');
				return;
			}
		}
		onQueryChange(value);
	};

	return (
		<Box flexDirection="column" marginBottom={1} >
			<Box marginBottom={1}>
				<Text color="blue" bold>Interactive Search</Text>
				<Text color="gray"> (type /exit to quit)</Text>
			</Box>
			<Box borderStyle="single" borderColor="blueBright">
				<Text>Query: </Text>
				<TextInput
					value={query}
					onChange={handleChange}
					placeholder="Search brain dumps... (or /exit to quit)"
				/>
			</Box>
		</Box>
	);
};
