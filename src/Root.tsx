import {Composition} from 'remotion';
import {Main} from './Main';

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				// You can take the "id" to render a video:
				// npx remotion render src/index.ts <id> out/video.mp4
				id="Main"
				component={Main}
				durationInFrames={600}
				fps={60}
				width={1080}
				height={1920}
			/>
		</>
	);
};
