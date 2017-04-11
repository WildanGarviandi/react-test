import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import moment from 'moment';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import * as DashboardService from '../dashboard/dashboardService';

const Constants = {
  PERFORMANCE_FETCH_END: "performance/fetch/end",
  PERFORMANCE_FETCH_START: "performance/fetch/start",
  PERFORMANCE_SET: "performance/trips/set",
  PERFORMANCE_DATE_SET: "performance/trips/dateSet",
  PERFORMANCE_DATE_RESET: "performance/trips/dateReset"
}

const initialState = {
  performances: {},
  filters: {
    startDate: moment(new Date()).subtract(5, 'days'),
    endDate: moment(new Date())
  }
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.PERFORMANCE_FETCH_END: {
      return state;
    }

    case Constants.PERFORMANCE_FETCH_START: {
      return state;
    }

    case Constants.PERFORMANCE_SET: {
      return lodash.assign({}, state, {performances: action.performances});
    }

    case Constants.PERFORMANCE_DATE_SET: {
      return lodash.assign({}, state, {
        filters: {
          startDate: action.startDate,
          endDate: action.endDate
        }
      });
    }

    case Constants.PERFORMANCE_DATE_RESET: {
      return lodash.assign({}, state, {
        performances: {},
        filters: {
          startDate: moment(new Date()).subtract(5, 'days'),
          endDate: moment(new Date())
        }
      });
    }

    default: return state;
  }
}

export function ResetDate(startDate, endDate) {
  return (dispatch, getState) => {
    dispatch({
      type: Constants.PERFORMANCE_DATE_RESET
    });
    dispatch(FetchList());
  }
}

export function ChangeDate(startDate, endDate) {
  return (dispatch, getState) => {
    const {performance, userLogged} = getState().app;
    const {token} = userLogged;
    const {filters} = performance;
    dispatch({
      type: Constants.PERFORMANCE_DATE_SET,
      startDate: startDate,
      endDate: endDate
    });
    dispatch(FetchList());
  }
}

export function FetchList() {
  return (dispatch, getState) => {
    const {performance, userLogged} = getState().app;
    const {token} = userLogged;
    const {filters} = performance;

    const query = lodash.assign({}, filters, {
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString()
    });

    dispatch({
      type: Constants.PERFORMANCE_FETCH_START,
    });

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/order/performance', token, query, true).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.PERFORMANCE_SET,
          performances: data.performances
        });

        dispatch({
          type: Constants.PERFORMANCE_FETCH_END,
        });
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }).catch((e) => {
      dispatch({
        type: Constants.PERFORMANCE_FETCH_END,
      });
      dispatch({
        type: Constants.PERFORMANCE_SET,
        performances: {}
      });
      dispatch({type: modalAction.BACKDROP_HIDE});
      const message = (e && e.message) ? e.message : "Failed to fetch";
      dispatch(ModalActions.addMessage(message));
    });
  }
}