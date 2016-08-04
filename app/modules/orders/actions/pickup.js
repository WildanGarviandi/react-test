import lodash from 'lodash';
import * as Constants from '../constants';
import {OrderParser} from '../selector';
import fetchGet from '../../fetch/get';

function Fetch() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, hubID} = userLogged;

    const query = {
    }

    fetchGet('/container/dummy', token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {
          const orders = lodash.map(data, OrderParser);
          dispatch({ type: Constants.PICKUP_ORDERS__SET, orders: orders });
        });
      } else {
        dispatch({ type: Constants.CONTAINERS_FETCH_FAILED });
      }
    });
  }
}

function updateFilter() {
  return [];
}

function GetPickupOrders() {
  return (dispatch, getState) => {
    dispatch({type: Constants.SET_ORDER});
  }
}

function ToggleChecked(id) {
  return {type: PICKUP_ORDERS__TOGGLE_CHECKED, id: id};
}

export default {
  Fetch,
  GetPickupOrders,
  updateFilter,
}
