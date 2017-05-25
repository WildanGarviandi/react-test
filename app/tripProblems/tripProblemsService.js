import * as _ from 'lodash';
import FetchGet from '../modules/fetch/get';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';

const Constants = {
  SET_TRIP_PROBLEMS: 'tripProblems/problems/set',
};

const initialStore = {
  currentPage: 1,
  limit: 100,
  problems: [],
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

    default: {
      return store;
    }
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
