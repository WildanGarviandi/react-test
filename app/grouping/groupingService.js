import lodash from 'lodash';

import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { OrderParser } from '../modules/orders';
import { addNotification } from '../modules/notification';
import { modalAction } from '../modules/modals/constants';
import * as DashboardService from '../dashboard/dashboardService';
import * as InboundService from '../inbound/inboundOrdersService';

const Constants = {
  GROUPING_CURRENT_PAGE_SET: 'grouping/currentPage/set',
  GROUPING_FETCH_END: 'grouping/fetch/end',
  GROUPING_FETCH_START: 'grouping/fetch/start',
  GROUPING_LIMIT_SET: 'grouping/limit/set',
  GROUPING_SET: 'grouping/set',
  GROUPING_CREATE_TRIP_START: 'grouping/trip/create/start',
  GROUPING_CREATE_TRIP_END: 'grouping/trip/create/end',
  GROUPING_TRIP_SET: 'grouping/trip/set',
  GROUPING_ORDER_ADD_START: 'grouping/order/add/start',
  GROUPING_ORDER_ADD_END: 'grouping/order/add/end',
  GROUPING_ORDER_REMOVE: 'grouping/order/remove',
  GROUPING_SET_DEFAULT: 'grouping/set/default',
};

const initialState = {
  currentPage: 1,
  isFetching: false,
  limit: 25,
  orders: [],
  total: 0,
  isGrouping: false,
  isGroupingPage: true,
  addedOrders: [],
  isSuccessCreating: false,
  createdTrip: {},
  duplicateOrders: [],
  isDuplicate: false,
  misroute: null,
  rerouteSuccess: [],
  rerouteFailed: [],
};

export function Reducer(state = initialState, action) {
  switch (action.type) {
    case Constants.GROUPING_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, { currentPage: action.currentPage });
    }

    case Constants.GROUPING_FETCH_END: {
      return lodash.assign({}, state, { isFetching: false });
    }

    case Constants.GROUPING_FETCH_START: {
      return lodash.assign({}, state, { isFetching: true });
    }

    case Constants.GROUPING_LIMIT_SET: {
      return lodash.assign({}, state, { limit: action.limit });
    }

    case Constants.GROUPING_SET: {
      return lodash.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.GROUPING_CREATE_TRIP_START: {
      return lodash.assign({}, state, { isGrouping: true });
    }

    case Constants.GROUPING_CREATE_TRIP_END: {
      return lodash.assign({}, state, {
        isGrouping: false,
        addedOrders: [],
        isSuccessCreating: action.success,
        createdTrip: action.createdTrip || {},
      });
    }

    case Constants.GROUPING_TRIP_SET: {
      return lodash.assign({}, state, { trip: action.trip });
    }

    case Constants.GROUPING_ORDER_ADD_START: {
      return lodash.assign({}, state, {
        isDuplicate: false,
        duplicateOrders: [],
      });
    }

    case Constants.GROUPING_ORDER_ADD_END: {
      if (!action.duplicate) {
        return lodash.assign({}, state, { addedOrders: state.addedOrders.concat([action.order]) });
      }
      return lodash.assign({}, state, {
        duplicateOrders: action.order,
        isDuplicate: true,
      });
    }

    case Constants.GROUPING_ORDER_REMOVE: {
      const addedOrders = [].concat(state.addedOrders);
      addedOrders.splice(action.index, 1);
      return lodash.assign({}, state, { addedOrders });
    }

    case Constants.GROUPING_SET_DEFAULT: {
      return lodash.assign({}, state, action.payload);
    }

    default: return state;
  }
}

//
// Actions
//

