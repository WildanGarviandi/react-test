import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {OrderParser} from '../modules/orders';

const Constants = {
  BASE_ORDERS_PICKUP: "pickup/defaultSet/",
  ORDERS_PICKUP_CURRENT_PAGE_SET: "pickup/currentPage/set",
  ORDERS_PICKUP_FETCH_END: "pickup/fetch/end",
  ORDERS_PICKUP_FETCH_START: "pickup/fetch/start",
  ORDERS_PICKUP_FILTER_SET: "pickup/filters/set",
  ORDERS_PICKUP_LIMIT_SET: "pickup/limit/set",
  ORDERS_PICKUP_SELECT_TOGGLE_ALL: "pickup/select/toggleAll",
  ORDERS_PICKUP_SELECT_TOGGLE_ONE: "pickup/select/toggleOne",
  ORDERS_PICKUP_SET: "pickup/set",
  ORDERS_PICKUP_SET_TOTAL: "pickup/setTotal",
  ORDERS_PICKUP_RESET_FILTER: "pickup/resetFilter",
  ORDERS_PICKUP_SHOW_MODAL: "pickup/showModal",
  ORDERS_PICKUP_HIDE_MODAL: "pickup/hideModal"
}

//
// Reducers
//

const initialState = {
  checkedAll: false,
  currentPage: 1,
  filters: {},
  city: 'All',
  isFetching: false,
  limit: 25,
  orders: [],
  total: 0,
  fixTotal : 0,
  showModal: false
}

export function Reducer(state = initialState, action) {
  const parsedActionType = action.type.split('/');
  if (parsedActionType.length > 2 && parsedActionType[0] === "pickup" && parsedActionType[1] === "defaultSet") {
      const fieldName = parsedActionType[2];
      return lodash.assign({}, state, {[fieldName]: action[fieldName]});
  }

  switch(action.type) {
    case Constants.ORDERS_PICKUP_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.ORDERS_PICKUP_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.ORDERS_PICKUP_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.ORDERS_PICKUP_FILTER_SET: {
      return lodash.assign({}, state, {filters: action.filters});
    }

    case Constants.ORDERS_PICKUP_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.ORDERS_PICKUP_SELECT_TOGGLE_ALL: {
      const currentState = state.checkedAll;
      const newOrders = lodash.map(state.orders, (order) => {
        return lodash.assign({}, order, {
          IsChecked: !currentState,
        });
      });

      return lodash.assign({}, state, {
        orders: newOrders,
        checkedAll: !currentState,
      });
    }

    case Constants.ORDERS_PICKUP_SELECT_TOGGLE_ONE: {
      const newOrders = lodash.map(state.orders, (order) => {
        if(order.UserOrderID !== action.orderID) {
          return order;
        }

        return lodash.assign({}, order, {
          IsChecked: !order.IsChecked,
        });
      });

      return lodash.assign({}, state, {
        orders: newOrders,
      });
    }

    case Constants.ORDERS_PICKUP_SET: {
      return lodash.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.ORDERS_PICKUP_SET_TOTAL: {
      return lodash.assign({}, state, {
        fixTotal: action.total,
      });
    }

    case Constants.ORDERS_PICKUP_RESET_FILTER: {
      return lodash.assign({}, state, {
        filters: {}, 
        currentPage: 1,
        city: 'All',
        limit: 25,
      });
    }

    case Constants.ORDERS_PICKUP_SHOW_MODAL: {
      return lodash.assign({}, state, {
        showModal: true
      });
    }

    case Constants.ORDERS_PICKUP_HIDE_MODAL: {
      return lodash.assign({}, state, {
        showModal: false
      });
    }

    default: return state;
  }
}

//
// Actions
//

export function AddFilters(newFilters) {
  return (dispatch, getState) => {
    const {pickupOrders} = getState().app;
    const {filters} = pickupOrders;

    dispatch({
      type: Constants.ORDERS_PICKUP_FILTER_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function StoreSetter(keyword, value) {
    return {type: Constants.BASE_ORDERS_PICKUP + keyword, [keyword]: value};
}

export function SetFilters(filters) {
    return StoreSetter("filters", filters);
}

export function UpdateFilters(filters) {
    return (dispatch, getState) => {
        const prevFilters = getState().app.pickupOrders.filters;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFilters(nextFilter));
    }
}

export function SetDropDownFilter(keyword) {
    const filterNames = {
        "city": "city",
    };

    return (selectedOption) => {
        const filterName = filterNames[keyword];

        return (dispatch, getState) => {
            dispatch(StoreSetter(keyword, selectedOption.value));
            dispatch(StoreSetter("currentPage", 1));
            dispatch(UpdateFilters({[filterName]: selectedOption.value}));
            dispatch(FetchList());
        }
    }
}

export function UpdateAndFetch(filters) {
    return (dispatch) => {
        dispatch(StoreSetter("currentPage", 1));
        dispatch(UpdateFilters(filters));
        dispatch(FetchList());
    }
}

export function FetchList() {
  return (dispatch, getState) => {
    const {pickupOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = pickupOrders;

    if (filters.city === 'All') {
      delete filters.city;
    }

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.ORDERS_PICKUP_FETCH_START,
    });

    FetchGet('/order/orderNotReady', token, query, true).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_PICKUP_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });

        if (lodash.isEmpty(filters)) {
          dispatch({
            type: Constants.ORDERS_PICKUP_SET_TOTAL,
            total: data.count,
          });
        }

        dispatch({
          type: Constants.ORDERS_PICKUP_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_PICKUP_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch pickup orders"));
    });
  }
}

export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function ToggleSelectAll() {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_SELECT_TOGGLE_ALL,
    });
  }
}

export function ToggleSelectOne(orderID) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_SELECT_TOGGLE_ONE,
      orderID: orderID,
    });
  }
}

export function ResetFilter() {
  return (dispatch) => {
    dispatch({type: Constants.ORDERS_PICKUP_RESET_FILTER});
  }
}

export function ShowAssignModal() {
  return (dispatch) => {
    dispatch({type: Constants.ORDERS_PICKUP_SHOW_MODAL});
  }
}

export function HideAssignModal() {
  return (dispatch) => {
    dispatch({type: Constants.ORDERS_PICKUP_HIDE_MODAL});
  }
}