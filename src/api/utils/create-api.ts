import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
import {ApiRequest, createApiRequest} from './create-api-request';

export function createApi(
  handler: (request: ApiRequest) => Promise<APIGatewayProxyResult>
): (event: APIGatewayEvent) => Promise<APIGatewayProxyResult> {
  return async (event) => {
    try {
      return await handler(createApiRequest(event));
    } catch (error) {
      console.error('Unable to handle API request.', error);

      const searchParams = new URLSearchParams();

      searchParams.set(
        'error',
        error?.message || 'Unable to handle API request.'
      );

      return {
        statusCode: 302,
        headers: {Location: `/?${searchParams.toString()}`},
        body: '',
      };
    }
  };
}
