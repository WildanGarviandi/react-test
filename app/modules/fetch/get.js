import fetch from 'isomorphic-fetch';
import config from './config';

function IsArray(val) {
  return Object.prototype.toString.call(val) === Object.prototype.toString.call([]);
}

function UrlParam(key, vals) {
  if(IsArray(vals)) {
    return _.map(vals, (val) => (key + '=' + val.toString())).join('&');
  } else {
    return key + '=' + vals;
  }
}

function UrlParams(queries) {
  return '?' + _.map(queries, (vals, key) => (UrlParam(key, vals))).join('&');
}

function GetParams(token) {
  return {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'LoginSessionKey': token
    }
  }
};

export default (url, token, query = {}, isHubAPI = false) => {
  let baseUrl = isHubAPI ? config.baseUrlHub : config.baseUrl;
  return fetch(baseUrl + url + UrlParams(query), GetParams(token));
}
