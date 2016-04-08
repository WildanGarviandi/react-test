import * as actionTypes from '../constants';
import fetch from '../../fetch/post';

export default (containerID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: actionTypes.CONTAINER_ACTIVE_TOGGLE_START, id: containerID});
    fetch('/container/' + containerID, token).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: actionTypes.CONTAINER_ACTIVE_TOGGLE_SUCCESS, container: response.container});
        })
      } else {
        dispatch({type: actionTypes.CONTAINER_ACTIVE_TOGGLE_FAILED, id: containerID});
      }
    });
  }
}
