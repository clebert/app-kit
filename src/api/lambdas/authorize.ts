import {assertIsString} from '../../utils/assert-is-string';
import {createApi} from '../utils/create-api';

export const handler = createApi(async ({getParam}) => {
  const url = new URL('https://github.com/login/oauth/authorize');

  assertIsString(process.env.CLIENT_ID, 'CLIENT_ID');

  url.searchParams.set('client_id', process.env.CLIENT_ID);
  url.searchParams.set('scope', 'repo');
  url.searchParams.set('state', getParam('sessionId'));

  return {statusCode: 302, headers: {Location: url.href}, body: ''};
});
