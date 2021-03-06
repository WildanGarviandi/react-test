import * as actionTypes from '../constants';
import ordersPrepare from './ordersPrepare';

export default (ids) => {
  return (dispatch, getState) => {
    dispatch({type: actionTypes.ORDER_PREPARE_SET_IDS, ids: ids});
    dispatch({type: actionTypes.ORDER_PREPARE_SET_CURRENTPAGE, currentPage: 1});
    dispatch(ordersPrepare());
  }
}
