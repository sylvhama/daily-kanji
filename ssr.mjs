import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer';
import path from 'path';
import {Configuration, OpenAIApi} from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const PROMPT = `
Generate a JSON with:
- a Japanese kanji (key must be kanji);
- its hiragana equivalent (key must be hiragana);
- its romaji equivalent with a small bullet between each sound (key must be romaji);
- its English translation (key must be translation).
Use the current timestamp as a seed in order to guarantee that each time I ask you to 
generate the JSON we get a different kanji never seen before.
`;

// See https://www.remotion.dev/docs/ssr#render-a-video-using-nodejs-apis

const start = async () => {
	// eslint-disable-next-line no-undef
	const apiKey = process.env.OPENAI_API_KEY;

	if (!apiKey) {
		throw new Error('missing env variable OPENAI_API_KEY');
	}

	const configuration = new Configuration({
		apiKey,
	});
	const openai = new OpenAIApi(configuration);

	const completion = await openai.createCompletion({
		model: 'text-davinci-003',
		prompt: PROMPT,
		// eslint-disable-next-line camelcase
		max_tokens: 100,
	});

	const {text} = completion.data.choices[0];
	console.log(`JSON: ${text}`);
	const inputProps = JSON.parse(text);
	if (!validateJson(inputProps)) {
		throw new Error('invalid JSON');
	}

	const compositionId = 'Main';
	const entry = './src/index';
	console.log('Creating a Webpack bundle of the video');
	const bundleLocation = await bundle(path.resolve(entry), () => undefined, {
		webpackOverride: (config) => config,
	});

	const comps = await getCompositions(bundleLocation, {
		inputProps,
	});
	const composition = comps.find((c) => c.id === compositionId);
	if (!composition) {
		throw new Error(`No composition with the ID ${compositionId} found.
  Review "${entry}" for the correct ID.`);
	}
	const outputLocation = `out/daily-kanji.mp4`;
	console.log('Attempting to render:', outputLocation);
	await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: 'h264',
		outputLocation,
		inputProps,
	});
	console.log('Render done!');
	// eslint-disable-next-line no-undef
	process.exit(0);
};
start();

function validateJson(json) {
	if (!json.kanji || !json.hiragana || !json.romaji || !json.translation) {
		return false;
	}

	return true;
}
