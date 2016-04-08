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
    case actionTypes.DRIVERS_PICK_START:
      return _.assign({}, state, {isPicking: true, isPicked: false, error: ''});
    case actionTypes.DRIVERS_PICK_SUCCESS:
      return _.assign({}, state, {isPicking: false, isPicked: true, error: 'Driver have been set'});
    case actionTypes.DRIVERS_PICK_FAILED:
      return _.assign({}, state, {isPicking: false, isPicked: false, error: action.error});
    default:
      return state;
  }
}
