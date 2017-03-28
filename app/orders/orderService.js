import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import FetchDelete from '../modules/fetch/delete';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';
import Promise from 'bluebird';
import {fetchXhr} from '../modules/fetch/getXhr';
import * as DashboardService from '../dashboard/dashboardService';

const Constants = {
  BASE: "myorder/defaultSet/",
  SET_ORDERS: "myorder/orders/set",
  TOGGLE_SELECT_ORDER: "myorder/orders/select",
  TOGGLE_SELECT_ALL: "myorder/orders/selectAll",
  ORDER_DETAILS_SET: "myorder/orders/details",
  FETCHING_PAGE: "myorder/orders/fetchingStart",
  FETCHING_PAGE_STOP: "myorder/orders/fetchingStop",
  ORDER_EXPAND_DETAILS: "myorder/orders/expand",
  ORDER_EXPAND_DRIVER: "myorder/orders/expandDriver",
  ORDER_EXPAND_DRIVER_BULK: "myorder/orders/expandDriverBulk",
  ORDER_SHRINK_ORDER: "myorder/orders/shrink",
  SET_DRIVER: "myorder/orders/setDriver",
  RESET_DRIVER: "myorder/orders/resetDriver",
  SHOW_SUCCESS_ASSIGN: "myorder/orders/showSuccess",
  CLOSE_SUCCESS_ASSIGN: "myorder/orders/closeSuccess"
}

const initialStore = {
  currentPage: 1,
  filters: {},
  limit: 10,
  statusName: "SHOW ALL",
  sortOptions: "Sort By",
  orderTypeOptions: "All",
  total: 0,
  orders: [],
  selectedAll: false,
  isFetching: false,
  order: {},
  expandedOrder: {},
  isExpandOrder: false,
  isExpandDriver: false,
  isExpandDriverBulk: false,
  selectedDriver: null,
  isSuccessAssign: false,
  errorIDs: [],
  successAssign: 0,
  errorAssign: 0
}

export default function Reducer(store = initialStore, action) {
  const parsedActionType = action.type.split('/');
  if(parsedActionType.length > 2 && parsedActionType[0] === "myorder" && parsedActionType[1] === "defaultSet") {
    const fieldName = parsedActionType[2];
    return lodash.assign({}, store, {[fieldName]: action[fieldName]});
  }

  switch(action.type) {
    case Constants.SET_ORDERS: {
      return lodash.assign({}, store, {
        total: action.total,
        orders: action.orders,
      });
    }

    case Constants.TOGGLE_SELECT_ORDER: {
      const newOrders= lodash.map(store.orders, (order) => {
        if(order.UserOrderID !== action.orderID) {
            return order;
        }

        return lodash.assign({}, order, {IsChecked: !order.IsChecked});
      });

      return lodash.assign({}, store, {
        orders: newOrders,
      });
    }

    case Constants.TOGGLE_SELECT_ALL: {
      const {orders, selectedAll} = store;
      const newOrders = lodash.map(orders, (order) => {
        return lodash.assign({}, order, {IsChecked: !selectedAll});
      });

      return lodash.assign({}, store, {
        selectedAll: !selectedAll,
        orders: newOrders,
      })
    }

    case Constants.FETCHING_PAGE: {
      return lodash.assign({}, store, {
        isFetching: true
      });
    }

    case Constants.ORDER_DETAILS_SET: {
      return lodash.assign({}, store, {
        order: action.order,
        isFetching: false
      });
    }

    case Constants.FETCHING_PAGE_STOP: {
      return lodash.assign({}, store, {
        order: {},
        isFetching: false
      });
    }

    case Constants.ORDER_EXPAND_DETAILS: {
      return lodash.assign({}, store, {
        expandedOrder: action.order,
        isExpandOrder: true
      });
    }

    case Constants.ORDER_EXPAND_DRIVER: {
      return lodash.assign({}, store, {
        isExpandDriver: true
      });
    }

    case Constants.ORDER_EXPAND_DRIVER_BULK: {
      return lodash.assign({}, store, {
        isExpandDriver: true,
        isExpandDriverBulk: true
      });
    }

    case Constants.ORDER_SHRINK_ORDER: {
      return lodash.assign({}, store, {
        expandedOrder: {},
        isExpandOrder: false,
        isExpandDriver: false,
        isExpandDriverBulk: false
      });
    }

    case Constants.SET_DRIVER: {
      return lodash.assign({}, store, {
        selectedDriver: action.driverID
      });
    }

    case Constants.RESET_DRIVER: {
      return lodash.assign({}, store, {
        selectedDriver: action.driverID
      });
    }        

    case Constants.SHOW_SUCCESS_ASSIGN: {
      return lodash.assign({}, store, {
          isSuccessAssign: true,
          errorIDs: action.errorIDs,
          successAssign: action.successAssign,
          errorAssign: action.errorAssign
      });
    }

    case Constants.CLOSE_SUCCESS_ASSIGN: {
      return lodash.assign({}, store, {
          isSuccessAssign: false,
          errorIDs: [],
          successAssign: 0,
          errorAssign: 0
      });
    }

    default: {
      return store;
    }
  }
}

