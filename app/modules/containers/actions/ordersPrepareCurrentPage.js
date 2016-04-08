import * as actionTypes from '../constants';
import ordersPrepare from './ordersPrepare';

export default (currentPage) => {
  return (dispatch, getState) => {
    dispatch({type: actionTypes.ORDER_PREPARE_SET_CURRENTPAGE, currentPage: currentPage});
    dispatch(ordersPrepare());
  }
}
