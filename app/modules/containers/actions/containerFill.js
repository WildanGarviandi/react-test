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

    dispatch({ type: actionTypes.CONTAINER_FILL_START, orders: ordersID, containerNumber: containerNumber, districtID: districtID });
    fetch('/container/fill', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.CONTAINER_FILL_SUCCESS, results: response });
          return;
        });
      } else {
        response.json().then(function(response) {
          const error = (response.errorMessage ? response.errorMessage : response.error.message);
          dispatch({ type: actionTypes.CONTAINER_FILL_FAILED, error: error });
          return;
        });
      }
    }).catch(() => { 
      dispatch({ type: actionTypes.CONTAINER_FILL_FAILED, error: 'Network error' });
    });
  }
}
