import { ApolloClient, InMemoryCache } from '@apollo/client';
import { JAMIE_API_BASE_URL } from '../constants';

export default class ApiClient {
  static client: ApolloClient<unknown>;

  static setup(accessToken: string) {
    this.client = new ApolloClient({
      uri: JAMIE_API_BASE_URL,
      cache: new InMemoryCache({
        typePolicies: {
          MenuItem: {
            keyFields: ['id', 'menuId'],
          },
        },
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
}
