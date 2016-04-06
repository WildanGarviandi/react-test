import * as actionTypes from '../constants';

const initialState = { isFetching: false, isValid: true, drivers: [] };

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.DRIVERS_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case actionTypes.DRIVERS_FETCH_SUCCESS:
      return _.assign({}, state, {
        isFetching: false, 
        isValid: true, 
        drivers: action.drivers
    });
    case actionTypes.DRIVERS_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    default:
      return state;
  }
}
