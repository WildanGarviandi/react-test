import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';
import toggleAll from './orderToggleAll';

export default () => {
  return (dispatch, getState) => {
    const {userLogged, ordersPrepared} = getState().app;
    const {token} = userLogged;
    const ordersID = ordersPrepared.ids;
    const limit = ordersPrepared.limit;
    const offset = (ordersPrepared.currentPage-1)*limit;

    const query = {
      ordersID: ordersID || [],
      limit: limit,
      offset: offset
    }

    dispatch({ type: actionTypes.ORDER_PREPARE_FETCH_START, ids: ordersID, limit: limit, offset: offset });
    fetchGet('/hub/ordersByID', token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({ type: actionTypes.ORDER_PREPARE_FETCH_SUCCESS, orders: response.rows, count: response.count });
          dispatch(toggleAll(true));
          return;
        });
      } else {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.ORDER_PREPARE_FETCH_FAILED, error: response.error.message});
          return;
        });
      }
    }).catch(() => {
      dispatch({ type: actionTypes.ORDER_PREPARE_FETCH_FAILED, error: response.error.message});      
    });
  }
}
