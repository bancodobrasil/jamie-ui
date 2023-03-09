/* eslint-disable no-template-curly-in-string */
const getConfig = varname => {
  if (process.env.NODE_ENV === 'production') {
    return varname;
  }
  return process.env[varname.replace(/\$|\{|\}/g, '')];
};

export const JAMIE_UI_BASE_URL = getConfig('${JAMIE_UI_BASE_URL}');
export const JAMIE_KEYCLOAK_BASE_URL = getConfig('${JAMIE_KEYCLOAK_BASE_URL}');
export const JAMIE_API_BASE_URL = getConfig('${JAMIE_API_BASE_URL}');
export const IS_DEVELOP = getConfig('${NODE_ENV}') === 'develop';
