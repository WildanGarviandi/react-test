import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';

export default () => {
  return (dispatch, getState) => {
    const {districts, userLogged} = getState().app;
    const {token} = userLogged;

    if(districts.districts.length > 0) return;

    dispatch({ type: actionTypes.DISTRICTS_FETCH_START});
    fetchGet('/hub/districts', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.DISTRICTS_FETCH_SUCCESS, districts: response.data.districts.rows });
        });
      } else {
        dispatch({ type: actionTypes.DISTRICTS_FETCH_FAILED });        
      }
    });
  }
}
