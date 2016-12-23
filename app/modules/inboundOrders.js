import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from './fetch/get';
import FetchPost from './fetch/post';
import ModalActions from './modals/actions';
import {OrderParser} from './orders';
import OrderStatusSelector from './orderStatus/selector';

const Constants = {
  ORDERS_INBOUND_CURRENT_PAGE_SET: "inbound/currentPage/set",
  ORDERS_INBOUND_FETCH_END: "inbound/fetch/end",
  ORDERS_INBOUND_FETCH_START: "inbound/fetch/start",
  ORDERS_INBOUND_LIMIT_SET: "inbound/limit/set",
  ORDERS_INBOUND_SET: "inbound/set"
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
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.ORDERS_INBOUND_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.ORDERS_INBOUND_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.ORDERS_INBOUND_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.ORDERS_INBOUND_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.ORDERS_INBOUND_SET: {
      return lodash.assign({}, state, {
        orders: action.orders,
        total: action.total,
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
    const {inboundOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = inboundOrders;

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.ORDERS_INBOUND_FETCH_START,
    });

    FetchGet('/order/pickup', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_INBOUND_SET,
          orders: lodash.map(data.rows, OrderParser),
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

      dispatch(ModalActions.addMessage("Failed to fetch inbound orders"));
    });
  }
}


export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_INBOUND_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_INBOUND_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}