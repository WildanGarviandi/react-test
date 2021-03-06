import * as _ from 'lodash';
import moment from 'moment';

import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';
import { defaultStatuses, SORT } from '../config/configValues.json';

const Constants = {
  FETCH_COUNT: 'FETCH_COUNT',
  FETCH_LIST: 'FETCH_LIST',
  EXPAND_ORDER: 'EXPAND_ORDER',
  HIDE_ORDER: 'HIDE_ORDER',
  EXPAND_ATTEMPT: 'EXPAND_ATTEMPT',
  SHOW_ATTEMPT_MODAL: 'SHOW_ATTEMPT_MODAL',
  HIDE_ATTEMPT_MODAL: 'HIDE_ATTEMPT_MODAL',
  HIDE_ATTEMPT: 'HIDE_ATTEMPT',
  TOGGLE_CHECK_ALL: 'TOGGLE_CHECK_ALL',
  TOGGLE_SELECT_ORDER: 'TOGGLE_SELECT_ORDER',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_LIMIT: 'SET_LIMIT',
  SET_ORDERS: 'SET_ORDERS',
  SET_DROPDOWN_FILTER: 'SET_DROPDOWN_FILTER',
  SET_FILTER: 'SET_FILTER',
  SET_DATE: 'SET_DATE',
  SET_SEARCH_RESULT: 'SET_SEARCH_RESULT',
  SET_SUCCEED_ATTEMPT: 'SET_SUCCEED_ATTEMPT',
  SHOW_DELIVERY: 'SHOW_DELIVERY',
  HIDE_DELIVERY: 'HIDE_DELIVERY',
  SHOW_SUCCESS_DELIVERED: 'SHOW_SUCCESS_DELIVERED',
  HIDE_SUCCESS_DELIVERED: 'HIDE_SUCCESS_DELIVERED',
  SHOW_UPDATE_COD: 'SHOW_UPDATE_COD',
  HIDE_UPDATE_COD: 'HIDE_UPDATE_COD',
  SHOW_SUCCESS_UPDATE_COD: 'SHOW_SUCCESS_UPDATE_COD',
  HIDE_SUCCESS_UPDATE_COD: 'HIDE_SUCCESS_UPDATE_COD',
};

const initialStore = {
  expandedOrder: {},
  expandedAttempt: false,
  isExpanded: false,
  startDate: moment().subtract(7, 'days').toISOString(),
  endDate: moment().toISOString(),
  succeedAttempt: false,
  count: {
    pendingDelivery: '-',
    succeedDelivery: '-',
    failedDelivery: '-',
  },
  modal: {
    addAttempt: false,
  },
  filters: {
    succeed: {},
    pending: {},
    failed: {},
  },
  orders: {
    succeed: [],
    pending: [],
    failed: [],
  },
  sortOptions: {
    succeed: 'Sort By',
    pending: 'Sort By',
    failed: 'Sort By',
  },
  orderTypeOptions: {
    succeed: 'All',
    pending: 'All',
    failed: 'All',
  },
  statusOptions: {
    succeed: 'Search for order status...',
    pending: 'Search for order status...',
    failed: 'Search for order status...',
  },
  codOptions: {
    succeed: 'Search for payment type...',
    pending: 'Search for payment type...',
    failed: 'Search for payment type...',
  },
  currentPage: {
    succeed: 1,
    pending: 1,
    failed: 1,
  },
  limit: {
    succeed: 10,
    pending: 10,
    failed: 10,
  },
  total: {
    succeed: 0,
    pending: 0,
    failed: 0,
  },
  selectedAll: {
    pending: false,
    succeed: false,
    failed: false,
  },
  searchResult: {
    pending: null,
    succeed: null,
    failed: null,
  },
  showDelivery: false,
  isSuccessDelivered: false,
  deliveryReport: {
    errorIDs: [],
    successReport: 0,
    errorReport: 0,
  },
  showUpdateCOD: false,
  isSuccessUpdateCOD: false,
  updateCODReport: {
    errorIDs: [],
    successReport: 0,
    errorReport: 0,
  },
};

