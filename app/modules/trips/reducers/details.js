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

    case "ORDER_REMOVE_SUCCESS": {
      const routes = state.trip.UserOrderRoutes;
      const newRoutes = lodash.filter(routes, (route) => {
        return route.UserOrder.UserOrderID !== action.orderID;
      });

      return lodash.assign({}, state, {
        trip: lodash.assign({}, state.trip, {
          UserOrderRoutes: newRoutes,
        }),
      });
    }

    case "ORDER_REMOVE_START": {
      const newRoutes = lodash.reduce(state.trip.UserOrderRoutes, (acc, route) => {
        if(route.UserOrder.UserOrderID === action.orderID) {
          acc.push(lodash.assign({}, route, {
            UserOrder: lodash.assign({}, route.UserOrder, {
              isDeleting: true,
            }),
          }));
        } else {
          acc.push(route);
        }

        return acc;
      }, []);

      return lodash.assign({}, state, {
        trip: lodash.assign({}, state.trip, {
          UserOrderRoutes: newRoutes,
        }),
      });
    }

    case "ORDER_REMOVE_FAILED": {
      const newRoutes = lodash.reduce(state.trip.UserOrderRoutes, (acc, route) => {
        if(route.UserOrder.UserOrderID === action.orderID) {
          acc.push(lodash.assign({}, route, {
            UserOrder: lodash.assign({}, route.UserOrder, {
              isDeleting: false,
            }),
          }));
        } else {
          acc.push(route);
        }

        return acc;
      }, []);

      return lodash.assign({}, state, {
        trip: lodash.assign({}, state.trip, {
          UserOrderRoutes: newRoutes,
        }),
      });
    }

    default: return state;
  }
}
