import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import {push} from 'react-router-redux';

export default (containerID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: actionTypes.CONTAINER_CLEAR_START, ContainerID: containerID });
    fetchPost('/container/' + containerID + '/clear', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.CONTAINER_CLEAR_SUCCESS, ContainerID: containerID });
          dispatch(push('/container/' + containerID + '/fill'));
          return;
        });
      } else {
        response.json().then(function(response) {
          const error = (response.error && response.error.message) || '';
          dispatch({ type: actionTypes.CONTAINER_CLEAR_FAILED, ContainerID: containerID, error: error });
          return;
        });
      }
    }).catch(() => { 
      dispatch({ type: actionTypes.CONTAINER_CLEAR_FAILED, ContainerID: containerID, error: 'Network error' });
    });
  }
}
