import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';

export default (orderID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: actionTypes.ORDER_REMOVE_START, orderID: orderID});
    fetchPost('/hub/order/' + orderID + '/removeContainer', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({type: actionTypes.ORDER_REMOVE_SUCCESS, order: response.order});
        })
      } else {
        response.json().then(function(response) {
          dispatch({type: actionTypes.ORDER_REMOVE_FAILED, orderID: orderID});
        })
      }
    });
  }
}
