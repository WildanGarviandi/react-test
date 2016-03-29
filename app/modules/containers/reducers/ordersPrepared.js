import * as actionTypes from '../constants';

const initialState = { isFetching: false, isValid: true, containers: {}, orders: [], ids: [] };

const orderFn = (state = {}, action) => {
  switch(action.type) {
    case actionTypes.ORDER_PREPARE_TOGGLE:
      if(state.UserOrderNumber != action.id || state.status == 'Success') return state;
      return _.assign({}, state, {checked: !state.checked});
    case actionTypes.CONTAINER_FILL_START:
      if(!state.checked) return state;
      return _.assign({}, state, {status: 'Processing'});
    case actionTypes.CONTAINER_FILL_SUCCESS:
      let result = _.find(action.results.result, (result) => (result.orderID == state.UserOrderID));

      if(!result) return state;

      let containerNumber = 'Failed';
      let checked = true;
      if(result.status == 'Success') {
        let tripx = _.find(action.results.trips, (trip) => (trip.UserOrder.UserOrderID == state.UserOrderID));

        containerNumber = tripx.ContainerNumber;
        checked = false;
      }

      return _.assign({}, state, {
        status: result.status, 
        containerNumber: containerNumber,
        checked: checked
      });
    case actionTypes.CONTAINER_FILL_FAILED:
      if(!state.checked) return state;
      return _.assign({}, state, {status: 'Failed'});
    default: return state;
  }
}

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.ORDER_PREPARE_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false, orders: [], ids: action.ids});
    case actionTypes.ORDER_PREPARE_FETCH_SUCCESS:
      return _.assign({}, state, {
        isFetching: false, isValid: true, 
        orders: _.map(action.orders, (order) => (_.assign({}, order, {checked: true, status: ''}))),
        containers: action.containers
      });
    case actionTypes.ORDER_PREPARE_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false, error: action.error, orders: [], ids: []});
    case actionTypes.CONTAINER_FILL_START:
      return _.assign({}, state, {
        isFilling: true,
        orders: _.map(state.orders, (order) => (orderFn(order, action)))
      });
    case actionTypes.CONTAINER_FILL_SUCCESS:
    case actionTypes.CONTAINER_FILL_FAILED:
      return _.assign({}, state, {
        isFilling: false,
        orders: _.map(state.orders, (order) => (orderFn(order, action)))
      });
    case actionTypes.ORDER_PREPARE_TOGGLE:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => (orderFn(order, action)))
      });
    default: return state;
  }
}
