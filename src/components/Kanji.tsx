import {interpolate} from 'remotion';
import {useCurrentFrame} from 'remotion';
import {STROKE_DURATION, OPACITY_DURATION} from '../consts';

interface KanjiProps {
	kanji: string;
	translation: string;
}

const KANJI_SIZE = 256;

export function Kanji({kanji, translation}: KanjiProps) {
	const frame = useCurrentFrame();
	const strokeDashoffset = interpolate(frame, [0, STROKE_DURATION], [500, 0]);
	const fillOpacity = interpolate(
		frame,
		[STROKE_DURATION, STROKE_DURATION + OPACITY_DURATION],
		[0, 1]
	);
	const opacityTranslation = interpolate(
		frame,
		[STROKE_DURATION, STROKE_DURATION + OPACITY_DURATION],
		[0, 1]
	);

	return (
		<div
			style={{
				textAlign: 'center',
			}}
		>
			<svg
				style={{
					fontSize: KANJI_SIZE,
					overflow: 'visible',
					strokeDasharray: 500,
					strokeDashoffset,
					fillOpacity,
				}}
				stroke="#fff"
				fill="#fff"
				strokeWidth={fillOpacity >= 1 ? 0 : 2}
			>
				<text x="50%" dominantBaseline="middle" textAnchor="middle" y="50%">
					{kanji}
				</text>
			</svg>
			<div
				style={{
					opacity: opacityTranslation,
					fontSize: 64,
				}}
			>
				<span style={{opacity: 0.5, position: 'relative', top: 32}}>
					{translation}
				</span>
			</div>
		</div>
	);
}
