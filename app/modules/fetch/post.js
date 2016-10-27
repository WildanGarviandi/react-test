import fetch from 'isomorphic-fetch';
import config from './config';

const PostParams = (token, body) => {
  return {
    method: 'post',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'LoginSessionKey': token
    },
    body: JSON.stringify(body)
  }
}

export default (url, token, body = {}, isHubAPI = false) => {
  let baseUrl = isHubAPI ? config.baseUrlHub : config.baseUrl;
  return fetch(baseUrl + url, PostParams(token, body));
}
