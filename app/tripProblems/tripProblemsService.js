import * as _ from 'lodash'; //eslint-disable-line

import FetchGet from '../modules/fetch/get';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';

const Constants = {
  SET_TRIP_PROBLEMS: 'tripProblems/problems/set',
  SET_TOTAL_INBOUND_TRIP_PROBLEM: 'tripProblems/problems/total',
};

const initialStore = {
  currentPage: 1,
  limit: 100,
  problems: [],
  totalInboundTripProblem: 0,
};

export default function Reducer(store = initialStore, action) {
  switch (action.type) {
    case Constants.SET_TRIP_PROBLEMS: {
      const { total, problems } = action.payload;
      return _.assign({}, store, {
        total,
        problems,
      });
    }

    case Constants.SET_TOTAL_INBOUND_TRIP_PROBLEM: {
      const { totalInboundTripProblem } = action.payload;
      return Object.assign({}, store, {
        totalInboundTripProblem,
      });
    }

    default:
      return store;
  }
}

export function FetchList() {
  return (dispatch, getState) => {
    const { tripProblems, userLogged } = getState().app;
    const { currentPage, limit } = tripProblems;
    const { token } = userLogged;
    const params = _.assign({}, {
      limit,
      offset: (currentPage - 1) * limit,
    });

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchGet('/trip-problem', token, params).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch({
          type: Constants.SET_TRIP_PROBLEMS,
          payload: {
            total: data.count,
            problems: data.rows,
          },
        });
      });
    }).catch((e) => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

export function fetchTotalInboundTripProblem() {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    FetchGet('/trip/count-problem', token, {}, true).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({
          type: Constants.SET_TOTAL_INBOUND_TRIP_PROBLEM,
          payload: {
            totalInboundTripProblem: data.Problem,
          },
        });
      });
    }).catch((e) => {
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

