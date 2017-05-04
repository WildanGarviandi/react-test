import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';
import moment from 'moment';

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
  SET_DROPDOWN_FILTER: 'SET_DROPDOWN_FILTER'
}

const initialStore = {
  isExpanded: false,
  expandedOrder: {},
  expandedAttempt: false,
  selectedAll: false,
  count: {
    totalDelivery: '-',
    pendingDelivery: '-',
    succeedDelivery: '-',
    failedDelivery: '-'
  },
  modal: {
    addAttempt: false
  },
  filters: {
    total: {},
    succeed: {},
    pending: {},
    failed: {}
  },
  orders: {
    total: [],
    succeed: [],
    pending: [],
    failed : []
  },
  sortOptions: {
    total: "Sort By",
    succeed: "Sort By",
    pending: "Sort By",
    failed: "Sort By"
  },
  orderTypeOptions: {
    total: "All",
    succeed: "All",
    pending: "All",
    failed: "All",
  },
  currentPage: {
    total: 1,
    succeed: 1,
    pending: 1,
    failed: 1
  },
  limit: {
    total: 5,
    succeed: 5,
    pending: 5,
    failed: 5
  },
  total: {
    total: 0,
    succeed: 0,
    pending: 0,
    failed: 0
  }
}

export default function Reducer(store = initialStore, action) {
  switch(action.type) {
    case Constants.FETCH_COUNT: {
      return lodash.assign({}, store, {
        count: action.count
      });
    }

    case Constants.EXPAND_ORDER: {
      return lodash.assign({}, store, {
        isExpanded: true,
        expandedOrder: action.order
      });
    }

    case Constants.HIDE_ORDER: {
      return lodash.assign({}, store, {
        isExpanded: false,
        expandedOrder: {}
      });
    }

    case Constants.EXPAND_ATTEMPT: {
      return lodash.assign({}, store, {
        expandedAttempt: true
      });
    }

    case Constants.HIDE_ATTEMPT: {
      return lodash.assign({}, store, {
        expandedAttempt: false
      });
    }

    case Constants.SET_ORDERS: {
      const newOrders = {
        total: {},
        orders: {}
      }
      newOrders.total[action.tab] = action.total
      newOrders.orders[action.tab] = action.orders

      return lodash.merge({}, store, newOrders);
    }

    case Constants.TOGGLE_CHECK_ALL: {
      const {orders, selectedAll} = store;
      const newOrders = lodash.map(orders, (order) => {
        return lodash.assign({}, order, {IsChecked: !selectedAll});
      });

      return lodash.assign({}, store, {
        selectedAll: !selectedAll,
        orders: newOrders,
      })
    }

    case Constants.TOGGLE_SELECT_ORDER: {
      const newOrders= lodash.map(store.orders, (order) => {
        if(order.UserOrderNumber !== action.orderId) {
            return order;
        }
        return lodash.assign({}, order, {IsChecked: !order.IsChecked});
      });

      return lodash.assign({}, store, {
        orders: newOrders,
      });
    }

    case Constants.SHOW_ATTEMPT_MODAL: {
      return lodash.assign({}, store, {
        modal: {addAttempt: true}
      });
    }

    case Constants.HIDE_ATTEMPT_MODAL: {
      return lodash.assign({}, store, {
        modal: {addAttempt: false}
      });
    }

    case Constants.SET_CURRENT_PAGE: {
      const newCurrPage = {
        currentPage: {}
      }
      newCurrPage.currentPage[action.tab] = action.currentPage;

      return lodash.merge({}, store, newCurrPage);
    }

    case Constants.SET_LIMIT: {
      const newLimit = {
        limit: {}
      }
      newLimit.limit[action.tab] = action.limit;

      return lodash.merge({}, store, newLimit);
    }

    case Constants.SET_DROPDOWN_FILTER: {
      const newDropdownValue = {
        [action.keyword]: {
          
        }
      }

      return lodash.assign({}, store, {
        modal: {addAttempt: false}
      });
    }

    default: {
      return store;
    }
  }
}

export function FetchCount() {
  return (dispatch, getState) => {
    const {token} = getState().app.userLogged;

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/order/delivery-counter', token).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.FETCH_COUNT,
          count: data.count
        });
      });
    }).catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}

export function FetchList(tab) {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;
    const { limit, currentPage, filters } = getState().app.orderMonitoring;
    const statuses = {
      total: "[2, 3, 4, 5, 8, 12, 13, 15, 16]",
      succeed: "[5]",
      pending: "[2, 3, 4]",
      failed: "[8, 12, 13, 15, 16]"
    }

    const query = lodash.assign({}, filters[tab], {
      limit: limit,
      offset: (currentPage - 1) * limit,
      statuses: statuses[tab],
    });

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/order/delivery', token, query).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.SET_ORDERS,
          total: data.count,
          orders: data.rows,
          tab: tab
        })
      });
    }).catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}

export function ExpandOrder(order) {
  return { type: Constants.EXPAND_ORDER, order: order }
}

export function HideOrder() {
  return(dispatch, getApp) => {
    dispatch({ type: Constants.HIDE_ORDER })
    dispatch({ type: Constants.HIDE_ATTEMPT })
  }
}

export function ExpandAttempt () {
  return { type: Constants.EXPAND_ATTEMPT }
}

export function HideAttempt () {
  return { type: Constants.HIDE_ATTEMPT }
}

export function ShowAttemptModal () {
  return { type: Constants.SHOW_ATTEMPT_MODAL }
}

export function HideAttemptModal () {
  return { type: Constants.HIDE_ATTEMPT_MODAL }
}

export function ToggleCheckAll() {
  return { type: Constants.TOGGLE_CHECK_ALL }
}

export function ToggleSelectOrder(orderId) {
  return { type: Constants.TOGGLE_SELECT_ORDER, orderId: orderId }
}

export function SetCurrentPage(currentPage, tab) {
  return {
    type: Constants.SET_CURRENT_PAGE,
    currentPage: currentPage,
    tab: tab
  }
}

export function SetLimit(limit, tab) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.SET_LIMIT, limit: limit, tab: tab });
    dispatch(SetCurrentPage(1, tab));
    dispatch(FetchList(tab));
  }
}

export function SetDropDownFilter(keyword, value, tab) {
  return (dispatch) => {
    dispatch({
      type: Constants.SET_DROPDOWN_FILTER,
      keyword: keyword,
      value: value,
      tab: tab
    })
  }
}
