import fetch from 'isomorphic-fetch';
import config from './config';

const PostParams = (token, body) => {
  return {
    credentials: 'include',
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'LoginSessionKey': token
    },
    body: JSON.stringify(body)
  }
}

export default (url, token, body = {}) => {
  return fetch(config.baseUrl + url, PostParams(token, body));
}
