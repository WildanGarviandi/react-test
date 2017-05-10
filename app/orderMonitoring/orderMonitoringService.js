import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';
import { defaultStatuses } from '../config/configValues';
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
  SET_DROPDOWN_FILTER: 'SET_DROPDOWN_FILTER',
  SET_FILTER: 'SET_FILTER',
}

const initialStore = {
  isExpanded: false,
  expandedOrder: {},
  expandedAttempt: false,
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
  statusOptions: {
    total: "Search for order status...",
    succeed: "Search for order status...",
    pending: "Search for order status...",
    failed: "Search for order status...",
  },
  currentPage: {
    total: 1,
    succeed: 1,
    pending: 1,
    failed: 1
  },
  limit: {
    total: 10,
    succeed: 10,
    pending: 10,
    failed: 10
  },
  total: {
    total: 0,
    succeed: 0,
    pending: 0,
    failed: 0
  },
  selectedAll: {
    total: false,
    pending: false,
    succeed: false,
    failed: false
  },
}

export default function Reducer(store = initialStore, action) {
  switch(action.type) {
    case Constants.FETCH_COUNT: {
      return lodash.assign({}, store, {
        count: action.count
      });
    }

    case Constants.EXPAND_ORDER: {
      return lodash.merge({}, store, {
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
      const {total, orders} = store
      const newOrders = {
        total: Object.assign({}, total),
        orders: Object.assign({}, orders)
      };

      newOrders.total[action.tab] = action.total
      newOrders.orders[action.tab] = action.orders

      return lodash.assign({}, store, newOrders);
    }

    case Constants.TOGGLE_CHECK_ALL: {
      const {orders, selectedAll} = store;
      const {tab} = action;
      const newOrders = lodash.map(orders[tab], (order) => {
        return lodash.assign({}, order, {IsChecked: !selectedAll[tab]});
      });

      return lodash.merge({}, store, {
        selectedAll: {
          [tab]: !selectedAll[tab]
        },
        orders: {
            [tab]: newOrders,
          }
      })
    }

    case Constants.TOGGLE_SELECT_ORDER: {
      const {orderId, tab} = action
      const newOrders= lodash.map(store.orders[tab], (order) => {
        if (order.UserOrderNumber !== orderId) {
            return order;
        }
        return lodash.assign({}, order, {IsChecked: !order.IsChecked});
      });

      return lodash.merge({}, store, {
        orders: {
          [tab]: newOrders,
        }
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
      };
      newCurrPage.currentPage[action.tab] = action.currentPage;

      return lodash.merge({}, store, newCurrPage);
    }

    case Constants.SET_LIMIT: {
      const newLimit = {
        limit: {}
      };
      newLimit.limit[action.tab] = action.limit;

      return lodash.merge({}, store, newLimit);
    }

    case Constants.SET_DROPDOWN_FILTER: {
      const {keyword, tab, option} = action;
      let newValue = {
        [keyword]: Object.assign({}, store[keyword]),
        filters: store.filters
      };
      let newFilters = newValue.filters;
      newValue[keyword][tab] = option.value;

      if (keyword === "sortOptions") {
        const sortOptions = [{
            sortBy: "Driver.FirstName", sortCriteria: 'ASC'
          }, {
            sortBy: "Driver.FirstName", sortCriteria: 'DESC'
          }, {
            sortBy: "DropoffAddress.City", sortCriteria: 'ASC'
          }, {
            sortBy: "DropoffAddress.City", sortCriteria: 'DESC'
          }];
        newFilters[tab] = sortOptions[option.key];
      } else if (keyword === "statusOptions") {
        newFilters[tab].statuses = `[${option.key}]`;
        (option.key < 0) && delete newFilters[tab].statuses;
      } else {
        newFilters[tab].isTrunkeyOrder = option.key;
        isNaN(option.key) && delete newFilters[tab].isTrunkeyOrder;
      }

      return lodash.assign({}, store, newValue);
    }

    case Constants.SET_FILTER: {
      return lodash.merge({}, store, action.newFilter);
    }

    default: {
      return store;
    }
  }
}

export function FetchCount() {
  return (dispatch, getState) => {
    const {token} = getState().app.userLogged;
    let startDate = moment().utc().startOf('day').toISOString();
    let endDate = moment().utc().endOf('day').toISOString();
    const query = {
      startDate: startDate,
      endDate: endDate
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/order/delivery-counter', token, query).then((response) => {
      if (!response.ok) {
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
    let startDate = moment().utc().startOf('day').toISOString();
    let endDate = moment().utc().endOf('day').toISOString();
    const query = lodash.assign({}, filters[tab], {
      limit: limit[tab],
      startDate: startDate,
      endDate: endDate,
      offset: (currentPage[tab] - 1) * limit[tab],
      statuses: filters[tab].statuses || defaultStatuses[tab]
    });

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/order/delivery', token, query).then((response) => {
      if (!response.ok) {
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

export function ExpandOrder(order, tab) {
  return { type: Constants.EXPAND_ORDER, order, tab };
}

export function HideOrder() {
  return(dispatch, getApp) => {
    dispatch({ type: Constants.HIDE_ORDER });
    dispatch({ type: Constants.HIDE_ATTEMPT });
  };
}

export function ExpandAttempt () {
  return { type: Constants.EXPAND_ATTEMPT };
}

export function HideAttempt () {
  return { type: Constants.HIDE_ATTEMPT };
}

export function ShowAttemptModal () {
  return { type: Constants.SHOW_ATTEMPT_MODAL };
}

export function HideAttemptModal () {
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
      currentPage: currentPage,
      tab: tab
    });
    dispatch(FetchList(tab));
  };
}

export function SetLimit(limit, tab) {
  return (dispatch, getState) => {
    dispatch({ type: Constants.SET_LIMIT, limit: limit, tab: tab });
    dispatch(SetCurrentPage(1, tab));
    dispatch(FetchList(tab));
  }
}

export function SetDropDownFilter(keyword, option, tab) {
  return (dispatch) => {
    dispatch({
      type: Constants.SET_DROPDOWN_FILTER, keyword, option, tab
    })
    dispatch(SetCurrentPage(1, tab));
    dispatch(FetchList(tab));
  }
}

export function SetFilter(newFilter) {
  return { type: Constants.SET_FILTER, newFilter };
}

export function PostAttempt(reasonID, proof) {
  return (dispatch, getState) => {
    const {token} = getState().app.userLogged;
    const orderID = getState().app.orderMonitoring.expandedOrder.UserOrderID;
    const body = {
      reasonID: reasonID,
      proofOfAttemptURL: proof
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost(`/order/${orderID}/attempt`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      dispatch(HideOrder());
      dispatch(HideAttemptModal());
      dispatch({type: modalAction.BACKDROP_HIDE});
    }).catch((e) => {
      const message = (e && e.message) || "Failed to add attempt";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function FetchDetails(orderID) {
  return (dispatch, getState) => {
    const {token} = getState().app.userLogged;

    dispatch(HideOrder());
    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet(`/order/${orderID}`, token).then((response) => {
      if (!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        dispatch(ExpandOrder(data, 'pending'));
        dispatch();
      });

    }).catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }

}
