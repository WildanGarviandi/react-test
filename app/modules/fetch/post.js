import fetch from 'isomorphic-fetch';

import config from './config';
import endpoints from '../../config/endpoints';

const PostParams = (token, body, multipart) => {
  const request = {};
  request.method = 'post';
  request.headers = {
    Accept: 'application/json',
    LoginSessionKey: token,
  };
  if (!multipart) {
    request.headers['Content-Type'] = 'application/json';
  }
  request.body = (multipart) ? body : JSON.stringify(body);

  return request;
};

export default (url, token, body = {}, isHubAPI = false, multipart) => {
  const baseUrl = isHubAPI ? config.baseUrlHub : config.baseUrl;
  return fetch(baseUrl + url, PostParams(token, body, multipart)).then((response) => {
    if (response.status === 403 && url !== endpoints.LOGIN_GOOGLE) {
      window.location.href = '/login';
    }
    return response;
  });
};
