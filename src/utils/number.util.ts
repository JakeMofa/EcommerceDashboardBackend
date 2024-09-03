import * as _ from 'lodash';

export function ifNullValue(value: number | null | undefined, returnValue: number): number {
  if (_.isNaN(value) || _.isUndefined(value) || _.isNull(value)) {
    return returnValue;
  }
  return value;
}
