import * as actionTypes from '../constants';

const initialState = { isFetching: false, isValid: true, count: 0, orders: [], checkAll: false, ids: [], limit: 20, currentPage: 1, results: null };

const orderFn = (state = {}, action) => {
  switch(action.type) {
    case actionTypes.ORDER_PREPARE_TOGGLE_ALL:
      return _.assign({}, state, {checked: action.status});
    case actionTypes.ORDER_PREPARE_TOGGLE:
      if(state.UserOrderNumber != action.id || state.status == 'Success') return state;
      return _.assign({}, state, {checked: !state.checked});
    case actionTypes.CONTAINER_FILL_START:
      if(!state.checked) return state;
      return _.assign({}, state, {status: 'Processing'});
    case actionTypes.CONTAINER_FILL_SUCCESS:
      let result = _.find(action.results.result, (result) => (result.orderID == state.UserOrderID));
      if(!result) return state;
      return _.assign({}, state, { status: result.status });
    case actionTypes.CONTAINER_FILL_FAILED:
      if(!state.checked) return state;
      return _.assign({}, state, {status: 'Failed'});
    default: return state;
  }
}

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.ORDER_PREPARE_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false, results: null});
    case actionTypes.ORDER_PREPARE_FETCH_SUCCESS:
      return _.assign({}, state, {
        isFetching: false, isValid: true, count: action.count,
        orders: _.map(action.orders, (order) => (_.assign({}, order, {checked: false, status: ''})))
      });
    case actionTypes.ORDER_PREPARE_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false, error: action.error});
    case actionTypes.CONTAINER_FILL_START:
      return _.assign({}, state, {isFilling: true, results: null});
    case actionTypes.CONTAINER_FILL_SUCCESS:
      return _.assign({}, state, {isFilling: false, results: action.results});
    case actionTypes.CONTAINER_FILL_FAILED:
      return _.assign({}, state, {isFilling: false, results: null, errorMessage: action.error});
    case actionTypes.ORDER_PREPARE_TOGGLE:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => (orderFn(order, action)))
      });
    case actionTypes.ORDER_PREPARE_TOGGLE_ALL:
      return _.assign({}, state, {
        checkAll: action.status,
        orders: _.map(state.orders, (order) => (orderFn(order, action)))
      });
    case actionTypes.ORDER_PREPARE_SET_IDS:
      return _.assign({}, state, {ids: action.ids});
    case actionTypes.ORDER_PREPARE_SET_LIMIT:
      return _.assign({}, state, {limit: action.limit});
    case actionTypes.ORDER_PREPARE_SET_CURRENTPAGE:
      return _.assign({}, state, {currentPage: action.currentPage});
    default: return state;
  }
}
