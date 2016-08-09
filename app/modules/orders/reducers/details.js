import lodash from 'lodash';
import Constants from '../constants';

const initialState = {
  isFetching: false,
  order: {},
}

export default (state = initialState, action) => {
  switch(action.type) {
    case Constants.DETAILS_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.DETAILS_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.DETAILS_SET: {
      return lodash.assign({}, state, {order: action.order});
    }

    default: return state;
  }
}
