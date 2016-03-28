import * as actionTypes from '../constants';
import fetch from '../../fetch/get';
import push from 'react-router-redux';

export default (containerID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token, userID} = userLogged;

    dispatch({type: actionTypes.CONTAINER_DETAILS_FETCH_START, ContainerID: containerID});
    fetch('/container/' + containerID, token).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({type: actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS, container: response.container, orders: response.orders, trip: response.trip, fillAble: response.fillAble});
          return;
        });
      } else {
        response.json().then(function(response) {
          dispatch({type: actionTypes.CONTAINER_DETAILS_FETCH_FAILED, ContainerID: containerID, error: response.errorMessage});
          return;
        });
      }
    })
  }
}
