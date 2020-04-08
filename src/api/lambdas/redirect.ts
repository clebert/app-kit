import fetch from 'node-fetch';
import {assertIsString} from '../../utils/assert-is-string';
import {createApi} from '../utils/create-api';

export const handler = createApi(async ({getCookie, getParam}) => {
  const sessionId = getParam('state');

  if (sessionId !== getCookie('sessionId')) {
    throw new Error('Untrusted OAuth transaction.');
  }

  const url = new URL('https://github.com/login/oauth/access_token');

  assertIsString(process.env.CLIENT_ID, 'CLIENT_ID');
  assertIsString(process.env.CLIENT_SECRET, 'CLIENT_SECRET');

  url.searchParams.set('client_id', process.env.CLIENT_ID);
  url.searchParams.set('client_secret', process.env.CLIENT_SECRET);
  url.searchParams.set('code', getParam('code'));
  url.searchParams.set('state', sessionId);

  const response = await fetch(url.href, {
    headers: {Accept: 'application/json'},
  });

  const body = await response.json();

  if (response.status !== 200) {
    throw new Error(`Fetching token failed: ${body.message}`);
  }

  const searchParams = new URLSearchParams();

  searchParams.set('sessionId', sessionId);
  searchParams.set('token', body.access_token);

  return {
    statusCode: 302,
    headers: {Location: `/?${searchParams.toString()}`},
    body: '',
  };
});
