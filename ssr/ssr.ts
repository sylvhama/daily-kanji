import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer';
import path from 'path';
import {Configuration, OpenAIApi} from 'openai';
import dotenv from 'dotenv';
import {IgApiClient} from 'instagram-private-api';
import fs from 'fs/promises';
import type {Props} from '../src/types';

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

const VIDEO_PATH = './out/daily-kanji.mp4';

// See https://www.remotion.dev/docs/ssr#render-a-video-using-nodejs-apis

export async function ssr() {
	const inputProps = await promptGPT();

	await renderVideo(inputProps);

	await postIGStory();
}

async function promptGPT() {
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

	const {text = ''} = completion.data.choices[0];
	console.log(`JSON: ${text}`);
	const json = JSON.parse(text);
	if (!validateJson(json)) {
		throw new Error('invalid JSON');
	}

	return json;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function validateJson(json: any) {
	if (!json.kanji || !json.hiragana || !json.romaji || !json.translation) {
		return false;
	}

	return true;
}

async function renderVideo(inputProps: Props) {
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

	const outputLocation = VIDEO_PATH;
	console.log('Attempting to render:', outputLocation);
	await renderMedia({
		composition,
		serveUrl: bundleLocation,
		codec: 'h264',
		outputLocation,
		inputProps,
	});
	console.log('Render done!');
}

async function postIGStory() {
	const ig = new IgApiClient();

	if (!process.env.IG_USERNAME || !process.env.IG_PASSWORD) {
		throw new Error('missing IG credentials in .env');
	}

	ig.state.generateDevice(process.env.IG_USERNAME);
	await ig.account.login(process.env.IG_USERNAME, process.env.IG_PASSWORD);

	const video = await fs.readFile(VIDEO_PATH);
	const coverImage = await fs.readFile('./cover.jpeg');

	await ig.publish.video({
		video,
		coverImage,
	});

	console.log(`Video uploaded successfully!`);
}
