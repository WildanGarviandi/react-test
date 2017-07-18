import * as _ from 'lodash';

import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';
import { OrderParser } from '../modules/orders';
import { addNotification } from '../modules/notification';
import * as DashboardService from '../dashboard/dashboardService';

const Constants = {
  ORDERS_INBOUND_CURRENT_PAGE_SET: 'inbound/currentPage/set',
  ORDERS_INBOUND_FETCH_END: 'inbound/fetch/end',
  ORDERS_INBOUND_FETCH_START: 'inbound/fetch/start',
  ORDERS_INBOUND_LIMIT_SET: 'inbound/limit/set',
  ORDERS_INBOUND_SET: 'inbound/set',
  ORDERS_INBOUND_MARK_RECEIVED_START: 'inbound/mark/start',
  ORDERS_INBOUND_MARK_RECEIVED_END: 'inbound/mark/end',
  ORDERS_INBOUND_MARK_RECEIVED_END_ERROR: 'inbound/mark/endError',
  ORDERS_INBOUND_MARK_RECEIVED_SET: 'inbound/mark/set',
  ORDERS_INBOUND_RESET_SUGGESTION: 'inbound/resetSuggestion',
};

const initialState = {
  currentPage: 1,
  isFetching: false,
  limit: 25,
  orders: [],
  total: 0,
  isMarking: false,
  isDuplicate: false,
  isTripID: false,
  isInterHub: false,
  duplicateOrders: [],
  suggestion: {},
  lastDestination: {},
  scannedOrder: '',
  successScanned: 0,
  errorIDs: [],
  countSuccess: 0,
  countError: 0,
  bulkScan: false,
  totalOrderByTrip: 0,
};

export function Reducer(state = initialState, action) {
  switch (action.type) {
    case Constants.ORDERS_INBOUND_CURRENT_PAGE_SET: {
      return Object.assign({}, state, { currentPage: action.currentPage });
    }

    case Constants.ORDERS_INBOUND_FETCH_END: {
      return Object.assign({}, state, { isFetching: false });
    }

    case Constants.ORDERS_INBOUND_FETCH_START: {
      return Object.assign({}, state, { isFetching: true });
    }

    case Constants.ORDERS_INBOUND_LIMIT_SET: {
      return Object.assign({}, state, { limit: action.limit });
    }

    case Constants.ORDERS_INBOUND_SET: {
      return Object.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.ORDERS_INBOUND_MARK_RECEIVED_START: {
      return Object.assign({}, state, {
        isMarking: true,
        isDuplicate: false,
        duplicateOrders: [],
      });
    }

    case Constants.ORDERS_INBOUND_MARK_RECEIVED_END: {
      return Object.assign({}, state, {
        isMarking: false,
        suggestion: action.payload.nextDestination,
        lastDestination: action.payload.lastDestination,
        successScanned: action.payload.successScanned,
        scannedOrder: action.payload.scannedOrder,
        errorIDs: action.payload.errorIDs,
        countSuccess: action.payload.countSuccess,
        countError: action.payload.countError,
        bulkScan: action.payload.bulkScan,
        isTripID: action.payload.isTripID,
        isInterHub: action.payload.isInterHub,
        totalOrderByTrip: action.payload.totalOrderByTrip,
      });
    }

    case Constants.ORDERS_INBOUND_MARK_RECEIVED_END_ERROR: {
      return Object.assign({}, state, {
        isMarking: false,
        suggestion: action.nextDestination,
        lastDestination: action.lastDestination,
        scannedOrder: action.scannedOrder,
        errorIDs: action.errorIDs,
        countSuccess: action.countSuccess,
        countError: action.countError,
        bulkScan: action.bulkScan,
      });
    }

    case Constants.ORDERS_INBOUND_MARK_RECEIVED_SET: {
      return Object.assign({}, state, {
        isDuplicate: action.isDuplicate || false,
        duplicateOrders: action.duplicateOrders || [],
      });
    }

    case Constants.ORDERS_INBOUND_RESET_SUGGESTION: {
      return Object.assign({}, state, {
        suggestion: {},
        lastDestination: {},
        successScanned: 0,
        scannedOrder: '',
        errorIDs: [],
        countSuccess: 0,
        countError: 0,
        bulkScan: false,
        isTripID: false,
        isInterHub: false,
        totalOrderByTrip: 0,
      });
    }

    default: return state;
  }
}

const reFetchList = () => {
  const fetchListData = (dispatch, getState) => {
    const { inboundOrders, userLogged } = getState().app;
    const { token, hubID } = userLogged;
    const { currentPage, filters, limit } = inboundOrders;

    const query = Object.assign({}, filters, {
      limit,
      offset: (currentPage - 1) * limit,
    });

    FetchGet(`/order/orderInbound/${hubID}`, token, query, true).then((response) => {
      if (!response.ok) {
        throw new Error();
      }

      response.json().then(({ data }) => {
        dispatch({
          type: Constants.ORDERS_INBOUND_SET,
          orders: _.map(data.rows, OrderParser),
          total: data.count,
        });

        dispatch({
          type: Constants.ORDERS_INBOUND_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_INBOUND_FETCH_END,
      });

      dispatch(ModalActions.addMessage('Failed to fetch inbound orders'));
    });
  };

  return fetchListData;
};

export function FetchList() {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_INBOUND_FETCH_START,
    });

    dispatch(reFetchList());
  };
}