export default function Reducer(store = initialStore, action) {
  switch (action.type) {
    case Constants.FETCH_COUNT: {
      return Object.assign({}, store, {
        count: action.count,
      });
    }

    case Constants.EXPAND_ORDER: {
      return _.merge({}, store, {
        isExpanded: true,
        expandedOrder: action.order,
      });
    }

    case Constants.HIDE_ORDER: {
      return Object.assign({}, store, {
        isExpanded: false,
        expandedOrder: {},
      });
    }

    case Constants.EXPAND_ATTEMPT: {
      return Object.assign({}, store, {
        expandedAttempt: true,
      });
    }

    case Constants.HIDE_ATTEMPT: {
      return Object.assign({}, store, {
        expandedAttempt: false,
      });
    }

    case Constants.SET_ORDERS: {
      const { total, orders } = store;
      const newOrders = {
        total: Object.assign({}, total),
        orders: Object.assign({}, orders),
      };

      newOrders.total[action.tab] = action.total;
      newOrders.orders[action.tab] = action.orders;

      return Object.assign({}, store, newOrders);
    }

    case Constants.TOGGLE_CHECK_ALL: {
      const { orders, selectedAll } = store;
      const { tab } = action;
      const newOrders = _.map(orders[tab], (order) => {
        const data = Object.assign({}, order, { IsChecked: !selectedAll[tab] });
        return data;
      });

      return _.merge({}, store, {
        selectedAll: {
          [tab]: !selectedAll[tab],
        },
        orders: {
          [tab]: newOrders,
        },
      });
    }

    case Constants.TOGGLE_SELECT_ORDER: {
      const { orderId, tab } = action;
      const newOrders = _.map(store.orders[tab], (order) => {
        if (order.UserOrderNumber !== orderId) {
          return order;
        }
        return Object.assign({}, order, { IsChecked: !order.IsChecked });
      });

      return _.merge({}, store, {
        orders: {
          [tab]: newOrders,
        },
      });
    }

    case Constants.SHOW_ATTEMPT_MODAL: {
      return Object.assign({}, store, {
        modal: { addAttempt: true },
      });
    }

    case Constants.HIDE_ATTEMPT_MODAL: {
      return Object.assign({}, store, {
        modal: { addAttempt: false },
      });
    }

    case Constants.SET_CURRENT_PAGE: {
      const newCurrPage = {
        currentPage: {},
      };
      newCurrPage.currentPage[action.tab] = action.currentPage;

      return _.merge({}, store, newCurrPage);
    }

    case Constants.SET_LIMIT: {
      const newLimit = {
        limit: {},
      };
      newLimit.limit[action.tab] = action.limit;

      return _.merge({}, store, newLimit);
    }

    case Constants.SET_SEARCH_RESULT: {
      const newResult = {
        searchResult: {},
      };
      newResult.searchResult[action.tab] = action.value;

      return _.merge({}, store, newResult);
    }

    case Constants.SET_DROPDOWN_FILTER: {
      const { keyword, tab, option } = action;
      const newValue = {
        [keyword]: Object.assign({}, store[keyword]),
        filters: store.filters,
      };
      const newFilters = newValue.filters;
      newValue[keyword][tab] = option.value;

      if (keyword === 'sortOptions') {
        const sortOptions = [{
          sortBy: 'Driver.FirstName', sortCriteria: SORT.DIRECTION.ASC,
        }, {
          sortBy: 'Driver.FirstName', sortCriteria: SORT.DIRECTION.DESC,
        }, {
          sortBy: 'DropoffAddress.City', sortCriteria: SORT.DIRECTION.ASC,
        }, {
          sortBy: 'DropoffAddress.City', sortCriteria: SORT.DIRECTION.DESC,
        }];
        newFilters[tab] = sortOptions[option.key];
      } else if (keyword === 'statusOptions') {
        newFilters[tab].statuses = `[${option.key}]`;
        if (option.key < 0) {
          delete newFilters[tab].statuses;
        }
      } else if (keyword === 'codOptions') {
        newFilters[tab].isCOD = option.key;
      } else {
        newFilters[tab].isTrunkeyOrder = option.key;
        if (isNaN(option.key)) {
          delete newFilters[tab].isTrunkeyOrder;
        }
      }

      return Object.assign({}, store, newValue);
    }

    case Constants.SET_FILTER: {
      return _.merge({}, store, action.newFilter);
    }

    case Constants.SET_DATE: {
      return _.merge({}, store, action.newDate);
    }

    case Constants.SET_SUCCEED_ATTEMPT: {
      return _.merge({}, store, {
        succeedAttempt: action.value,
      });
    }

    case Constants.SHOW_DELIVERY: {
      return Object.assign({}, store, {
        showDelivery: true,
      });
    }

    case Constants.HIDE_DELIVERY: {
      return Object.assign({}, store, {
        showDelivery: false,
      });
    }

    case Constants.SHOW_SUCCESS_DELIVERED: {
      return Object.assign({}, store, {
        isSuccessDelivered: true,
        deliveryReport: {
          errorIDs: action.errorIDs,
          successReport: action.successReport,
          errorReport: action.errorReport,
        },
      });
    }

    case Constants.HIDE_SUCCESS_DELIVERED: {
      return Object.assign({}, store, {
        isSuccessDelivered: false,
        deliveryReport: {
          errorIDs: [],
          successReport: 0,
          errorReport: 0,
        },
      });
    }

    case Constants.SHOW_UPDATE_COD: {
      return Object.assign({}, store, {
        showUpdateCOD: true,
      });
    }

    case Constants.HIDE_UPDATE_COD: {
      return Object.assign({}, store, {
        showUpdateCOD: false,
      });
    }

    case Constants.SHOW_SUCCESS_UPDATE_COD: {
      return Object.assign({}, store, {
        isSuccessUpdateCOD: true,
        updateCODReport: {
          errorIDs: action.errorIDs,
          successReport: action.successReport,
          errorReport: action.errorReport,
        },
      });
    }

    case Constants.HIDE_SUCCESS_UPDATE_COD: {
      return Object.assign({}, store, {
        isSuccessUpdateCOD: false,
        updateCODReport: {
          errorIDs: [],
          successReport: 0,
          errorReport: 0,
        },
      });
    }

    default: {
      return store;
    }
  }
}

