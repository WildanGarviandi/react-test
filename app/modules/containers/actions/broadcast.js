import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';

export default () => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: actionTypes.BROADCAST_START});
    fetchPost('/hub/broadcast', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
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
