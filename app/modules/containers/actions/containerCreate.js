import * as actionTypes from '../constants';
import fetch from '../../fetch/post';
import {push} from 'react-router-redux';

export default () => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {hubID, token, userID} = userLogged;

    dispatch({type: actionTypes.CONTAINER_CREATE_START, id: hubID});
    fetch('/container/', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: actionTypes.CONTAINER_CREATE_SUCCESS, container: response.container});
          dispatch(push('/container/' + response.container.ContainerID));
        });
      } else {
        response.json().then(function(response) {
          dispatch({type: actionTypes.CONTAINER_CREATE_FAILED, error: response});
        });
      }
    })
  }
}
