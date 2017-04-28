import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
  FETCH_COUNT: 'FETCH_COUNT',
  FETCH_LIST: 'FETCH_LIST',
  EXPAND_ORDER: 'EXPAND_ORDER',
  HIDE_ORDER: 'HIDE_ORDER',
  EXPAND_ATTEMPT: 'EXPAND_ATTEMPT',
  HIDE_ATTEMPT: 'HIDE_ATTEMPT',
  TOGGLE_CHECK_ALL: 'TOGGLE_CHECK_ALL',
  TOGGLE_SELECT_ORDER: 'TOGGLE_SELECT_ORDER',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_LIMIT: 'SET_LIMIT',
  SET_ORDERS: 'SET_ORDERS'
}

const initialStore = {
  currentPage: 1,
  limit: 100,
  total: 0,
  expandedOrder: false,
  expandedAttempt: false,
  selectedAll: false,
  orders: [],
  count: {
    totalDelivery: '-',
    pendingDelivery: '-',
    succeedDelivery: '-',
    failedDelivery: '-'
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
        expandedOrder: true
      });
    }

    case Constants.HIDE_ORDER: {
      return lodash.assign({}, store, {
        expandedOrder: false
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
      return lodash.assign({}, store, {
        total: action.total,
        orders: action.orders
      });
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

    case Constants.SET_CURRENT_PAGE: {
      return lodash.assign({}, store, {
        currentPage: action.currentPage
      });
    }

    case Constants.SET_LIMIT: {
      return lodash.assign({}, store, {
        limit: action.limit
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

export function FetchList() {
  return (dispatch, getState) => {
    const temp = [
      {
        DropoffAddress:{
          City: "Jakarta Barat"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396244",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      },
      {
        DropoffAddress:{
          City: "Jakarta Selatan"
        },
        IsTrunkeyOrder: true,
        UserOrderNumber: "EDS21396245",
        IsChecked: false
      }
    ];

    dispatch({
      type: Constants.SET_ORDERS,
      total: temp.length,
      orders: temp
    })
  }
}

export function ExpandOrder() {
  return { type: Constants.EXPAND_ORDER }
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

export function ToggleCheckAll() {
  return { type: Constants.TOGGLE_CHECK_ALL }
}

export function ToggleSelectOrder(orderId) {
  return { type: Constants.TOGGLE_SELECT_ORDER, orderId: orderId }
}

export function SetCurrentPage(currentPage) {
  return { type: Constants.SET_CURRENT_PAGE, currentPage: currentPage }
}

export function SetLimit(limit) {
  return { type: Constants.SET_LIMIT, limit: limit }
}
