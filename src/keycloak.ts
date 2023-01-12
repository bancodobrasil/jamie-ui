import Keycloak from 'keycloak-js';
import { JAMIE_KEYCLOAK_BASE_URL } from './constants';

const keycloak = new Keycloak({
  url: JAMIE_KEYCLOAK_BASE_URL,
  realm: 'jamie',
  clientId: 'jamie',
});

export default keycloak;
