import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import fetchDelete from '../../fetch/delete';
import ModalsActions from '../../modals/actions';

export default (orderID) => {
  return (dispatch, getState) => {
    const {tripDetails, userLogged} = getState().app;
    const {token} = userLogged;
    const {trip} = tripDetails;

    const body = {
      ordersID: [orderID],
    };

    dispatch({type: actionTypes.ORDER_REMOVE_START, orderID: orderID});
    fetchDelete('/trip/' + trip.TripID + '/orders', token, body).then(function(response) {
      if(response.ok) {
        response.json().then(({data}) => {
          dispatch({type: actionTypes.ORDER_REMOVE_SUCCESS, orderID: orderID});
        });
      } else {
        dispatch(ModalsActions.addError('Failed to remove order'));
        response.json().then(function(response) {
          dispatch({type: actionTypes.ORDER_REMOVE_FAILED, orderID: orderID});
        })
      }
    }).catch(() => {
      dispatch(ModalsActions.addError('Network error while removing order'));
    });
  }
}
