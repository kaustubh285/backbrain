import React from 'react';
import { render } from 'ink';
import { SearchApp } from '../components/search.components';
import { BBTui } from '@/components/search.rezi';

export async function tuiCommandRezi() {
	console.log('\n Starting Backbrain Interactive Search...\n');
	// render(React.createElement(SearchApp));
	await BBTui()
}

export async function tuiCommandInk() {
	console.log('\n Starting Backbrain Interactive Search...\n');
	render(React.createElement(SearchApp));
}
