import * as actionTypes from '../constants';

const initialState = {isFetching: false, isValid: true, orders: [], fillAble: false, emptying: {isInProcess: false, isSuccess: false, error: ''}};

export default (state = initialState, action) => {
  switch(action.type) {
    case actionTypes.CONTAINER_DETAILS_FETCH_START:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS:
      return _.assign({}, state, action.container, {
        isFetching: false, isValid: true, 
        orders: action.orders, 
        trip: action.trip, 
        fillAble: action.fillAble,
        reusable: action.reusable,
        district: action.trip && action.trip.District && action.trip.District.DistrictID
      });
    case actionTypes.CONTAINER_DETAILS_FETCH_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    case actionTypes.ORDER_REMOVE_START:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => {
          if(order.UserOrderID != action.orderID) {
            return order;
          }

          return _.assign({}, order, {isDeleting: true});
        })
      });
    case actionTypes.ORDER_REMOVE_SUCCESS:
      if(!action.order) return state;
      return _.assign({}, state, {
        orders: _.filter(state.orders, (order) => (order.UserOrderID != action.order.UserOrderID))
      });
    case actionTypes.ORDER_REMOVE_FAILED:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => {
          if(order.UserOrderID != action.orderID) {
            return order;
          }

          return _.assign({}, order, {isDeleting: false});
        })
      });
    case actionTypes.CONTAINER_DISTRICT_PICK:
      return _.assign({}, state, {district: action.districtID});
    case actionTypes.CONTAINER_DISTRICT_RESET:
      return _.assign({}, state, {
        district: state.trip && state.trip.District && state.trip.District.DistrictID
      });
    case actionTypes.CONTAINER_CLEAR_START:
      return _.assign({}, state, {
        emptying: {isInProcess: true, isSuccess: false, error: ''}
      });
    case actionTypes.CONTAINER_CLEAR_SUCCESS:
      return _.assign({}, state, {
        emptying: {isInProcess: false, isSuccess: true, error: ''}
      });
    case actionTypes.CONTAINER_CLEAR_FAILED:
      return _.assign({}, state, {
        emptying: {isInProcess: false, isSuccess: false, error: action.error}
      });
    default:
      return state;
  }
}
