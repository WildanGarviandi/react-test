import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
  BASE: "dashboard/defaultSet/",
  SET_COUNT: "dashboard/setCount",
  SET_COUNT_TMS: "dashboard/setCountTMS",
}

const initialStore = {
  currentPage: 1,
  limit: 100,
  count: [],
  countTMS: []
}

export default function Reducer(store = initialStore, action) {
  const parsedActionType = action.type.split('/');
  if (parsedActionType.length > 2 && parsedActionType[0] === "dashboard" && parsedActionType[1] === "defaultSet") {
    const fieldName = parsedActionType[2];
    return lodash.assign({}, store, {[fieldName]: action[fieldName]});
  }

  switch(action.type) {
    case Constants.SET_COUNT: {
      return lodash.assign({}, store, {
          count: action.count,
      });
    }

    case Constants.SET_COUNT_TMS: {
      return lodash.assign({}, store, {
          countTMS: action.count,
      });
    }

    default: {
      return store;
    }
  }
}

export function FetchCount() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;
    let params = {};

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/order/order-count', token, params, true).then((response) => {
      return response.json().then(({data}) => {
        dispatch({
          type: Constants.SET_COUNT,
          count: data,
        })
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    })
    .catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}

export function FetchCountTMS() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;
    let params = {};

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/trip/counter', token, params).then((response) => {
      return response.json().then(({data}) => {
        dispatch({
          type: Constants.SET_COUNT_TMS,
          count: data,
        })
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    })
    .catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}