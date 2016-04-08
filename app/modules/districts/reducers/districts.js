import * as actionTypes from '../constants';

const initialState = { isFetching: false, isValid: true, districts: [], active: {}};

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.DISTRICTS_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false, active: {}});
    case actionTypes.DISTRICTS_FETCH_SUCCESS:
      return _.assign({}, state, {isFetching: false, isValid: true, districts: action.districts});
    case actionTypes.DISTRICTS_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    default:
      return state;
  }
}
