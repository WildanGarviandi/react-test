import lodash from 'lodash';
import Constants from '../constants';

const initialState = {
  isFetching: true,
  trip: {},
}

export default (state = initialState, action) => {
  switch(action.type) {
    case Constants.TRIP_DETAILS_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.TRIP_DETAILS_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.TRIP_DETAILS_SET: {
      return lodash.assign({}, state, {trip: action.trip});
    }

    case "PICKDRIVERSTART": {
      return lodash.assign({}, state, {isDriver: true});
    }

    case "PICKDRIVEREND": {
      return lodash.assign({}, state, {isDriver: false});
    }

    default: return state;
  }
}
