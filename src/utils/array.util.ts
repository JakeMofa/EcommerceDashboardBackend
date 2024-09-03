import * as _ from 'lodash';

export function sumArrayValues(arr: Array<unknown>) {
  return _.reduce(
    arr,
    (result, obj) => {
      _.forOwn(obj, (value, key) => {
        if (result[key]) {
          result[key] += value;
        } else {
          result[key] = value;
        }
      });
      return result;
    },
    {} as { [key: string]: number },
  );
}
