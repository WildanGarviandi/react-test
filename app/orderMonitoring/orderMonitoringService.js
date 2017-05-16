import _ from 'lodash';
import moment from 'moment';

import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';
import { defaultStatuses } from '../config/configValues';

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
  SHOW_DELIVERY: 'SHOW_DELIVERY',
  HIDE_DELIVERY: 'HIDE_DELIVERY',
  SHOW_SUCCESS_DELIVERED: 'SHOW_SUCCESS_DELIVERED',
  HIDE_SUCCESS_DELIVERED: 'HIDE_SUCCESS_DELIVERED',
}

const initialStore = {
  expandedOrder: {},
  expandedAttempt: false,
  isExpanded: false,
  startDate: moment().subtract(7, 'days').toISOString(),
  endDate: moment().toISOString(),
  count: {
    pendingDelivery: '-',
    succeedDelivery: '-',
    failedDelivery: '-',
  },
  modal: {
    addAttempt: false
  },
  filters: {
    succeed: {},
    pending: {},
    failed: {},
  },
  orders: {
    succeed: [],
    pending: [],
    failed : [],
  },
  sortOptions: {
    succeed: "Sort By",
    pending: "Sort By",
    failed: "Sort By",
  },
  orderTypeOptions: {
    succeed: "All",
    pending: "All",
    failed: "All",
  },
  statusOptions: {
    succeed: "Search for order status...",
    pending: "Search for order status...",
    failed: "Search for order status...",
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
    failed: 0
  },
  selectedAll: {
    pending: false,
    succeed: false,
    failed: false,
  },
  showDelivery: false,
  isSuccessDelivered: false,
  deliveryReport: {
    errorIDs: [],
    successReport: 0,
    errorReport: 0    
  },
}

