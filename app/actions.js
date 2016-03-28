import fetch from 'isomorphic-fetch';
import {push} from 'react-router-redux';
import _ from 'underscore';

export const PAGED_ORDERS_FETCH = 'PAGED_ORDERS_FETCH';
export const PAGED_ORDERS_RECEIVED = 'PAGED_ORDERS_RECEIVED';
export const PAGED_ORDERS_FAILED = 'PAGED_ORDERS_FAILED';
export const PAGED_ORDERS_LIMIT = 'PAGED_ORDERS_LIMIT';
export const PAGED_ORDERS_PAGE = 'PAGED_ORDERS_PAGE';

export const SELECTED_ORDERS_FETCH = 'SELECTED_ORDERS_FETCH';
export const SELECTED_ORDERS_RECEIVED = 'SELECTED_ORDERS_RECEIVED';
export const SELECTED_ORDERS_FAILED = 'SELECTED_ORDERS_FAILED';
export const SELECTED_ORDERS_TOGGLE = 'SELECTED_ORDERS_TOGGLE';
export const SELECTED_ORDERS_RESET = 'SELECTED_ORDERS_RESET';

export const DISTRICT_FETCH = 'DISTRICT_FETCH';
export const DISTRICT_RECEIVED = 'DISTRICT_RECEIVED';
export const DISTRICT_FAILED = 'DISTRICT_FAILED';

export const FILL_CONTAINER_INITIATE = 'FILL_CONTAINER_INITIATE';
export const FILL_CONTAINER_PREPARE = 'FILL_CONTAINER_PREPARE';
export const FILL_CONTAINER_POST = 'FILL_CONTAINER_POST';
export const FILL_CONTAINER_SUCCESS = 'FILL_CONTAINER_SUCCESS';
export const FILL_CONTAINER_FAILED = 'FILL_CONTAINER_FAILED';

export const PICK_CONTAINER = 'PICK_CONTAINER';
export const PICK_DISTRICT = 'PICK_DISTRICT';

export const REMOVE_ORDER_START = 'ORDER_REMOVE_START';
export const REMOVE_ORDER_SUCCESS = 'ORDER_REMOVE_START';
export const REMOVE_ORDER_FAILED = 'ORDER_REMOVE_START';

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

export function selectedOrdersToggle(orderID) {
  return {type: SELECTED_ORDERS_TOGGLE, ID: orderID};
}

export function pickDistrict(districtID) {
  return {type: PICK_DISTRICT, district: districtID};
}

export function fillContainer(containerNumber, ordersID, districtID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, userID} = userLogged;

    const params = {
      LoginSessionKey: token,
      FleetManagerID: userID,
      ContainerNumber: containerNumber,
      OrdersID: ordersID,
      DistrictID: districtID
    };

    dispatch({ type: FILL_CONTAINER_POST, orders: ordersID });
    fetch(baseUrl + '/container/fill', BasePostParams(params)).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: FILL_CONTAINER_SUCCESS, results: response.data });
          return;
        });
      } else {
        response.json().then(function(response) {
          dispatch({ type: FILL_CONTAINER_FAILED, error: response.errorMessage });
          return;
        });
      }
    });
  }
}

export function selectedOrdersReset() {
  return {type: SELECTED_ORDERS_RESET};
}
