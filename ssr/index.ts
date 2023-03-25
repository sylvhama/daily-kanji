import {ssr} from './ssr';

async function start() {
	await ssr();
	process.exit(0);
}

start();
