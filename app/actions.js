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

export function pagedOrdersFetch() {
  return (dispatch, getState) => {
    const {userLogged, pagedOrders} = getState().app;
    const {token, userID} = userLogged;
    const {limit, page} = pagedOrders;

    const qs = '?FleetManagerID=' + userID + '&limit=' + limit + '&offset=' + (page-1)*limit;

    dispatch({ type: PAGED_ORDERS_FETCH});
    fetch(baseUrl + '/hub/orders' + qs, GetParams(token)).then(function(response) {
      if (response.status >= 400) {
        dispatch({ type: PAGED_ORDERS_FAILED });
        return;
      }

      return response.json();
    }).then(function(response) {
      if(response) {
        dispatch({ type: PAGED_ORDERS_RECEIVED, orders: response });
        return;
      }
    });
  }
}

export function pagedOrdersLimit(limit) {
  return dispatch => {
    dispatch({ type: PAGED_ORDERS_LIMIT, limit: limit });
    dispatch(pagedOrdersFetch());
  };
}

export function pagedOrdersPage(page) {
  return dispatch => {
    dispatch({ type: PAGED_ORDERS_PAGE, page: page });
    dispatch(pagedOrdersFetch());
  };
}
