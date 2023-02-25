import _ from 'lodash';

/*
  Based on: https://gist.github.com/Yimiprod/7ee176597fef230d1451?permalink_comment_id=3415430#gistcomment-3415430
*/
export function deepDiff(fromObject: object, toObject: object): object {
  const changes = {};

  const buildPath = (path: string, obj: object, key: string) =>
    _.isUndefined(path) ? key : `${path}.${key}`;

  const walk = (fromObject: object, toObject: object, path?: string) => {
    for (const key of _.keys(fromObject)) {
      const currentPath = buildPath(path, fromObject, key);
      if (!_.has(toObject, key)) {
        changes[currentPath] = { from: _.get(fromObject, key) };
      }
    }

    for (const [key, to] of _.entries(toObject)) {
      const currentPath = buildPath(path, toObject, key);
      if (!_.has(fromObject, key)) {
        changes[currentPath] = { to };
      } else {
        const from = _.get(fromObject, key);
        if (!_.isEqual(from, to)) {
          if (_.isObjectLike(to) && _.isObjectLike(from)) {
            walk(from, to, currentPath);
          } else {
            changes[currentPath] = { from, to };
          }
        }
      }
    }
  };

  walk(fromObject, toObject);

  return changes;
}
