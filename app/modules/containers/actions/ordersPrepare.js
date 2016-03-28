import {push} from 'react-router-redux';
import * as actionTypes from '../constants';
import fetch from '../../fetch/get';

export default (ordersID, containerID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, userID} = userLogged;

    const query = {
      ordersID: ordersID
    }

    dispatch({ type: actionTypes.ORDER_PREPARE_FETCH_START, ids: ordersID });
    fetch('/hub/ordersByID', token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.ORDER_PREPARE_FETCH_SUCCESS, orders: response.orders, containers: response.containers });
          dispatch(push('/container/' + containerID + '/fill'));
          return;
        });
      } else {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.ORDER_PREPARE_FETCH_FAILED, error: response.errorMessage});
          return;
        });
      }
    });
  }
}
