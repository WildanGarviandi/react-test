import * as actionTypes from '../constants';
import fetch from '../../fetch/get';

export default () => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, hubID} = userLogged;

    const query = {
      hubID: hubID
    }

    dispatch({ type: actionTypes.CONTAINERS_FETCH_START});
    fetch('/container/', token, query).then(function(response) {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ type: actionTypes.CONTAINERS_FETCH_SUCCESS, containers: response.rows });
        });
      } else {
        dispatch({ type: actionTypes.CONTAINERS_FETCH_FAILED });        
      }
    });
  }
}
