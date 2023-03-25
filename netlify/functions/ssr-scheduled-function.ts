import {Handler, schedule} from '@netlify/functions';

import {ssr} from '../../ssr/ssr.js';

const myHandler: Handler = async () => {
	await ssr();

	return {
		statusCode: 200,
	};
};

const handler = schedule('@daily', myHandler);

export {handler};
