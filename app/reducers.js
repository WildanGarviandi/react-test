import _ from 'lodash';
import { combineReducers } from 'redux';
import authReducers from './modules/auth/reducers';
import containersReducers from './modules/containers/reducers';
import districtsReducers from './modules/districts/reducers';

import { CONTAINERS_FETCH, CONTAINERS_FAILED, CONTAINERS_RECEIVED, DISTRICT_FAILED, DISTRICT_FETCH, DISTRICT_RECEIVED, PAGED_ORDERS_FETCH, PAGED_ORDERS_RECEIVED, PAGED_ORDERS_FAILED, PAGED_ORDERS_LIMIT, PAGED_ORDERS_PAGE, SELECTED_ORDERS_FETCH, SELECTED_ORDERS_FAILED, SELECTED_ORDERS_RECEIVED, SELECTED_ORDERS_RESET, SELECTED_ORDERS_TOGGLE, PICK_CONTAINER, PICK_DISTRICT, FILL_CONTAINER_POST, FILL_CONTAINER_FAILED, FILL_CONTAINER_SUCCESS, CONTAINER_DETAILS_FAILED, CONTAINER_DETAILS_FETCH, CONTAINER_DETAILS_RECEIVED, TOGGLE_CONTAINER_ACTIVE_FAILED, TOGGLE_CONTAINER_ACTIVE_START, TOGGLE_CONTAINER_ACTIVE_SUCCESS, CREATE_CONTAINER_FAILED, CREATE_CONTAINER_START, CREATE_CONTAINER_SUCCESS, REMOVE_ORDER_START, REMOVE_ORDER_SUCCESS } from './actions';

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

export default combineReducers({
  userLogged: authReducers,
  containers: containersReducers.containers,
  ordersPrepared: containersReducers.ordersPrepared,
  districts: districtsReducers,
  pagedOrders, fillContainer
});
