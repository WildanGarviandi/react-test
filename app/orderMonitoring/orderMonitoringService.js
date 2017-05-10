import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
  FETCH_COUNT: 'FETCH_COUNT',
  EXPAND_ORDER: 'EXPAND_ORDER',
  HIDE_ORDER: 'HIDE_ORDER'
}

const initialStore = {
  currentPage: 1,
  limit: 100,
  total: 0,
  expandedOrder: false,
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

export function ExpandOrder() {
  return { type: Constants.EXPAND_ORDER }
}

export function HideOrder() {
  return { type: Constants.HIDE_ORDER }
}
