import fetch from 'isomorphic-fetch';
import config from './config';

const DeleteParams = (token, body) => {
  return {
    method: 'delete',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'LoginSessionKey': token
    },
    body: JSON.stringify(body)
  }
}

export default (url, token, body = {}) => {
  return fetch(config.baseUrl + url, DeleteParams(token, body));
}
