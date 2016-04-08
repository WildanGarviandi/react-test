import zzz from 'isomorphic-fetch';
import config from './config';

const PostParams = (token, body) => {
  console.log('bd', body, JSON.stringify(body));
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
  return zzz(config.baseUrl + url, PostParams(token, body));
}
