import * as actionTypes from '../constants';
import fetch from '../../fetch/post';
import push from 'react-router-redux';

export default (containerNumber, ordersID, districtID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const params = {
      ContainerNumber: containerNumber,
      OrdersID: ordersID,
      DistrictID: districtID
    };

    dispatch({ type: actionTypes.CONTAINER_FILL_START, orders: ordersID });
    fetch('/container/fillEverything', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.CONTAINER_FILL_SUCCESS, results: response.data });
          return;
        });
      } else {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.CONTAINER_FILL_FAILED, error: response.errorMessage });
          return;
        });
      }
    });
  }
}
