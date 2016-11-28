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
    case Constants.RECEIVED_ORDERS_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.RECEIVED_ORDERS_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.RECEIVED_ORDERS_GROUP_START: {
      return lodash.assign({}, state, {isGrouping: true});
    }

    case Constants.RECEIVED_ORDERS_GROUP_END: {
      return lodash.assign({}, state, {isGrouping: false});
    }

    case Constants.RECEIVED_ORDERS_SET_FILTER: {
      return lodash.assign({}, state, {
        filter: lodash.assign({}, state.filter, action.filter),
      });
    }

    case Constants.RECEIVED_ORDERS_SET_LIST: {
      return lodash.assign({}, state, {
        list: action.list,
        selected: {},
        total: action.total,
      });
    }

    case Constants.RECEIVED_ORDERS_SET_STATE: {
      return lodash.assign({}, state, action.updatedState);
    }

    case Constants.RECEIVED_ORDERS_SET_SELECTED: {
      return lodash.assign({}, state, {selected: action.selected});
    }

    default: return state;
  }
}
