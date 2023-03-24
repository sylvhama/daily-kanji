import {
	AbsoluteFill,
	interpolate,
	Sequence,
	useCurrentFrame,
	Audio,
	Img,
	staticFile,
	getInputProps,
} from 'remotion';
import sakura from './sakura.png';

import {loadFont} from '@remotion/google-fonts/Delius';

import {Cell} from './components/Cell';
import {Kanji} from './components/Kanji';
import {INTRO_DURATION, STROKE_DURATION, OPACITY_DURATION} from './consts';

const {fontFamily: delius} = loadFont();

interface Props {
	kanji: string;
	hiragana: string;
	romaji: string;
	translation: string;
}

export function Main() {
	const {
		kanji = '昭',
		hiragana = 'あきら',
		romaji = 'a･ki･ra',
		translation = 'shining',
	} = getInputProps() as Props;

	const frame = useCurrentFrame();
	const opacityIntro = interpolate(
		frame,
		[0, OPACITY_DURATION, INTRO_DURATION - OPACITY_DURATION, INTRO_DURATION],
		[0, 1, 1, 0]
	);
	const opacityWords = interpolate(
		frame,
		[
			INTRO_DURATION + STROKE_DURATION,
			INTRO_DURATION + STROKE_DURATION + OPACITY_DURATION,
		],
		[0, 1]
	);

	return (
		<AbsoluteFill
			style={{
				fontFamily: delius,
				color: 'white',
				fontSize: 112,
				background: 'rgba(43,46,47)',
			}}
		>
			{/** stephan, Public domain, via Wikimedia Commons */}
			<Audio src={staticFile('gong.ogg')} />
			<Img
				style={{
					top: '45%',
					position: 'relative',
					width: '100%',
					height: '100%',
				}}
				src={sakura}
			/>
			<AbsoluteFill
				style={{
					background: 'rgba(43,46,47,0.9)',
				}}
			/>
			<Sequence
				style={{
					height: '40%',
					display: 'grid',
					justifyContent: 'center',
					alignContent: 'flex-end',
					textTransform: 'uppercase',
					opacity: opacityIntro,
				}}
				durationInFrames={INTRO_DURATION}
			>
				Daily Kanji
			</Sequence>
			<Sequence
				from={INTRO_DURATION}
				style={{
					display: 'grid',
					gridTemplateAreas: `
						"kanji kanji"
						"hiragana romaji"
					`,
					gridTemplateColumns: '1fr 1fr',
					gridTemplateRows: '40% 1fr',
					rowGap: 128,
				}}
			>
				<Cell gridArea="kanji" alignContent="flex-end">
					<Kanji kanji={kanji} translation={translation} />
				</Cell>
				<Cell gridArea="hiragana" opacity={opacityWords}>
					{hiragana}
				</Cell>
				<Cell gridArea="romaji" opacity={opacityWords}>
					{romaji}
				</Cell>
			</Sequence>
		</AbsoluteFill>
	);
}
