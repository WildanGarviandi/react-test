import _ from 'lodash';
import { combineReducers } from 'redux';
import { CONTAINERS_FETCH, CONTAINERS_FAILED, CONTAINERS_RECEIVED, DISTRICT_FAILED, DISTRICT_FETCH, DISTRICT_RECEIVED, LOGIN_START, LOGIN_SUCCESS, LOGIN_FAILED, PAGED_ORDERS_FETCH, PAGED_ORDERS_RECEIVED, PAGED_ORDERS_FAILED, PAGED_ORDERS_LIMIT, PAGED_ORDERS_PAGE, SELECTED_ORDERS_FETCH, SELECTED_ORDERS_FAILED, SELECTED_ORDERS_RECEIVED, SELECTED_ORDERS_RESET, SELECTED_ORDERS_TOGGLE, PICK_CONTAINER, PICK_DISTRICT, FILL_CONTAINER_POST, FILL_CONTAINER_FAILED, FILL_CONTAINER_SUCCESS, CONTAINER_DETAILS_FAILED, CONTAINER_DETAILS_FETCH, CONTAINER_DETAILS_RECEIVED, TOGGLE_CONTAINER_ACTIVE_FAILED, TOGGLE_CONTAINER_ACTIVE_START, TOGGLE_CONTAINER_ACTIVE_SUCCESS, CREATE_CONTAINER_FAILED, CREATE_CONTAINER_START, CREATE_CONTAINER_SUCCESS, REMOVE_ORDER_START, REMOVE_ORDER_SUCCESS } from './actions';

const initialUserState = { 
  isFetching: false,
  isValid: true, 
  user: {},
  token: localStorage.token,
  userID: localStorage.userID
};

function userLogged(state = initialUserState, action) {
  switch(action.type) {
    case LOGIN_START:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case LOGIN_SUCCESS:
      localStorage.token = action.user.LoginSessionKey;
      localStorage.userID = action.user.UserID;
      return _.assign({}, state, {
        isFetching: false, 
        isValid: true, 
        user: action.user,
        token: action.user.LoginSessionKey,
        userID: action.user.UserID
      });
    case LOGIN_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    default:
      return state;
  }
}

const initialPagedOrdersState = { isFetching: false, isValid: true, orders: [], limit: 10, page: 1, total: 0};

function pagedOrders(state = initialPagedOrdersState, action) {
  switch(action.type) {
    case PAGED_ORDERS_FETCH:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case PAGED_ORDERS_RECEIVED:
      return _.assign({}, state, {
        isFetching: false, isValid: true, 
        orders: _.map(action.orders.rows, (row) => (row)), 
        total: action.orders.count});
    case PAGED_ORDERS_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    case PAGED_ORDERS_LIMIT:
      return _.assign({}, state, {limit: action.limit, page: 1});
    case PAGED_ORDERS_PAGE:
      return _.assign({}, state, {page: action.page});
    default:
      return state;
  }
}

const initialContainersState = { isFetching: false, isValid: true, containers: [], active: '' };

const containerStatusLoading = (state = {}, action) => {
  switch(action.type) {
    case TOGGLE_CONTAINER_ACTIVE_START:
      if(state.ContainerID == action.id) {
        return _.assign({}, state, {status: 'Loading'});
      } else return state;
    case TOGGLE_CONTAINER_ACTIVE_SUCCESS:
      if(state.ContainerID == action.container.ContainerID) {
        const status = (action.container.Active ? 'Active' : 'NotActive');
        return _.assign({}, state, {status: status});
      } else return state;
    case TOGGLE_CONTAINER_ACTIVE_FAILED:
      if(state.ContainerID == action.id) {
        const status = (state.Active ? 'Active' : 'NotActive');
        return _.assign({}, state, {status: status});
      } else return state;
    default: 
      return state;
  }
}

function containers(state = initialContainersState, action) {
  switch(action.type) {
    case CONTAINERS_FETCH:
      return _.assign({}, state, {isFetching: true, isValid: false});
    case CONTAINERS_RECEIVED:
      return _.assign({}, state, {isFetching: false, isValid: true, containers: _.map(action.containers, (container) => {
        let status;
        if(container.Active) status = 'Active';
        else status = 'NotActive';

        return _.assign({}, container, {status: status});
      })});
    case CONTAINERS_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    case PICK_CONTAINER: 
      return _.assign({}, state, {active: action.container});
    case TOGGLE_CONTAINER_ACTIVE_START:
    case TOGGLE_CONTAINER_ACTIVE_SUCCESS:
    case TOGGLE_CONTAINER_ACTIVE_FAILED:
      return _.assign({}, state, {
        containers: _.map(state.containers, (container) => containerStatusLoading(container, action))});
    case CREATE_CONTAINER_START:
      return _.assign({}, state, {isCreating: true, isCreateError: false});
    case CREATE_CONTAINER_SUCCESS:
      return _.assign({}, state, {isCreating: false, isCreateError: false});
    case CREATE_CONTAINER_FAILED: 
      return _.assign({}, state, {isCreating: false, isCreateError: true});
    default:
      return state;
  }
}

