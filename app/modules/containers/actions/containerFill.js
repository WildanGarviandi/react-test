import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import push from 'react-router-redux';
import ModalsActions from '../../modals/actions';

export default (containerNumber, ordersID, districtID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const params = {
      ContainerNumber: containerNumber,
      OrdersID: ordersID,
      DistrictID: districtID
    };

    dispatch({ type: actionTypes.CONTAINER_FILL_START, orders: ordersID, containerNumber: containerNumber, districtID: districtID });
    fetchPost('/container/fill', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.CONTAINER_FILL_SUCCESS, results: response });
          return;
        });
      } else {
        response.json().then(function(response) {
          const error = (response.errorMessage ? response.errorMessage : response.error.message);
          dispatch({ type: actionTypes.CONTAINER_FILL_FAILED });
          dispatch(ModalsActions.addError(error));
          return;
        });
      }
    }).catch(() => { 
      dispatch({ type: actionTypes.CONTAINER_FILL_FAILED });
      dispatch(ModalsActions.addError('Network error while filling container'));
    });
  }
}
