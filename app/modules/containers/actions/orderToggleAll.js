import * as actionTypes from '../constants';
export default (active) => ({type: actionTypes.ORDER_PREPARE_TOGGLE_ALL, status: !active});
