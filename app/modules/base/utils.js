import _ from 'underscore';

export function ObjectFieldValue(obj, field) {
  var fields = field.split('.');
  return _.reduce(fields, function(memo, field) {
    if(typeof memo == "object") {
      return memo[field];
    }

    return memo;
  }, obj);
}
