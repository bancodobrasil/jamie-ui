import Keycloak from 'keycloak-js';
import { JAMIE_KEYCLOAK_BASE_URL, IS_DEVELOP } from './constants';

const keycloak = new Keycloak({
  url: JAMIE_KEYCLOAK_BASE_URL,
  realm: 'jamie',
  clientId: 'jamie',
});

export const initOptions = {
  onLoad: 'login-required',
  enableLogging: IS_DEVELOP,
  checkLoginIframe: false,
};

export default keycloak;
