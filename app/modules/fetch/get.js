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

export default (url, token, query = {}, isHubAPI = false, isPublicAPI = false) => {
  let baseUrl = config.baseUrl;
  if (isHubAPI) {
    baseUrl = config.baseUrlHub;
  }
  if (isPublicAPI) {
    baseUrl = config.baseUrlPublic;
  }
  return fetch(baseUrl + url + UrlParams(query), GetParams(token)).then(function(response) {
    if (response.status === 403) {
      window.location.href = '/login';
    }
    return response;
  });
}
