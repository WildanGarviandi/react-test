import * as actionTypes from '../constants';
const initialState = { isFetching: false, isValid: true, message: '' };

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.BROADCAST_START:
      return _.assign({}, state, {isFetching: true, isValid: false, message: 'Broadcasting...'});
    case actionTypes.BROADCAST_SUCCESS:
      return _.assign({}, state, {isFetching: false, isValid: true, message: action.message});
    case actionTypes.BROADCAST_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false, message: 'Broadcast failed'});
    default:
      return state;
  }
}
