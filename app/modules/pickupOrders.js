import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from './fetch/get';
import FetchPost from './fetch/post';
import ModalActions from './modals/actions';
import {OrderParser} from './orders';
import OrderStatusSelector from './orderStatus/selector';

const Constants = {
  ORDERS_PICKUP_CURRENT_PAGE_SET: "pickup/currentPage/set",
  ORDERS_PICKUP_FETCH_END: "pickup/fetch/end",
  ORDERS_PICKUP_FETCH_START: "pickup/fetch/start",
  ORDERS_PICKUP_FILTER_SET: "pickup/filters/set",
  ORDERS_PICKUP_FILTER_STATUS_SET: "pickup/filterStatus/set",
  ORDERS_PICKUP_GROUP_END: "pickup/group/end",
  ORDERS_PICKUP_GROUP_START: "pickup/group/start",
  ORDERS_PICKUP_MARK_PICKUP_START: "pickup/markPickup/start",
  ORDERS_PICKUP_MARK_PICKUP_END: "pickup/markPickup/end",
  ORDERS_PICKUP_INFOGRAPHIC_SET: "pickup/infoGraphic/set",
  ORDERS_PICKUP_LIMIT_SET: "pickup/limit/set",
  ORDERS_PICKUP_SELECT_TOGGLE_ALL: "pickup/select/toggleAll",
  ORDERS_PICKUP_SELECT_TOGGLE_ONE: "pickup/select/toggleOne",
  ORDERS_PICKUP_SET: "pickup/set",
  ORDERS_PICKUP_RESET_FILTER: "pickup/resetFilter"
}

//
// Reducers
//

const infographicStatus = ["NOTASSIGNED", "BOOKED"];
const initialInfographicCount = lodash.reduce(infographicStatus, (result, status) => {
  result[status] = '?';
  return result;
}, {});

const initialState = {
  checkedAll: false,
  currentPage: 1,
  filterStatus: "SHOW ALL",
  filters: {},
  infographicCount: initialInfographicCount,
  infographicStatus: infographicStatus,
  isFetching: false,
  isGrouping: false,
  isMarkingPickup: false,
  limit: 50,
  orders: [],
  total: 0,
}

