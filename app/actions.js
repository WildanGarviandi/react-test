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

export const CONTAINERS_FETCH = 'CONTAINERS_FETCH';
export const CONTAINERS_RECEIVED = 'CONTAINERS_RECEIVED';
export const CONTAINERS_FAILED = 'CONTAINERS_FAILED';

export const CONTAINER_DETAILS_FETCH = 'CONTAINER_DETAILS_FETCH';
export const CONTAINER_DETAILS_RECEIVED = 'CONTAINER_DETAILS_RECEIVED';
export const CONTAINER_DETAILS_FAILED = 'CONTAINER_DETAILS_FAILED';

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

export const LOGIN_START = 'LOGIN_START';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILED = 'LOGIN_FAILED';

export const LOGOUT_START = 'LOGOUT_START';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILED = 'LOGOUT_FAILED';

export const CREATE_CONTAINER_START = 'CREATE_CONTAINER_START';
export const CREATE_CONTAINER_SUCCESS = 'CREATE_CONTAINER_SUCCESS';
export const CREATE_CONTAINER_FAILED = 'CREATE_CONTAINER_FAILED';

export const REMOVE_ORDER_START = 'REMOVE_ORDER_START';
export const REMOVE_ORDER_SUCCESS = 'REMOVE_ORDER_SUCCESS';
export const REMOVE_ORDER_FAILED = 'REMOVE_ORDER_FAILED';

export const TOGGLE_CONTAINER_ACTIVE_START = 'TOGGLE_CONTAINER_ACTIVE_START';
export const TOGGLE_CONTAINER_ACTIVE_SUCCESS = 'TOGGLE_CONTAINER_ACTIVE_SUCCESS';
export const TOGGLE_CONTAINER_ACTIVE_FAILED = 'TOGGLE_CONTAINER_ACTIVE_FAILED';

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

export function loginUser(email, pass) {
  return dispatch => {
    dispatch({ type: LOGIN_START });

    const params = { username: email, password: pass };
    fetch(baseUrl + '/sign-in', BasePostParams(params)).then(function(response) {
      if (response.status >= 400) {
        dispatch({ type: LOGIN_FAILED });
        return;
      }

      return response.json();
    }).then(function(response) {
      if(response) {
        dispatch({ type: LOGIN_SUCCESS, user: response.data.SignIn });
        dispatch(push('/hubOrder'));
        return;
      }
    });
  }
}

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

export function containersFetch() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, userID} = userLogged;

    dispatch({ type: CONTAINERS_FETCH});
    fetch(baseUrl + '/container/?HubID=' + localStorage.HubID, GetParams(token)).then(function(response) {
      if (response.status >= 400) {
        dispatch({ type: CONTAINERS_FAILED });
        return;
      }

      return response.json();
    }).then(function(response) {
      if(response) {
        dispatch({ type: CONTAINERS_RECEIVED, containers: response.rows });
        return;
      }
    });
  }
}

export function selectedOrdersToggle(orderID) {
  return {type: SELECTED_ORDERS_TOGGLE, ID: orderID};
}

export function selectedOrdersFetch(ordersID, containerID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, userID} = userLogged;

    const ordersIDStr = _.map(ordersID, (orderID) => ('&ordersID=' + orderID));
    const qs = "?FleetManagerID=" + userID + ordersIDStr.join('');

    dispatch({ type: SELECTED_ORDERS_FETCH, ids: ordersID });
    fetch(baseUrl + '/hub/ordersByID' + qs, GetParams(token)).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: SELECTED_ORDERS_RECEIVED, orders: response });
          dispatch(push('/container/' + containerID + '/fill'));
          return;
        });
      } else {
        response.json().then(function(response) {
          dispatch({ type: SELECTED_ORDERS_FAILED, error: response.errorMessage});
          return;
        });
      }
    });
  }
}

export function pickContainer(containerNumber) {
  return {type: PICK_CONTAINER, container: containerNumber};
}

export function pickDistrict(districtID) {
  return {type: PICK_DISTRICT, district: districtID};
}

export function districtsFetch() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: DISTRICT_FETCH });
    fetch(baseUrl + '/hub/districts', GetParams(token)).then(function(response) {
      if (response.status >= 400) {
        dispatch({ type: DISTRICT_FAILED });
        return;
      }

      return response.json();
    }).then(function(response) {
      if(response) {
        dispatch({ type: DISTRICT_RECEIVED, districts: response });
        return;
      }
    });
  }
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

export function containerDetails(containerID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, userID} = userLogged;

    dispatch({type: CONTAINER_DETAILS_FETCH});
    fetch(baseUrl + '/container/' + containerID, GetParams(token)).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: CONTAINER_DETAILS_RECEIVED, container: response.container, orders: response.orders, trip: response.trip, fillAble: response.fillAble});
          return;
        });
      } else {
        response.json().then(function(response) {
          dispatch({type: CONTAINER_DETAILS_FAILED, error: response.errorMessage});
          return;
        });
      }
    })
  }
}

export function selectedOrdersReset() {
  return {type: SELECTED_ORDERS_RESET};
}

export function createContainer() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, userID} = userLogged;
    const hubID = localStorage.HubID;

    dispatch({type: CREATE_CONTAINER_START, id: hubID});
    fetch(baseUrl + '/container/', BasePostParams({HubID: hubID}, token)).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: CREATE_CONTAINER_SUCCESS, container: response.container});
          dispatch(push('/container' + response.container.ContainerID));
        });
      } else {
        response.json().then(function(response) {
          dispatch({type: CREATE_CONTAINER_FAILED, error: response});
        });
      }
    })
  }
}

export function removeOrderFromContainer(orderID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {container} = getState().app.containerDetails;
    const {token, userID} = userLogged;

    const params = {
      orderID: orderID
    }

    dispatch({type: REMOVE_ORDER_START, orderID: orderID});
    fetch(baseUrl + '/hub/order/removeFromContainer', BasePostParams(params, token)).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: REMOVE_ORDER_SUCCESS, route: response.route});
        })
      } else {
        response.json().then(function(response) {
          dispatch({type: REMOVE_ORDER_FAILED, response: response});
        })
      }
    });
  }
}

export function toggleContainerActiveStatus(containerID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: TOGGLE_CONTAINER_ACTIVE_START, id: containerID});
    fetch(baseUrl + '/container/' + containerID, BasePostParams({}, token)).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: TOGGLE_CONTAINER_ACTIVE_SUCCESS, container: response.container});
        })
      } else {
        dispatch({type: TOGGLE_CONTAINER_ACTIVE_FAILED, id: containerID});
      }
    });
  }
}
