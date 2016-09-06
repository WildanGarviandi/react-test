import fetch from 'isomorphic-fetch';
import {push} from 'react-router-redux';

export const PAGED_ORDERS_FETCH = 'PAGED_ORDERS_FETCH';
export const PAGED_ORDERS_RECEIVED = 'PAGED_ORDERS_RECEIVED';
export const PAGED_ORDERS_FAILED = 'PAGED_ORDERS_FAILED';
export const PAGED_ORDERS_LIMIT = 'PAGED_ORDERS_LIMIT';
export const PAGED_ORDERS_PAGE = 'PAGED_ORDERS_PAGE';

const baseUrl = 'http://localhost:3001/v2/fleet';

const BasePostParams = (body, token) => {
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

const GetParams = (token) => {
  return {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'LoginSessionKey': token
    }
  }
};