export function Reducer(state = initialState, action) {
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

    case Constants.ORDERS_PICKUP_FILTER_STATUS_SET: {
      return lodash.assign({}, state, {filterStatus: action.filterStatus});
    }

    case Constants.ORDERS_PICKUP_GROUP_END: {
      return lodash.assign({}, state, {isGrouping: false});
    }

    case Constants.ORDERS_PICKUP_GROUP_START: {
      return lodash.assign({}, state, {isGrouping: true});
    }

    case Constants.ORDERS_PICKUP_MARK_PICKUP_START: {
      return lodash.assign({}, state, {isMarkingPickup: true});
    }

    case Constants.ORDERS_PICKUP_MARK_PICKUP_END: {
      return lodash.assign({}, state, {isMarkingPickup: false});
    }

    case Constants.ORDERS_PICKUP_INFOGRAPHIC_SET: {
      return lodash.assign({}, state, {
        infographicCount: lodash.assign({}, state.infographicCount, {
          [action.keyword]: action.count,
        }),
      });
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

    case Constants.ORDERS_PICKUP_RESET_FILTER: {
      return lodash.assign({}, state, {
        filters: {}, 
        currentPage: 1,
        filterStatus: "SHOW ALL",
        limit: 50,
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

export function FetchInfographic() {
  return (dispatch, getState) => {
    const options = OrderStatusSelector.GetList(getState());
    const orderStatus = {
      BOOKED: 1,
      NOTASSIGNED: 6,
    };
    const {token} = getState().app.userLogged;

    lodash.each(infographicStatus, (status) => {
      const query = {
        limit: 1,
        status: orderStatus[status],
      }

      FetchGet('/order/pickup', token, query).then((response) => {
        if(response.ok) {
          response.json().then(({data}) => {
            dispatch({
              type: Constants.ORDERS_PICKUP_INFOGRAPHIC_SET,
              keyword: status,
              count: data.count,
            });
          });
        }
      })
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

    const {pickupOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = pickupOrders;

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
      status: orderStatus.NOTASSIGNED || 6,
    });

    dispatch({
      type: Constants.ORDERS_PICKUP_FETCH_START,
    });

    FetchGet('/order/pickup', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_PICKUP_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });
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

export function FetchList() {
  return (dispatch, getState) => {
    const {pickupOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = pickupOrders;

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.ORDERS_PICKUP_FETCH_START,
    });

    FetchGet('/order/pickup', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_PICKUP_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });

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

export function FilterByKeyword(keyword) {
  return (dispatch, getState) => {
    const options = OrderStatusSelector.GetList(getState());
    const orderStatus = lodash.reduce(options, (results, status) => {
      results[status.value] = status.key;
      return results;
    }, {});

    const newFilters = {
      status: orderStatus[keyword],
    };

    dispatch({
      type: Constants.ORDERS_PICKUP_FILTER_STATUS_SET,
      filterStatus: keyword,
    });

    dispatch({
      type: Constants.ORDERS_PICKUP_FILTER_SET,
      filters: newFilters,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function GroupOrders() {
  return (dispatch, getState) => {
    const {pickupOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {orders} = pickupOrders;

    let forbidden = false;
    const checkedOrdersIDs = lodash.chain(orders)
      .filter((order) => {
        if (order.IsChecked && order.OrderStatus !== 'NOTASSIGNED') {
          forbidden = true;
        }
        return order.IsChecked;
      })
      .map((order) => (order.UserOrderID))
      .value();

    if (forbidden) {
      dispatch(ModalActions.addMessage('There’s one or more order not ready for pickup. Please check again'));
      return;
    }

    if (checkedOrdersIDs.length === 0) {
      dispatch(ModalActions.addMessage('No order selected'));
      return;
    }

    const body = {
      ordersID: checkedOrdersIDs,
    }

    dispatch({
      type: Constants.ORDERS_PICKUP_GROUP_START,
    });

    FetchPost('/trip/firstLeg', token, body).then((response) => {
      if(response.ok) {
        dispatch({
          type: Constants.ORDERS_PICKUP_GROUP_END,
        });

        response.json().then(({data}) => {
          dispatch(push('/trips/' + data.TripID));
        });
      } else {
        response.json().then(({error}) => {
          dispatch({
            type: Constants.ORDERS_PICKUP_GROUP_END,
          });

          dispatch(ModalActions.addMessage("Failed to group orders. " + error.message[0].reason));
        });
      }
    });
  }
}

export function MarkPickup () {
  return (dispatch, getState) => {
    const {pickupOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {orders} = pickupOrders;

    let forbidden = false;
    const checkedOrdersIDs = lodash.chain(orders)
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

    dispatch({
      type: Constants.ORDERS_PICKUP_MARK_PICKUP_START,
    });

    FetchPost('/order/pickupNow', token, body).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.ORDERS_PICKUP_MARK_PICKUP_END,
      });

      dispatch(ModalActions.addMessage("Marking pickup is suceeed"));
      dispatch(FetchList());
      dispatch(FetchInfographic());

    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_PICKUP_MARK_PICKUP_END,
      });

      dispatch(ModalActions.addMessage("Failed to marking pickup"));
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

export function SetStatus(keyword) {
  return (dispatch, getState) => {
    const options = OrderStatusSelector.GetList(getState());
    const orderStatus = lodash.reduce(options, (results, status) => {
      results[status.value] = status.key;
      return results;
    }, {});

    const {pickupOrders} = getState().app;
    const {filters} = pickupOrders;
    const newFilters = {
      status: orderStatus[keyword],
    };

    dispatch({
      type: Constants.ORDERS_PICKUP_FILTER_STATUS_SET,
      filterStatus: keyword,
    });

    dispatch({
      type: Constants.ORDERS_PICKUP_FILTER_SET,
      filters: lodash.assign({}, filters, newFilters),
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