import * as _ from 'lodash';

import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { OrderParser } from '../modules/orders';
import * as PickupOrdersReadyService from './pickupOrdersReadyService';
import { modalAction } from '../modules/modals/constants';

const Constants = {
  BASE_ORDERS_PICKUP: 'pickup/defaultSet/',
  ORDERS_PICKUP_CURRENT_PAGE_SET: 'pickup/currentPage/set',
  ORDERS_PICKUP_FETCH_END: 'pickup/fetch/end',
  ORDERS_PICKUP_FETCH_START: 'pickup/fetch/start',
  ORDERS_PICKUP_FILTER_SET: 'pickup/filters/set',
  ORDERS_PICKUP_LIMIT_SET: 'pickup/limit/set',
  ORDERS_PICKUP_SELECT_TOGGLE_ALL: 'pickup/select/toggleAll',
  ORDERS_PICKUP_SELECT_TOGGLE_ONE: 'pickup/select/toggleOne',
  ORDERS_PICKUP_SET: 'pickup/set',
  ORDERS_PICKUP_SET_TOTAL: 'pickup/setTotal',
  ORDERS_PICKUP_RESET_FILTER: 'pickup/resetFilter',
  ORDERS_PICKUP_SHOW_MODAL: 'pickup/showModal',
  ORDERS_PICKUP_HIDE_MODAL: 'pickup/hideModal',
  ORDERS_PICKUP_ADD_HUB: 'pickup/hub/add',
  ORDERS_PICKUP_DELETE_HUB: 'pickup/hub/delete',
  ORDERS_PICKUP_ALL_HUB: 'pickupReady/hub/all',
};

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
  fixTotal: 0,
  showModal: false,
  hubIDs: [],
};

