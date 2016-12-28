import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {OrderParser} from '../modules/orders';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {modalAction} from '../modules/modals/constants';

const Constants = {
  ORDERS_UPDATE_CURRENT_PAGE_SET: "update/currentPage/set",
  ORDERS_UPDATE_FETCH_END: "update/fetch/end",
  ORDERS_UPDATE_FETCH_START: "update/fetch/start",
  ORDERS_UPDATE_LIMIT_SET: "update/limit/set",
  ORDERS_UPDATE_SET: "update/set",
  ORDERS_UPDATE_START_EDIT_ORDER: "update/startEditOrder",
  ORDERS_UPDATE_END_EDIT_ORDER: "update/endEditOrder",
}

//
// Reducers
//

const initialState = {
  currentPage: 1,
  isFetching: false,
  limit: 50,
  orders: [],
  total: 0,
  isEditing: false,
  scannedOrder: ''
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.ORDERS_UPDATE_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.ORDERS_UPDATE_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.ORDERS_UPDATE_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.ORDERS_UPDATE_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.ORDERS_UPDATE_SET: {
      return lodash.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.ORDERS_UPDATE_START_EDIT_ORDER: {
      return lodash.assign({}, state, {
        isEditing: true, 
        scannedOrder: action.scannedOrder
      });
    }

    case Constants.ORDERS_UPDATE_END_EDIT_ORDER: {
      return lodash.assign({}, state, {
        isEditing: false,
        scannedOrder: ''
      });
    }

    default: return state;
  }
}

//
// Actions
//

export function FetchList() {
  return (dispatch, getState) => {
    const {updateOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = updateOrders;

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.ORDERS_UPDATE_FETCH_START,
    });

    FetchGet('/order/pickup', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_UPDATE_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });

        dispatch({
          type: Constants.ORDERS_UPDATE_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_UPDATE_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch update orders"));
    });
  }
}


export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_UPDATE_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_UPDATE_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function StartEditOrder(order) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;
    dispatch({type:modalAction.BACKDROP_SHOW});
    FetchGet('/order/' + order.UserOrderID, token).then(function(response) {
      response.json().then(function({data}) {
        dispatch({type:modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
          scannedOrder: order
        });
      });
    });
  }
}

export function StopEditOrder() {
  return {type: Constants.ORDERS_UPDATE_END_EDIT_ORDER};
}