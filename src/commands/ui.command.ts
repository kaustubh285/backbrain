import React from 'react';
import { render } from 'ink';
import { SearchApp } from '../components/search.components';

export async function tuiCommand() {
	console.log('\n Starting Flux-Cap Interactive Search...\n');
	render(React.createElement(SearchApp));
}