export default function Reducer(store = initialStore, action) {
  switch(action.type) {
    case Constants.FETCH_COUNT: {
      return Object.assign({}, store, {
        count: action.count
      });
    }

    case Constants.EXPAND_ORDER: {
      return _.merge({}, store, {
        isExpanded: true,
        expandedOrder: action.order
      });
    }

    case Constants.HIDE_ORDER: {
      return Object.assign({}, store, {
        isExpanded: false,
        expandedOrder: {}
      });
    }

    case Constants.EXPAND_ATTEMPT: {
      return Object.assign({}, store, {
        expandedAttempt: true
      });
    }

    case Constants.HIDE_ATTEMPT: {
      return Object.assign({}, store, {
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

      return Object.assign({}, store, newOrders);
    }

    case Constants.TOGGLE_CHECK_ALL: {
      const {orders, selectedAll} = store;
      const {tab} = action;
      const newOrders = _.map(orders[tab], (order) => {
        return Object.assign({}, order, {IsChecked: !selectedAll[tab]});
      });

      return _.merge({}, store, {
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
      const newOrders= _.map(store.orders[tab], (order) => {
        if (order.UserOrderNumber !== orderId) {
            return order;
        }
        return Object.assign({}, order, {IsChecked: !order.IsChecked});
      });

      return _.merge({}, store, {
        orders: {
          [tab]: newOrders,
        }
      });
    }

    case Constants.SHOW_ATTEMPT_MODAL: {
      return Object.assign({}, store, {
        modal: {addAttempt: true}
      });
    }

    case Constants.HIDE_ATTEMPT_MODAL: {
      return Object.assign({}, store, {
        modal: {addAttempt: false}
      });
    }

    case Constants.SET_CURRENT_PAGE: {
      const newCurrPage = {
        currentPage: {}
      };
      newCurrPage.currentPage[action.tab] = action.currentPage;

      return _.merge({}, store, newCurrPage);
    }

    case Constants.SET_LIMIT: {
      const newLimit = {
        limit: {}
      };
      newLimit.limit[action.tab] = action.limit;

      return _.merge({}, store, newLimit);
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

      return Object.assign({}, store, newValue);
    }

    case Constants.SET_FILTER: {
      return _.merge({}, store, action.newFilter);
    }

    case Constants.SET_DATE: {
      return _.merge({}, store, action.newDate);
    }

    case Constants.SHOW_DELIVERY: {
      return Object.assign({}, store, {
        showDelivery: true
      });
    }

    case Constants.HIDE_DELIVERY: {
      return Object.assign({}, store, {
        showDelivery: false
      });
    }

    case Constants.SHOW_SUCCESS_DELIVERED: {
      return Object.assign({}, store, {
        isSuccessDelivered: true,
        deliveryReport: {
          errorIDs: action.errorIDs,
          successReport: action.successReport,
          errorReport: action.errorReport
        }
      });
    }

    case Constants.HIDE_SUCCESS_DELIVERED: {
      return Object.assign({}, store, {
        isSuccessDelivered: false,
        deliveryReport: {
          errorIDs: [],
          successReport: 0,
          errorReport: 0
        }
      });
    }

    case Constants.HIDE_ATTEMPT_MODAL: {
      return Object.assign({}, store, {
        modal: {addAttempt: false}
      });
    }

    case Constants.SET_CURRENT_PAGE: {
      const newCurrPage = {
        currentPage: {}
      };
      newCurrPage.currentPage[action.tab] = action.currentPage;

      return _.merge({}, store, newCurrPage);
    }

    case Constants.SET_LIMIT: {
      const newLimit = {
        limit: {}
      };
      newLimit.limit[action.tab] = action.limit;

      return _.merge({}, store, newLimit);
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

      return Object.assign({}, store, newValue);
    }

    case Constants.SET_FILTER: {
      return _.merge({}, store, action.newFilter);
    }

    case Constants.SET_DATE: {
      return _.merge({}, store, action.newDate);
    }

    default: {
      return store;
    }
  }
}

export function FetchCount() {
  return (dispatch, getState) => {
    const {token} = getState().app.userLogged;
    const {startDate, endDate} = getState().app.orderMonitoring;
    const query = {
      startDate: moment(startDate).startOf('day').toISOString(),
      endDate: moment(endDate).endOf('day').toISOString()
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
    const { limit, currentPage, filters, startDate, endDate } = getState().app.orderMonitoring;
    const query = Object.assign({}, filters[tab], {
      limit: limit[tab],
      startDate: moment(startDate).startOf('day').toISOString(),
      endDate: moment(endDate).endOf('day').toISOString(),
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
        dispatch(FetchCount());
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

export function FetchAllList() {
  return (dispatch) => {
    dispatch(FetchList('succeed'));
    dispatch(FetchList('pending'));
    dispatch(FetchList('failed'));
  }
}

export function ExpandOrder(order) {
  return { type: Constants.EXPAND_ORDER, order };
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

export function SetDate(newDate) {
  return { type: Constants.SET_DATE, newDate };
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
        dispatch(ExpandOrder(data));
        dispatch({type: modalAction.BACKDROP_HIDE});
      });

    }).catch((e) => {
      console.log(e, 'catch');
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}

export function ShowDeliveryModal () {
  return { type: Constants.SHOW_DELIVERY };
}

export function HideDeliveryModal () {
  return { type: Constants.HIDE_DELIVERY };
}

export function DeliverOrder(query) {
  return (dispatch, getState) => {
    const { token } = getState().app.userLogged;
    const { limit, currentPage, filters } = getState().app.orderMonitoring;

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost('/order/delivered', token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        dispatch({ 
          type: Constants.SHOW_SUCCESS_DELIVERED,
          errorIDs: ((data.failed.length > 0) && data.failed) || [],  
          successReport: data.success,
          errorReport: data.error
        });
        dispatch(FetchCount());
        dispatch(FetchAllList());
        dispatch(HideDeliveryModal());
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }).catch((e) => {
      const message = (e && e.message) || "Failed to set delivered";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function HideSuccessDelivery () {
  return { type: Constants.HIDE_SUCCESS_DELIVERED };
}