export function Reducer(state = initialState, action) {
  const parsedActionType = action.type.split('/');
  if (parsedActionType.length > 2 && parsedActionType[0] === 'pickup' &&
    parsedActionType[1] === 'defaultSet') {
    const fieldName = parsedActionType[2];
    return Object.assign({}, state, { [fieldName]: action[fieldName] });
  }

  switch (action.type) {
    case Constants.ORDERS_PICKUP_CURRENT_PAGE_SET: {
      return Object.assign({}, state, { currentPage: action.currentPage });
    }

    case Constants.ORDERS_PICKUP_FETCH_END: {
      return Object.assign({}, state, { isFetching: false });
    }

    case Constants.ORDERS_PICKUP_FETCH_START: {
      return Object.assign({}, state, { isFetching: true });
    }

    case Constants.ORDERS_PICKUP_FILTER_SET: {
      return Object.assign({}, state, { filters: action.filters });
    }

    case Constants.ORDERS_PICKUP_LIMIT_SET: {
      return Object.assign({}, state, { limit: action.limit });
    }

    case Constants.ORDERS_PICKUP_SELECT_TOGGLE_ALL: {
      const currentState = state.checkedAll;
      const newOrders = _.map(state.orders, (order) => {
        return Object.assign({}, order, {
          IsChecked: !currentState,
        });
      });

      return Object.assign({}, state, {
        orders: newOrders,
        checkedAll: !currentState,
      });
    }

    case Constants.ORDERS_PICKUP_SELECT_TOGGLE_ONE: {
      const newOrders = _.map(state.orders, (order) => {
        if (order.UserOrderID !== action.orderID) {
          return order;
        }

        return Object.assign({}, order, {
          IsChecked: !order.IsChecked,
        });
      });

      return Object.assign({}, state, {
        orders: newOrders,
      });
    }

    case Constants.ORDERS_PICKUP_SET: {
      return Object.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.ORDERS_PICKUP_SET_TOTAL: {
      return Object.assign({}, state, {
        fixTotal: action.total,
      });
    }

    case Constants.ORDERS_PICKUP_RESET_FILTER: {
      return Object.assign({}, state, {
        filters: {},
        currentPage: 1,
        city: 'All',
        limit: 25,
        hubIDs: [],
      });
    }

    case Constants.ORDERS_PICKUP_SHOW_MODAL: {
      return Object.assign({}, state, {
        showModal: true,
      });
    }

    case Constants.ORDERS_PICKUP_HIDE_MODAL: {
      return Object.assign({}, state, {
        showModal: false,
      });
    }

    case Constants.ORDERS_PICKUP_ADD_HUB: {
      const hubIDs = _.cloneDeep(state.hubIDs);
      hubIDs.push(action.payload.hub.key);
      return Object.assign({}, state, {
        hubIDs,
      });
    }

    case Constants.ORDERS_PICKUP_DELETE_HUB: {
      const hubIDs = _.filter(state.hubIDs, hubID =>
        hubID !== action.payload.hub.key);
      return Object.assign({}, state, {
        hubIDs,
      });
    }

    case Constants.ORDERS_PICKUP_ALL_HUB: {
      const hubIDs = _.map(action.payload.hubs, hub => hub.key);
      return Object.assign({}, state, {
        hubIDs,
      });
    }

    default:
      return state;
  }
}

//
// Actions
//

export function FetchList() {
  return (dispatch, getState) => {
    const { pickupOrders, userLogged } = getState().app;
    const { token } = userLogged;
    const { currentPage, filters, limit } = pickupOrders;

    if (filters.city === 'All') {
      delete filters.city;
    }

    if (filters.hubIDs && filters.hubIDs.length > 0) {
      filters.hubIDs = _.filter(filters.hubIDs, hubID => hubID > 0).join();
    }

    const query = Object.assign({}, filters, {
      limit,
      offset: (currentPage - 1) * limit,
    });

    dispatch({
      type: Constants.ORDERS_PICKUP_FETCH_START,
    });

    FetchGet('/order/orderNotReady', token, query, true).then((response) => {
      if (!response.ok) {
        throw new Error();
      }

      response.json().then(({ data }) => {
        dispatch({
          type: Constants.ORDERS_PICKUP_SET,
          orders: _.map(data.rows, OrderParser),
          total: data.count,
        });

        if (_.isEmpty(filters)) {
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

      dispatch(ModalActions.addMessage('Failed to fetch pickup orders'));
    });
  };
}

export function AddFilters(newFilters) {
  return (dispatch, getState) => {
    const { pickupOrders } = getState().app;
    const { filters } = pickupOrders;

    dispatch({
      type: Constants.ORDERS_PICKUP_FILTER_SET,
      filters: Object.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function StoreSetter(keyword, value) {
  return { type: Constants.BASE_ORDERS_PICKUP + keyword, [keyword]: value };
}

export function SetFilters(filters) {
  return StoreSetter('filters', filters);
}

export function UpdateFilters(filters) {
  return (dispatch, getState) => {
    const prevFilters = getState().app.pickupOrders.filters;
    const nextFilter = Object.assign({}, prevFilters, filters);
    dispatch(SetFilters(nextFilter));
  };
}

export function SetDropDownFilter(keyword) {
  const filterNames = {
    city: 'city',
    hubIDs: 'hubIDs',
  };

  return (selectedOption) => {
    const filterName = filterNames[keyword];

    return (dispatch, getState) => {
      const filter = filterName === 'hubIDs' ?
        getState().app.pickupOrders.hubIDs : selectedOption.value;
      dispatch(StoreSetter(keyword, filter));
      dispatch(StoreSetter('currentPage', 1));
      dispatch(UpdateFilters({ [filterName]: filter }));
      dispatch(FetchList());
    };
  };
}

export function UpdateAndFetch(filters) {
  return (dispatch) => {
    dispatch(StoreSetter('currentPage', 1));
    dispatch(UpdateFilters(filters));
    dispatch(FetchList());
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
      orderID,
    });
  };
}

export function ResetFilter() {
  return (dispatch) => {
    dispatch({ type: Constants.ORDERS_PICKUP_RESET_FILTER });
  };
}

export function ShowAssignModal() {
  return (dispatch) => {
    dispatch({ type: Constants.ORDERS_PICKUP_SHOW_MODAL });
  };
}

export function HideAssignModal() {
  return (dispatch) => {
    dispatch({ type: Constants.ORDERS_PICKUP_HIDE_MODAL });
  };
}

export function MarkPickup() {
  return (dispatch, getState) => {
    const { pickupOrders, userLogged } = getState().app;
    const { token } = userLogged;
    const { orders } = pickupOrders;

    let forbidden = false;
    const checkedOrdersIDs = _.chain(orders)
      .filter((order) => {
        if (order.IsChecked && order.OrderStatus === 'NOTASSIGNED') {
          forbidden = true;
        }
        return order.IsChecked;
      })
      .map((order) => (order.UserOrderID))
      .value();

    if (forbidden) {
      dispatch(ModalActions.addMessage('Failed, one or more orders have status NOTASSIGNED'));
      return;
    }

    if (checkedOrdersIDs.length === 0) {
      dispatch(ModalActions.addMessage('No order selected'));
      return;
    }

    const body = {
      OrderIDs: checkedOrdersIDs
    }

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchPost('/order/pickupNow', token, body).then((response) => {
      if (!response.ok) {
        throw new Error();
      }
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage('Marking pickup is suceeed'));
      dispatch(PickupOrdersReadyService.FetchList());
      dispatch(FetchList());

    }).catch(() => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage('Failed to marking pickup'));
    });
  }
}

export function addHubFilter(hub) {
  return {
    type: Constants.ORDERS_PICKUP_ADD_HUB,
    payload: {
      hub,
    },
  };
}

export function deleteHubFilter(hub) {
  return {
    type: Constants.ORDERS_PICKUP_DELETE_HUB,
    payload: {
      hub,
    },
  };
}

export function setAllHubFilter(hubOptions) {
  const hubs = _.filter(hubOptions, ['checked', true]);
  return {
    type: Constants.ORDERS_PICKUP_ALL_HUB,
    payload: {
      hubs,
    },
  };
}
