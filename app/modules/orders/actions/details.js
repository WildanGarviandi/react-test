import lodash from 'lodash';
import Constants from '../constants';
import fetchGet from '../../fetch/get';
import fetchPost from '../../fetch/post';
import {OrderParser} from '../selector';
import ModalActions from '../../modals/actions';
import {modalAction} from '../../modals/constants';

export const startEditing = () => {
  return {type: Constants.EDIT_ORDER_START};
}

export const endEditing = () => {
  return {type: Constants.EDIT_ORDER_END};
}

export const revertSuccessEditing = () => {
  return {type: Constants.REVERT_SUCCESS_EDITING};
}

export const editOrder = (id, order, fromInbound) => {
  return (dispatch, getState) => {
    const {userLogged, orderDetails} = getState().app;
    const {token} = userLogged;

    const postBody = {
      UpdateData: order,
    }

    dispatch({ type: Constants.UPDATE_ORDERS_START });
    dispatch({ type: modalAction.BACKDROP_SHOW });
    fetchPost('/order/' + id, token, postBody).then((response) => {
      if(response.ok) {
        response.json().then(function({data}) {
          dispatch({
            type: Constants.DETAILS_SET,
            order: lodash.assign({}, orderDetails.order, order),
          });
          dispatch({ type: Constants.UPDATE_ORDERS_END });
          dispatch({ type: Constants.EDIT_ORDER_END });
          dispatch({ type: modalAction.BACKDROP_HIDE });
        });
        if (fromInbound) {
          dispatch({ type: Constants.SUCCESS_EDITING });
        }
      } else {
        dispatch({ type: Constants.UPDATE_ORDERS_END });
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(ModalActions.addMessage('Failed to edit order details'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.UPDATE_ORDERS_END });
      dispatch({ type: modalAction.BACKDROP_HIDE });
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
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(function({data}) {
        dispatch({
          type: Constants.DETAILS_SET,
          order: OrderParser(data),
        });
        dispatch({ type: Constants.DETAILS_FETCH_END });
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to fetch order details";
      dispatch({ type: Constants.DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage(message));
    });
  }
}
