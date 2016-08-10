import lodash from 'lodash';
import Constants from '../constants';
import fetchGet from '../../fetch/get';
import fetchPost from '../../fetch/post';
import {OrderParser} from '../selector';
import ModalActions from '../../modals/actions';

export const startEditing = () => {
  return {type: Constants.EDIT_ORDER_START};
}

export const endEditing = () => {
  return {type: Constants.EDIT_ORDER_END};
}

export const editOrder = (id, order) => {
  return (dispatch, getState) => {
    const {userLogged, orderDetails} = getState().app;
    const {token} = userLogged;

    const postBody = {
      UpdateData: order,
    }

    dispatch({ type: Constants.UPDATE_ORDERS_START });
    fetchPost('/order/' + id, token, postBody).then((response) => {
      if(response.ok) {
        response.json().then(function({data}) {
          console.log('data', data);
          dispatch({
            type: Constants.DETAILS_SET,
            order: lodash.assign({}, orderDetails.order, order),
          });
          dispatch({ type: Constants.UPDATE_ORDERS_END });
          dispatch({ type: Constants.EDIT_ORDER_END });
        });
      } else {
        dispatch({ type: Constants.UPDATE_ORDERS_END });
        dispatch(ModalActions.addMessage('Failed to fetch order details'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.UPDATE_ORDERS_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}

export const fetchDetails = (id) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: Constants.DETAILS_FETCH_START });
    fetchGet('/order/' + id, token).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {
          console.log('data', data);
          dispatch({
            type: Constants.DETAILS_SET,
            order: OrderParser(data),
          });
          dispatch({ type: Constants.DETAILS_FETCH_END });
        });
      } else {
        dispatch({ type: Constants.DETAILS_FETCH_END });
        dispatch(ModalActions.addMessage('Failed to fetch order details'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}
