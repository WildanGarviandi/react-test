import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';

export default (containerID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: actionTypes.CONTAINER_ACTIVE_TOGGLE_START, id: containerID});
    fetchPost('/container/' + containerID, token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({type: actionTypes.CONTAINER_ACTIVE_TOGGLE_SUCCESS, container: response.container});
        })
      } else {
        dispatch({type: actionTypes.CONTAINER_ACTIVE_TOGGLE_FAILED, id: containerID});
      }
    });
  }
}
