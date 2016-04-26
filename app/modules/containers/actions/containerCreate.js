import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import {push} from 'react-router-redux';

export default () => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {hubID, token} = userLogged;

    dispatch({type: actionTypes.CONTAINER_CREATE_START, id: hubID});
    fetchPost('/container/', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({type: actionTypes.CONTAINER_CREATE_SUCCESS, container: response.container});
          dispatch(push('/container/' + response.container.ContainerID));
        });
      } else {
        response.json().then(function(response) {
          dispatch({type: actionTypes.CONTAINER_CREATE_FAILED, error: response});
        });
      }
    }).catch(() => {
      dispatch({type: actionTypes.CONTAINER_CREATE_FAILED});
    });
  }
}
