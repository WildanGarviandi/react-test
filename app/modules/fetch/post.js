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

export default (url, token, body = {}, multipart) => {
  return fetch(config.baseUrl + url, PostParams(token, body, multipart));
}