export function FetchCount() {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;
    const { startDate, endDate } = getState().app.orderMonitoring;
    const query = {
      startDate: moment(startDate).startOf('day').toISOString(),
      endDate: moment(endDate).endOf('day').toISOString(),
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchGet('/order/delivery-counter', token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch({
          type: Constants.FETCH_COUNT,
          count: data.count,
        });
      });
    }).catch((e) => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

export function SetSearchResult(tab, value) {
  return { type: Constants.SET_SEARCH_RESULT, tab, value };
}

export function FetchList(tab) {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;
    const { limit, currentPage, filters, startDate, endDate } = getState().app.orderMonitoring;
    const query = Object.assign({}, filters[tab], {
      limit: limit[tab],
      startDate: moment(startDate).startOf('day').toISOString(),
      endDate: moment(endDate).endOf('day').toISOString(),
      offset: (currentPage[tab] - 1) * limit[tab],
      statuses: filters[tab].statuses || defaultStatuses[tab],
    });

    dispatch(SetSearchResult(tab, null));
    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchGet('/order/delivery', token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(FetchCount());
        dispatch({
          type: Constants.SET_ORDERS,
          total: data.count,
          orders: data.rows,
          tab,
        });
        if (!_.isEmpty(filters[tab]) && data.count > 0) {
          dispatch(SetSearchResult(tab, data.count));
        }
      });
    }).catch((e) => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

export function FetchAllList() {
  return (dispatch) => {
    dispatch(FetchList('succeed'));
    dispatch(FetchList('pending'));
    dispatch(FetchList('failed'));
  };
}

export function ExpandOrder(order) {
  return { type: Constants.EXPAND_ORDER, order };
}

export function HideOrder() {
  return (dispatch) => {
    dispatch({ type: Constants.HIDE_ORDER });
    dispatch({ type: Constants.HIDE_ATTEMPT });
  };
}

export function ExpandAttempt() {
  return { type: Constants.EXPAND_ATTEMPT };
}

export function HideAttempt() {
  return { type: Constants.HIDE_ATTEMPT };
}

export function ShowAttemptModal() {
  return { type: Constants.SHOW_ATTEMPT_MODAL };
}

export function HideAttemptModal() {
  return { type: Constants.HIDE_ATTEMPT_MODAL };
}

export function ToggleCheckAll(tab) {
  return { type: Constants.TOGGLE_CHECK_ALL, tab };
}

export function ToggleSelectOrder(orderId, tab) {
  return { type: Constants.TOGGLE_SELECT_ORDER, orderId, tab };
}

export function SetCurrentPage(currentPage, tab) {
  return (dispatch) => {
    dispatch({
      type: Constants.SET_CURRENT_PAGE,
      currentPage,
      tab,
    });
    dispatch(FetchList(tab));
  };
}

export function SetLimit(limit, tab) {
  return (dispatch) => {
    dispatch({ type: Constants.SET_LIMIT, limit, tab });
    dispatch(SetCurrentPage(1, tab));
    dispatch(FetchList(tab));
  };
}

export function SetDropDownFilter(keyword, option, tab) {
  return (dispatch) => {
    dispatch({
      type: Constants.SET_DROPDOWN_FILTER, keyword, option, tab,
    });
    dispatch(SetCurrentPage(1, tab));
    dispatch(FetchList(tab));
  };
}

export function SetFilter(newFilter) {
  return { type: Constants.SET_FILTER, newFilter };
}

export function SetDate(newDate) {
  return { type: Constants.SET_DATE, newDate };
}

export function ShowSucceedAttempt() {
  return (dispatch) => {
    dispatch({ type: Constants.SET_SUCCEED_ATTEMPT, value: true });
  };
}

export function HideSucceedAttempt() {
  return (dispatch) => {
    dispatch({ type: Constants.SET_SUCCEED_ATTEMPT, value: false });
    dispatch({ type: modalAction.BACKDROP_HIDE });
  };
}

export function PostAttempt(reasonID, proof) {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;
    const orderID = getState().app.orderMonitoring.expandedOrder.UserOrderID;
    const body = {
      reasonID,
      proofOfAttemptURL: proof,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchPost(`/order/${orderID}/attempt`, token, body).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }
      dispatch(HideOrder());
      dispatch(HideAttemptModal());
      dispatch({ type: modalAction.BACKDROP_HIDE });
      return dispatch(ShowSucceedAttempt());
    }).catch((e) => {
      const message = (e && e.message) || 'Failed to add attempt';
      dispatch(ModalActions.addMessage(message));
      dispatch({ type: modalAction.BACKDROP_HIDE });
    });
  };
}

