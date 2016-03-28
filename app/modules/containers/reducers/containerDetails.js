import * as actionTypes from '../constants';

export default (state = {}, action) => {
  switch(action.type) {
    case actionTypes.CONTAINER_DETAILS_FETCH_START:
      if(state.ContainerID != action.ContainerID) return state;
      return _.assign({}, state, {isFetching: true, isValid: false});
    case actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS:
      if(state.ContainerID != action.container.ContainerID) return state;
      return _.assign({}, state, {
        isFetching: false, isValid: true, 
        orders: action.orders, 
        trip: action.trip, 
        fillAble: action.fillAble,
        district: action.trip && action.trip.District && action.trip.District.DistrictID
    });
    case actionTypes.CONTAINER_DETAILS_FETCH_FAILED:
      if(state.ContainerID != action.ContainerID) return state;
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
      if(!action.route) return state;
      return _.assign({}, state, {
        orders: _.filter(state.orders, (order) => (order.UserOrderID != action.route.UserOrder.UserOrderID))
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
      if(state.ContainerID != action.containerID) return state;
      return _.assign({}, state, {district: action.districtID});
    case actionTypes.CONTAINER_DISTRICT_RESET:
      if(state.ContainerID != action.containerID) return state;
      return _.assign({}, state, {
        district: state.trip && state.trip.District && state.trip.District.DistrictID
      });
    default:
      return state;
  }
}