export function StoreSetter(keyword, value) {
  return {type: Constants.BASE + keyword, [keyword]: value};
}

export function SetFilters(filters) {
  return StoreSetter("filters", filters);
}

export function UpdateFilters(filters) {
  return (dispatch, getState) => {
    const prevFilters = getState().app.myOrders.filters;
    const nextFilter = lodash.assign({}, prevFilters, filters);
    dispatch(SetFilters(nextFilter));
  }
}

export function SetDropDownFilter(keyword) {
  const filterNames = {
    "statusName": "status",
    "sortOptions": "sortOptions",
    "orderTypeOptions": "isTrunkeyOrder"
  };

  return (selectedOption) => {
    const filterName = filterNames[keyword];

    return (dispatch, getState) => {
        dispatch(StoreSetter(keyword, selectedOption.value));
        dispatch(StoreSetter("currentPage", 1));
        dispatch(UpdateFilters({[filterName]: selectedOption.key}));
        dispatch(FetchList());
    }
  }
}

export function SetCurrentPage(currentPage) {
  return (dispatch, getState) => {
    dispatch(StoreSetter("currentPage", currentPage));
    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch, getState) => {
    dispatch(StoreSetter("limit", limit));
    dispatch(SetCurrentPage(1));
  }
}

export function UpdateAndFetch(filters) {
  return (dispatch) => {
    dispatch(StoreSetter("currentPage", 1));
    dispatch(UpdateFilters(filters));
    dispatch(FetchList());
  }
}

export function ToggleChecked(orderID) {
  return {
    type: Constants.TOGGLE_SELECT_ORDER,
    orderID: orderID
  }
}
 
export function ToggleCheckedAll() {
  return { type: Constants.TOGGLE_SELECT_ALL };
}

export function FetchList() {
  return (dispatch, getState) => {
    const {myOrders, userLogged} = getState().app;
    const {currentPage, limit, total, filters} = myOrders;
    const {token} = userLogged;
    const sortFilter = [{
      key: 1, sortBy: 'DueTime', sortCriteria: 'ASC'      
    }, {
      key: 2, sortBy: 'DueTime', sortCriteria: 'DESC'      
    }];

    if (filters.sortOptions) {
      let sortKey = _.find(sortFilter, {'key': filters.sortOptions});
      filters.sortBy = sortKey.sortBy;
      filters.sortCriteria = sortKey.sortCriteria;
      delete filters.sortOptions;
    }

    if (filters.isTrunkeyOrder === 'All') {
      delete filters.isTrunkeyOrder;
    }

    const params = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage - 1) * limit
    });

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({type: Constants.FETCHING_PAGE});
    FetchGet('/order/assigned', token, params).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        if (data.count < total) {
          dispatch(SetCurrentPage(1));
        }
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.SET_ORDERS,
          orders: data.rows,
          total: data.count,
        });
        dispatch({type: Constants.FETCHING_PAGE_STOP});
      });
    }).catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
      dispatch({type: Constants.FETCHING_PAGE_STOP});
    });
  }
}

