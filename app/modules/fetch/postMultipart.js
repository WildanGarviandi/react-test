import fetch from 'isomorphic-fetch';
import config from './config';

const PostParams = (token, body) => {
  return {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'LoginSessionKey': token
    },
    body: body
  }
}

export default (url, token, body = {}) => {
  return fetch(config.baseUrl + url, PostParams(token, body));
}