export function FetchDetails(orderID) {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;

    dispatch(HideOrder());
    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchGet(`/order/${orderID}`, token).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch(ExpandOrder(data));
        dispatch({ type: modalAction.BACKDROP_HIDE });
      });
    }).catch((e) => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

export function ShowDeliveryModal() {
  return { type: Constants.SHOW_DELIVERY };
}

export function HideDeliveryModal() {
  return { type: Constants.HIDE_DELIVERY };
}

export function DeliverOrder(query) {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchPost('/order/delivered', token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({
          type: Constants.SHOW_SUCCESS_DELIVERED,
          errorIDs: ((data.failed.length > 0) && data.failed) || [],
          successReport: data.success,
          errorReport: data.error,
        });
        dispatch(FetchCount());
        dispatch(FetchAllList());
        dispatch(HideDeliveryModal());
        dispatch({ type: modalAction.BACKDROP_HIDE });
      });
    }).catch((e) => {
      const message = (e && e.message) || 'Failed to set delivered';
      dispatch(ModalActions.addMessage(message));
      dispatch({ type: modalAction.BACKDROP_HIDE });
    });
  };
}

export function HideSuccessDelivery() {
  return { type: Constants.HIDE_SUCCESS_DELIVERED };
}

export function ShowUpdateCODModal() {
  return { type: Constants.SHOW_UPDATE_COD };
}

export function HideUpdateCODModal() {
  return { type: Constants.HIDE_UPDATE_COD };
}

export function UpdateCODOrder(query) {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;

    dispatch({ type: modalAction.BACKDROP_SHOW });
    const params = {};
    params.orderIDs = query.ordersChecked;
    FetchPost('/order/bulk-paid-vendor', token, params).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({
          type: Constants.SHOW_SUCCESS_UPDATE_COD,
          errorIDs: ((data.failed.length > 0) && data.failed) || [],
          successReport: data.success,
          errorReport: data.error,
        });
        dispatch(FetchCount());
        dispatch(FetchAllList());
        dispatch(HideUpdateCODModal());
        dispatch({ type: modalAction.BACKDROP_HIDE });
      });
    }).catch((e) => {
      const message = (e && e.message) || 'Failed to set COD status';
      dispatch(ModalActions.addMessage(message));
      dispatch({ type: modalAction.BACKDROP_HIDE });
    });
  };
}

export function HideSuccessUpdateCOD() {
  return { type: Constants.HIDE_SUCCESS_UPDATE_COD };
}