export function fetchDetails(id) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({type: Constants.FETCHING_PAGE});
    FetchGet('/order/' + id, token).then(function(response) {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(function({data}) {
        dispatch({
          type: Constants.ORDER_DETAILS_SET,
          order: data,
        });
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }).catch((e) => {
      window.history.back();
      const message = (e && e.message) ? e.message : "Failed to fetch trip details";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function ExpandOrder(order) {
  return {
    type: Constants.ORDER_EXPAND_DETAILS,
    order: order
  }
}

export function ExpandDriver() {
  return {
    type: Constants.ORDER_EXPAND_DRIVER
  }
}

export function ExpandDriverBulk() {
  return {
    type: Constants.ORDER_EXPAND_DRIVER_BULK
  }
}

export function ShrinkOrder(order) {
  return {
    type: Constants.ORDER_SHRINK_ORDER
  }
}

export function CloseSuccessAssign() {
  return {
    type: Constants.CLOSE_SUCCESS_ASSIGN
  }
}

export function AssignDriver(orderID, driverID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const body = {
      driverID: driverID,
    };

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost(`/order/${orderID}/driver`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      dispatch({ 
        type: Constants.SHOW_SUCCESS_ASSIGN,
        errorIDs: [],
        successAssign: 0,
        errorAssign: 0
      });
      dispatch(ResetDriver());
      dispatch(ShrinkOrder());
      dispatch(FetchList());
      dispatch(DashboardService.FetchCountTMS());
      dispatch({type: modalAction.BACKDROP_HIDE});
    }).catch((e) => {
      const message = (e && e.message) || "Failed to set driver";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function BulkAssignDriver(orders, driverID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    let orderIDs = [];
    orders.forEach(function(order) {
      orderIDs.push(order.UserOrderID);
    })

    const body = {
      driverID: driverID,
      orderIDs: orderIDs
    };    

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost(`/order/bulk-assign`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      response.json().then(function({data}) {
        dispatch({ 
          type: Constants.SHOW_SUCCESS_ASSIGN,
          errorIDs: ((data.failedUserOrderIDs.length > 0) && data.failedUserOrderIDs) || [],
          successAssign: data.success,
          errorAssign: data.error
        });
        dispatch(ResetDriver());
        dispatch(ShrinkOrder());
        dispatch(FetchList());
        dispatch(DashboardService.FetchCountTMS());
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }).catch((e) => {
      const message = (e && e.message) || "Failed to set driver";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function SetDriver(driverID) {
  return {
    type: Constants.SET_DRIVER,
    driverID: driverID
  }
}

export function ResetDriver() {
  return {
    type: Constants.RESET_DRIVER
  }
}

export function addOrder(order) {
    return (dispatch, getState) => {
        const {userLogged} = getState().app;
        const {token} = userLogged;
        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchPost('/order/company', token, order).then((response) => {
        if(response.ok) {
            response.json().then(function({data}) {
                dispatch({
                    type: Constants.ORDER_DETAILS_SET,
                    order: lodash.assign({}, order),
                });
                alert('Add Order Success');
                dispatch({type: modalAction.BACKDROP_HIDE});
                window.location.href='/myorders';
            });
        } else {
            response.json().then(function({error}) {
                var message = '';
                error.message.forEach(function(m) {
                    message += m + '\n';
                });
                alert(message);
                dispatch({type: modalAction.BACKDROP_HIDE});
            });
        }
        }).catch(() => { 
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Network error'));
        });
    }
}

export function resetManageOrder() {
    return (dispatch) => {
        dispatch({type: Constants.FETCHING_PAGE_STOP});
    }
}
