import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';

export default () => {
  return (dispatch, getState) => {
    const {drivers, userLogged} = getState().app;
    const {token} = userLogged;

    if(drivers.drivers.length > 0) return;

    dispatch({ type: actionTypes.DRIVERS_FETCH_START});
    fetchGet('/driver/', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            type: actionTypes.DRIVERS_FETCH_SUCCESS, 
            drivers: response
          });
        });
      } else {
        dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED });
      }
    }).catch(() => {
        dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED });      
    });
  }
}
