import fetch from 'isomorphic-fetch';
import config from './config';

const IsArray = (val) => {
  return Object.prototype.toString.call(val) === Object.prototype.toString.call([]);
}

const UrlParam = (key, vals) => {
  if(IsArray(vals)) {
    return _.map(vals, (val) => (key + '=' + val.toString())).join('&');
  } else {
    return key + '=' + vals;
  }
}

const UrlParams = (queries) => {
  return '?' + _.map(queries, (vals, key) => (UrlParam(key, vals))).join('&');
}

const GetParams = (token) => {
  return {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'LoginSessionKey': token
    }
  }
};

export default (url, token, query = {}) => {
  return fetch(config.baseUrl + url + UrlParams(query), GetParams(token));
}
