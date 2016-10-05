import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from './fetch/get';
import FetchPost from './fetch/post';
import ModalActions from './modals/actions';
import {modalAction} from './modals/constants';
import {OrderParser} from './orders';
import OrderStatusSelector from './orderStatus/selector';

const Constants = {
  ORDERS_RECEIVED_CONSOLIDATE_END: "received/consolidate/end",
  ORDERS_RECEIVED_CONSOLIDATE_START: "received/consolidate/start",
  ORDERS_RECEIVED_CURRENT_PAGE_SET: "received/currentPage/set",
  ORDERS_RECEIVED_FETCH_END: "received/fetch/end",
  ORDERS_RECEIVED_FETCH_START: "received/fetch/start",
  ORDERS_RECEIVED_FILTER_SET: "received/filters/set",
  ORDERS_RECEIVED_FILTER_STATUS_SET: "received/filterStatus/set",
  ORDERS_RECEIVED_LIMIT_SET: "received/limit/set",
  ORDERS_RECEIVED_SELECT_TOGGLE_ALL: "received/select/toggleAll",
  ORDERS_RECEIVED_SELECT_TOGGLE_ONE: "received/select/toggleOne",
  ORDERS_RECEIVED_SET: "received/set",
}

//
// Reducers
//

const initialState = {
  checkedAll: false,
  currentPage: 1,
  filterStatus: "SHOW ALL",
  filters: {},
  isConsolidating: false,
  isFetching: false,
  limit: 100,
  orders: [],
  total: 0,
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.ORDERS_RECEIVED_CONSOLIDATE_END: {
      return lodash.assign({}, state, {isConsolidating: false});
    }

    case Constants.ORDERS_RECEIVED_CONSOLIDATE_START: {
      return lodash.assign({}, state, {isConsolidating: true});
    }

    case Constants.ORDERS_RECEIVED_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.ORDERS_RECEIVED_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.ORDERS_RECEIVED_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.ORDERS_RECEIVED_FILTER_SET: {
      return lodash.assign({}, state, {filters: action.filters});
    }

    case Constants.ORDERS_RECEIVED_FILTER_STATUS_SET: {
      return lodash.assign({}, state, {filterStatus: action.filterStatus});
    }

    case Constants.ORDERS_RECEIVED_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.ORDERS_RECEIVED_SELECT_TOGGLE_ALL: {
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

    case Constants.ORDERS_RECEIVED_SELECT_TOGGLE_ONE: {
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

    case Constants.ORDERS_RECEIVED_SET: {
      return lodash.assign({}, state, {
        orders: action.orders,
        total: action.total,
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
    const {receivedOrders} = getState().app;
    const {filters} = receivedOrders;

    dispatch({
      type: Constants.ORDERS_RECEIVED_FILTER_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function ConsolidateOrders() {
  return (dispatch, getState) => {
    const {receivedOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {orders} = receivedOrders;

    const checkedOrdersID = lodash.chain(orders)
      .filter((order) => {
        return order.IsChecked;
      })
      .map((order) => (order.UserOrderID))
      .value();

    const body = {
      OrderIDs: checkedOrdersID,
    }

    dispatch({
      type: Constants.ORDERS_RECEIVED_CONSOLIDATE_START,
    });

    FetchPost('/trip/outbound', token, body).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.ORDERS_RECEIVED_CONSOLIDATE_END,
      });

      response.json().then(({data}) => {
        dispatch(push('/trips/' + data.trip.TripID));
      });
    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_RECEIVED_CONSOLIDATE_END,
      });

      dispatch(ModalActions.addMessage("Failed to consolidate orders"));
    });
  }
}

export function FetchList() {
  return (dispatch, getState) => {
    const {receivedOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = receivedOrders;

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.ORDERS_RECEIVED_FETCH_START,
    });

    FetchGet('/order/received', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.ORDERS_RECEIVED_FETCH_END,
      });

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_RECEIVED_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });
      });
    }).catch((e) => {
      dispatch({
        type: Constants.ORDERS_RECEIVED_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch received orders"));
    });
  }
}

export function GoToDetails(orderNumber) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      userOrderNumber: orderNumber,
    };

    dispatch({
      type: modalAction.BACKDROP_SHOW,
    });

    FetchGet('/order/received', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: modalAction.BACKDROP_HIDE,
      });

      dispatch({
        type: Constants.ORDERS_RECEIVED_FETCH_END,
      });

      return response.json().then(({data}) => {
        if(data.count < 1) {
          throw new Error("No order with specified EDS Number is found");
        }

        window.open('/orders/' + data.rows[0].UserOrderID);
      });
    }).catch((e) => {
      const message = e.message || "Failed to fetch order details";

      dispatch({
        type: modalAction.BACKDROP_HIDE,
      });

      dispatch({
        type: Constants.ORDERS_RECEIVED_FETCH_END,
      });

      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_RECEIVED_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_RECEIVED_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function SetStatus(keyword) {
  return (dispatch, getState) => {
    const options = OrderStatusSelector.GetList(getState());
    const orderStatus = lodash.reduce(options, (results, status) => {
      results[status.value] = status.key;
      return results;
    }, {});

    const {receivedOrders} = getState().app;
    const {filters} = receivedOrders;
    const newFilters = {
      status: orderStatus[keyword],
    };

    dispatch({
      type: Constants.ORDERS_RECEIVED_FILTER_STATUS_SET,
      filterStatus: keyword,
    });

    dispatch({
      type: Constants.ORDERS_RECEIVED_FILTER_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function ToggleSelectAll() {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_RECEIVED_SELECT_TOGGLE_ALL,
    });
  }
}

export function ToggleSelectOne(orderID) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_RECEIVED_SELECT_TOGGLE_ONE,
      orderID: orderID,
    });
  }
}

export function FetchNotAssignedList() {
  return (dispatch, getState) => {
    const options = OrderStatusSelector.GetList(getState());
    const orderStatus = lodash.reduce(options, (results, status) => {
      results[status.value] = status.key;
      return results;
    }, {});

    const {receivedOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = receivedOrders;

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
      status: orderStatus.NOTASSIGNED,
    });

    dispatch({
      type: Constants.ORDERS_RECEIVED_FETCH_START,
    });

    FetchGet('/order/received', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.ORDERS_RECEIVED_FETCH_END,
      });

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_RECEIVED_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_RECEIVED_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch received orders"));
    });
  }
}