const initialSelectedOrdersState = { isFetching: false, isValid: true, orders: [], ids: [], containers: []};

function toggleOrderByID(state = {}, action) {
  switch(action.type) {
    case SELECTED_ORDERS_TOGGLE:
      if(state.UserOrderNumber == action.ID && state.status != 'Success') {
        return _.assign({}, state, {checked: !state.checked});
      } else {
        return state;
      }

    default:
      return state;
  }
}

function mergeResults(state = {}, action) {
  switch(action.type) {
    case FILL_CONTAINER_SUCCESS:
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
    default: 
      return state;
  }
}

function prepareFill(state = {}, action) {
  switch(action.type) {
    case FILL_CONTAINER_POST:
      if(state.checked) {
        return _.assign({}, state, {status: 'Processing'});
      }

      return state;
    case FILL_CONTAINER_FAILED:
      if(state.checked) {
        return _.assign({}, state, {status: 'Failed'});
      }

      return state;      
    default:
      return state;
  }
}

function selectedOrders(state = initialSelectedOrdersState, action) {
  switch(action.type) {
    case SELECTED_ORDERS_FETCH:
      return _.assign({}, state, {isFetching: true, isValid: false, orders: [], ids: action.ids});
    case SELECTED_ORDERS_RECEIVED:
      return _.assign({}, state, {
        isFetching: false, isValid: true, 
        orders: _.map(action.orders.orders.rows, (order) => (_.assign({}, order, {checked: true, status: ''}))),
        containers: action.orders.containers
      });
    case SELECTED_ORDERS_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false, error: action.error, orders: [], ids: []});
    case SELECTED_ORDERS_TOGGLE:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => (toggleOrderByID(order, action)))
      });
    case FILL_CONTAINER_POST:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => (prepareFill(order, action)))
      })
    case FILL_CONTAINER_SUCCESS:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => mergeResults(order, action))
      });
    case FILL_CONTAINER_FAILED:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => prepareFill(order, action))
      });
    case SELECTED_ORDERS_RESET:
      return _.assign({}, state, {isFetching: false, isValid: true, orders: [], containers: [], ids: []});
    default:
      return state;
  }
}

const initialDistrictsState = { isFetching: false, isValid: true, districts: [], active: {}};

function districts(state = initialDistrictsState, action) {
  switch(action.type) {
    case DISTRICT_FETCH:
      return _.assign({}, state, {isFetching: true, isValid: false, active: {}});
    case DISTRICT_RECEIVED:
      return _.assign({}, state, {isFetching: false, isValid: true, districts: action.districts.data.districts});
    case DISTRICT_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false});
    case PICK_DISTRICT: 
      return _.assign({}, state, {active: action.district});
    case CONTAINER_DETAILS_RECEIVED:
      if(action.trip) {
        return _.assign({}, state, {active: action.trip.District.DistrictID});
      }
      return state;
    default:
      return state;
  }
}

const initialFillContainerState = { isFilling: false, isValid: true, error: '' };

function fillContainer(state = initialFillContainerState, action) {
  switch(action.type) {
    case FILL_CONTAINER_POST:
      return _.assign({}, state, {isFilling: true, isValid: false});
    case FILL_CONTAINER_SUCCESS:
      return _.assign({}, state, {isFilling: false, isValid: true});
    case FILL_CONTAINER_FAILED:
      return _.assign({}, state, {isFilling: false, isValid: false, error: action.error});
    default:
      return state;
  }
}

const initialContainerDetailsState = {isFetching: false, isValid: true, container: {}, orders: [], trip: {}, fillAble: true};

function containerDetails(state = initialContainerDetailsState, action) {
  switch(action.type) {
    case CONTAINER_DETAILS_FETCH:
      return _.assign({}, state, {isFetching: true, isValid: false, container: {}, orders:[]});
    case CONTAINER_DETAILS_RECEIVED:
      return _.assign({}, state, {isFetching: false, isValid: true, container: action.container, orders: action.orders, trip: action.trip, fillAble: action.fillAble});
    case CONTAINER_DETAILS_FAILED:
      return _.assign({}, state, {isFetching: false, isValid: false, container: {}, orders:[]});
    case REMOVE_ORDER_START:
      return _.assign({}, state, {
        orders: _.map(state.orders, (order) => {
          if(order.UserOrderID != action.orderID) {
            return order;
          }

          return _.assign({}, order, {isDeleting: true});
        })
      });
    case REMOVE_ORDER_SUCCESS:
      if(action.route)
        return _.assign({}, state, {orders: _.filter(state.orders, (order) => (order.UserOrderID != action.route.UserOrder.UserOrderID))});
      return state;
    default:
      return state;
  }
}

export default combineReducers({
  userLogged, pagedOrders, containers, selectedOrders, districts, fillContainer, containerDetails
});