export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_INBOUND_CURRENT_PAGE_SET,
      currentPage,
    });

    dispatch(FetchList());
  };
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_INBOUND_LIMIT_SET,
      limit,
    });

    dispatch(SetCurrentPage(1));
  };
}

export function markReceived(id) {
  return (dispatch, getState) => {
    const { userLogged, inboundOrders } = getState().app;
    const { token } = userLogged;
    const { successScanned } = inboundOrders;
    let scannedID = _.cloneDeep(id);
    let isTripID = false;
    let isInterHub = false;

    if (scannedID.toUpperCase().includes('TRIP-')) {
      scannedID = scannedID.toUpperCase();
    }

    if (/^TRIP-.*/.test(scannedID)) {
      scannedID = `#${scannedID}`;
      isTripID = true;
    }

    const query = {
      id: scannedID,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    dispatch({
      type: Constants.ORDERS_INBOUND_MARK_RECEIVED_START,
    });

    FetchPost('/order/mark-deliver', token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        if (data.duplicate) {
          dispatch(addNotification(`Order ${scannedID} was found in more than one data`, 'warning', null, null, 5, true));

          dispatch({
            type: Constants.ORDERS_INBOUND_MARK_RECEIVED_SET,
            isDuplicate: true,
            duplicateOrders: data.rows,
          });
        } else if (data.Trip) {
          isInterHub = data.Trip.OriginHub && data.Trip.OriginHub.HubID;
          dispatch(addNotification(`Trip ID ${data.Trip.TripID} was received`, 'info', null, null, 3, true));

          dispatch({
            type: Constants.ORDERS_INBOUND_MARK_RECEIVED_SET,
          });
        } else if (data.hasScanned) {
          dispatch(addNotification(`Order ${scannedID} already scanned`, 'success', null, null, 3, true));

          dispatch({
            type: Constants.ORDERS_INBOUND_MARK_RECEIVED_SET,
          });
        } else {
          dispatch(addNotification(`Order ${scannedID} was received`, 'success', null, null, 3, true));

          dispatch({
            type: Constants.ORDERS_INBOUND_MARK_RECEIVED_SET,
          });
        }

        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch({
          type: Constants.ORDERS_INBOUND_MARK_RECEIVED_END,
          payload: {
            nextDestination: data.nextDestination,
            lastDestination: data.lastDestination,
            successScanned: (data.hasScanned || data.duplicate) ? successScanned :
              (successScanned + 1),
            scannedOrder: scannedID,
            isTripID,
            isInterHub,
            totalOrderByTrip: data.Trip ? data.Trip.UserOrderRoutes.length : 0,
          },
        });
        dispatch(reFetchList());
        dispatch(DashboardService.FetchCount());
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to mark order as received';
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch({
        type: Constants.ORDERS_INBOUND_MARK_RECEIVED_END_ERROR,
        lastDestination: {
          City: 'Not Found',
        },
        nextDestination: false,
        scannedOrder: scannedID,
      });

      dispatch(addNotification(message, 'error', null, null, 5, true));
    });
  };
}

export function BulkMarkReceived(scannedIDs) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const query = {
      ids: scannedIDs,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    dispatch({
      type: Constants.ORDERS_INBOUND_MARK_RECEIVED_START,
    });

    FetchPost('/order/bulk-mark-deliver', token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        const failedIds = [];
        if (data.failedIds.length > 0) {
          data.failedIds.forEach((failed) => {
            failedIds.push(failed.id);
          });
        }

        dispatch({
          type: Constants.ORDERS_INBOUND_MARK_RECEIVED_END,
          payload: {
            lastDestination: {},
            nextDestination: false,
            bulkScan: true,
            errorIDs: failedIds,
            countSuccess: data.success,
            countError: data.error,
            scannedOrder: '',
            successScanned: 0,
            isTripID: false,
            isInterHub: false,
            totalOrderByTrip: 0,
          },
        });

        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(reFetchList());
        dispatch(DashboardService.FetchCount());
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to mark order as received';
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch({
        type: Constants.ORDERS_INBOUND_MARK_RECEIVED_END,
        payload: {
          isTripID: false,
          isInterHub: false,
          totalOrderByTrip: 0,
        },
      });

      dispatch(addNotification(message, 'error', null, null, 5, true));
    });
  };
}

export function resetSuggestion() {
  return (dispatch) => {
    dispatch({ type: Constants.ORDERS_INBOUND_RESET_SUGGESTION });
  };
}