export function FetchList() {
  return (dispatch, getState) => {
    const { grouping, userLogged } = getState().app;
    const { token } = userLogged;
    const { currentPage, filters, limit } = grouping;

    const query = lodash.assign({}, filters, {
      limit,
      offset: (currentPage - 1) * limit,
    });

    dispatch({
      type: Constants.GROUPING_FETCH_START,
    });

    FetchGet('/order/received', token, query).then((response) => {
      if (!response.ok) {
        throw new Error();
      }

      response.json().then(({ data }) => {
        dispatch({
          type: Constants.GROUPING_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });

        dispatch({
          type: Constants.GROUPING_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.GROUPING_FETCH_END,
      });

      dispatch(ModalActions.addMessage('Failed to fetch grouping orders'));
    });
  };
}

export function RemoveOrder(index) {
  const dispatchFunc = (dispatch) => {
    dispatch({
      type: Constants.GROUPING_ORDER_REMOVE,
      index,
    });
  };

  return dispatchFunc;
}

export function AddOrder(orderNumber, backElementFocusID) {
  return (dispatch, getState) => {
    const { userLogged, grouping } = getState().app;
    const { token } = userLogged;
    const { addedOrders } = grouping;

    const query = {
      userOrderNumber: orderNumber,
    };

    dispatch({
      type: modalAction.BACKDROP_SHOW,
    });

    dispatch({
      type: Constants.GROUPING_ORDER_ADD_START,
    });

    FetchGet('/order/received', token, query).then((response) => {
      if (!response.ok) {
        throw new Error();
      }

      dispatch({
        type: modalAction.BACKDROP_HIDE,
      });

      return response.json().then(({ data }) => {
        if (data.count < 1) {
          dispatch(this.setDefault({
            misroute: orderNumber,
          }));
        } else if (data.count > 1) {
          dispatch({
            type: Constants.GROUPING_ORDER_ADD_END,
            duplicate: true,
            order: data.rows,
          });
        } else {
          const index = lodash.findIndex(addedOrders, {
            UserOrderNumber: data.rows[0].UserOrderNumber,
          });
          if (index > -1) {
            dispatch(ModalActions.addConfirmation({
              message: `Remove order ${data.rows[0].UserOrderNumber} ?`,
              action: () => {
                dispatch(RemoveOrder(index));
              },
              backElementFocusID: 'addOrder',
              yesFocus: true,
            }));
          } else {
            dispatch({
              type: Constants.GROUPING_ORDER_ADD_END,
              order: data.rows[0],
            });
          }
        }
      });
    }).catch((e) => {
      const message = e.message || 'Failed to fetch order details';

      dispatch({
        type: modalAction.BACKDROP_HIDE,
      });

      dispatch(ModalActions.addMessage(message, backElementFocusID));
    });
  };
}

export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.GROUPING_CURRENT_PAGE_SET,
      currentPage,
    });

    dispatch(FetchList());
  };
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.GROUPING_LIMIT_SET,
      limit,
    });

    dispatch(SetCurrentPage(1));
  };
}

export function DoneCreateTrip() {
  return (dispatch) => {
    dispatch({
      type: Constants.GROUPING_CREATE_TRIP_END,
      success: false,
    });
  };
}

export function CreateTrip() {
  return (dispatch, getState) => {
    const { grouping, userLogged } = getState().app;
    const { token } = userLogged;
    const { addedOrders } = grouping;

    const orderIDs = lodash.map(grouping.addedOrders, order => (order.UserOrderID));

    const arrayOfNextDestination = [];
    const checkedOrdersDestination = lodash.chain(addedOrders)
      .filter((order) => {
        const { IsChecked } = order;
        return IsChecked;
      })
      .countBy('NextDestination')
      .value();

    for (const p in checkedOrdersDestination) {
      if (checkedOrdersDestination.hasOwnProperty(p)) {
        arrayOfNextDestination.push({ NextDestination: p, Count: checkedOrdersDestination[p] });
      }
    }

    if (arrayOfNextDestination.length > 1) {
      const isContinue = confirm(`Bro, you’re about to group ${checkedOrdersIDs.length} orders with different destinations. Sure you wanna do that?`);
      if (!isContinue) {
        return;
      }
    }

    const body = {
      OrderIDs: orderIDs,
    };

    dispatch({
      type: Constants.GROUPING_CREATE_TRIP_START,
    });

    FetchPost('/trip/outbound', token, body).then((response) => {
      if (response.ok) {
        response.json().then(({ data }) => {
          dispatch({
            type: Constants.GROUPING_CREATE_TRIP_END,
            success: true,
            createdTrip: data.trip,
          });
          dispatch(DashboardService.FetchCount());
        });
      } else {
        response.json().then(({ error }) => {
          dispatch({
            type: Constants.GROUPING_CREATE_TRIP_END,
            success: false,
          });

          dispatch(ModalActions.addMessage(`Failed to grouping orders. ${error.message[0].reason}`));
        });
      }
    });
  };
}

export function setDefault(payload) {
  const dispatchFunc = (dispatch) => {
    dispatch({
      type: Constants.GROUPING_SET_DEFAULT,
      payload,
    });
  };

  return dispatchFunc;
}

export function reroute(scannedID) {
  const dispatchFunc = (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const query = {
      orderIDs: scannedID,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });

    FetchPost('/order/reroute', token, query, true).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({
          type: Constants.GROUPING_SET_DEFAULT,
          payload: {
            rerouteSuccess: data.successOrder,
            rerouteFailed: data.failedOrder,
          },
        });
        if (data.successOrder.length > 0) {
          dispatch(InboundService.markReceived(scannedID[0]));
        }
      }).catch((e) => {
        const message = (e && e.message) ? e.message : 'Failed to reroute order';
        dispatch({
          type: Constants.GROUPING_SET_DEFAULT,
          payload: {
            misroute: null,
          },
        });

        dispatch(addNotification(message, 'error', null, null, 5, true));
      });
    });

    dispatch({ type: modalAction.BACKDROP_HIDE });
  };

  return dispatchFunc;
}
