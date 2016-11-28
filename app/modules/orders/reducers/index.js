import lodash from 'lodash';
import * as Constants from '../constants';

const initialOrderState = {
  list: [],
}

function OrderReducer(state = initialOrderState, action) {
  switch(action.type) {
    case Constants.PICKUP_ORDERS__SET: {
      return lodash.assign({}, state, {list: action.orders});
    }

    default: return state;
  }
}

export default OrderReducer;
