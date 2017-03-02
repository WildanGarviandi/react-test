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

export default (url, token, body = {}, isHubAPI = false) => {
  let baseUrl = isHubAPI ? config.baseUrlHub : config.baseUrl;
  return fetch(baseUrl + url, DeleteParams(token, body)).then(function(response) {
    if (response.status === 403) {
      window.location.href = '/login';
    }
    return response;
  });
}
