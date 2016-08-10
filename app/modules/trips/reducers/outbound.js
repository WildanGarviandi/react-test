import lodash from 'lodash';
import Constants from '../constants';

const initialState = {
  currentPage: 1,
  filter: {},
  isFetching: false,
  limit: 100,
  list: [],
  selected: {},
  total: 0,
}

export default (state = initialState, action) => {
  switch(action.type) {
    case Constants.OUTBOUND_TRIPS_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.OUTBOUND_TRIPS_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.OUTBOUND_TRIPS_SET_LIST: {
      return lodash.assign({}, state, {
        list: action.list,
        selected: {},
        total: action.total,
      });
    }

    case Constants.PICKUP_ORDERS_SET_STATE: {
      return lodash.assign({}, state, action.updatedState);
    }

    default: return state;
  }
}
