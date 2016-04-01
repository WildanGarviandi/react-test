import * as actionTypes from '../constants';
import fetch from '../../fetch/post';

export default () => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: actionTypes.BROADCAST_START});
    fetch('/hub/broadcast', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: actionTypes.BROADCAST_SUCCESS, message: response.message});
        });
      } else {
        response.json().then(function(response) {
          dispatch({type: actionTypes.BROADCAST_FAILED});
        });
      }
    }).catch(() => {
          dispatch({type: actionTypes.BROADCAST_FAILED});
    }); 
  }
}
