import * as actionTypes from '../constants';
import ordersPrepare from './ordersPrepare';

export default (limit) => {
  return (dispatch, getState) => {
    dispatch({type: actionTypes.ORDER_PREPARE_SET_LIMIT, limit: limit});
    dispatch({type: actionTypes.ORDER_PREPARE_SET_CURRENTPAGE, currentPage: 1});
    dispatch(ordersPrepare());
  }
}
