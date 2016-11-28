import fetch from 'isomorphic-fetch';
import config from './config';

const PostParams = (token, body, multipart) => {
  let request = {};
  request.method = 'post';
  request.headers = {
    'Accept': 'application/json',
    'LoginSessionKey': token
  };
  if (!multipart) {
    request.headers['Content-Type'] = 'application/json';
  }
  request.body = (multipart) ? body : JSON.stringify(body);

  return request;
}

export default (url, token, body = {}, isHubAPI = false, multipart) => {
  let baseUrl = isHubAPI ? config.baseUrlHub : config.baseUrl;
  return fetch(baseUrl + url, PostParams(token, body, multipart));
}
