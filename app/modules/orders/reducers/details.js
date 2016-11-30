import lodash from 'lodash';
import Constants from '../constants';

const initialState = {
  isFetching: false,
  isUpdating: false,
  isEditing: false,
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

    case Constants.EDIT_ORDER_START: {
      return lodash.assign({}, state, {isEditing: true});
    }

    case Constants.EDIT_ORDER_END: {
      return lodash.assign({}, state, {isEditing: false});
    }

    case Constants.DETAILS_SET: {
      return lodash.assign({}, state, {order: action.order});
    }

    case Constants.UPDATE_ORDERS_START: {
      return lodash.assign({}, state, {isUpdating: true});
    }

    case Constants.UPDATE_ORDERS_END: {
      return lodash.assign({}, state, {isUpdating: false});
    }

    default: return state;
  }
}
