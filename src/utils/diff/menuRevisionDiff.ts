import { deepDiff } from './deepDiff';

const EXCLUDE_PROPERTIES = ['__typename', 'createdAt', 'updatedAt', 'version', 'defaultTemplate'];

export const menuRevisionDiff = (from, to) =>
  Object.entries(deepDiff(from, to))
    .filter(([key, value]) => {
      if (value.to === undefined || (value.from === undefined && value.to === null)) {
        if (key.includes('items') && key.includes('meta') && value.from !== undefined) {
          value.to = null;
          return true;
        }
        return false;
      }
      return true;
    })
    .reduce((acc, [key, value]) => {
      if (EXCLUDE_PROPERTIES.some(k => key.indexOf(k) > -1)) return acc;
      const split = key.split('.');
      split.reduce((acc, key, index) => {
        if (index === split.length - 1) {
          acc[key] = value.to;
        } else if (!acc[key]) acc[key] = {};
        return acc[key];
      }, acc);
      return acc;
    }, {});
