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
          var orders = _.map(response.routes, (route) => {
            return _.assign({}, route.UserOrder, {
              Status: route.OrderStatus.OrderStatus
            });
          });

          dispatch({
            type: actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS, 
            ContainerID: containerID, 
            container: response.container, 
            orders: orders, 
            trip: response.trip, 
            fillAble: response.fillAble,
            reusable: response.reusable
          });
        });
      } else {
        response.json().then(function(response) {
          dispatch({type: actionTypes.CONTAINER_DETAILS_FETCH_FAILED, ContainerID: containerID, error: response.errorMessage});
        });
      }
    })
  }
}
