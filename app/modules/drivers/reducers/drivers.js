import * as actionTypes from '../constants';

const initialState = { isFetching: false, isValid: true, drivers: [], isPicking: false, isPicked: false, error: '' };

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
    case actionTypes.DRIVER_DEASSIGN_START:
      return _.assign({}, state, {isDeassigning: true, isDeassigned: false});
    case actionTypes.DRIVER_DEASSIGN_SUCCESS:
      return _.assign({}, state, {isDeassigning: false, isDeassigned: true});
    case actionTypes.DRIVER_DEASSIGN_FAILED:
      return _.assign({}, state, {isDeassigning: false, isDeassigned: false});
    default:
      return state;
  }
}
