import {APIGatewayEvent} from 'aws-lambda';
import * as cookie from 'cookie';

export interface ApiRequest {
  getCookie(cookieName: string): string;
  getParam(paramName: string): string;
}

export function createApiRequest(event: APIGatewayEvent): ApiRequest {
  const {headers, queryStringParameters: params} = event;
  const cookies = headers.cookie ? cookie.parse(headers.cookie) : {};

  return {
    getCookie: (cookieName) => {
      const cookieValue = cookies[cookieName];

      if (!cookieValue) {
        throw new Error(`Missing cookie "${cookieName}".`);
      }

      return cookieValue;
    },
    getParam: (paramName) => {
      const paramValue = params && params[paramName];

      if (!paramValue) {
        throw new Error(`Missing request parameter "${paramName}".`);
      }

      return paramValue;
    },
  };
}
