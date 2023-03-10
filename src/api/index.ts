import { ApolloClient, InMemoryCache } from '@apollo/client';
import { JAMIE_API_BASE_URL } from '../constants';

const client = new ApolloClient({
  uri: JAMIE_API_BASE_URL,
  cache: new InMemoryCache({
    typePolicies: {
      MenuItem: {
        keyFields: ['id', 'menuId'],
      },
    },
  }),
});

export { client };
