import React from 'react';
import { render } from 'ink';
import { SearchApp } from '../components/search.components';
import { FluxTui } from '@/components/search.rezi';

export async function tuiCommandRezi() {
	console.log('\n Starting Flux-Cap Interactive Search...\n');
	// render(React.createElement(SearchApp));
	await FluxTui()
}

export async function tuiCommandInk() {
	console.log('\n Starting Flux-Cap Interactive Search...\n');
	render(React.createElement(SearchApp));
}
