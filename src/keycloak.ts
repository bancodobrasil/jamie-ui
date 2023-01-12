import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: process.env.JAMIE_KEYCLOAK_BASE_URL,
  realm: 'jamie',
  clientId: 'jamie',
});

export default keycloak;
