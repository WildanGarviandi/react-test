import * as _ from 'lodash';
import FetchGet from '../modules/fetch/get';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';

const Constants = {
  SET_CURRENTPAGE: 'history/currentPage/set',
  SET_FILTER: 'history/filter/set',
  SET_LIMIT: 'history/limit/set',
  SET_STATUSNAME: 'history/statusName/set',
  SET_TRIPS: 'history/trips/set',
  SET_TRIPTYPE: 'history/tripType/set',
  RESET_FILTER: 'history/resetFilter',
  SET_FILTER_ORDER: 'history/setFilterOrder',
  RESET_FILTER_ORDER: 'history/resetFilterOrder',
};

const initialStore = {
  currentPage: 1,
  filters: {},
  limit: 10,
  statusName: 'SHOW ALL',
  total: 0,
  tripType: 'Show All',
  trips: [],
  filteredOrders: [],
};

export default function Reducer(store = initialStore, action) {
  switch (action.type) {
    case Constants.SET_CURRENTPAGE: {
      return _.assign({}, store, { currentPage: action.currentPage });
    }

    case Constants.SET_FILTER: {
      return _.assign({}, store, { filters: action.filters });
    }

    case Constants.SET_LIMIT: {
      return _.assign({}, store, { limit: action.limit });
    }

    case Constants.SET_STATUSNAME: {
      return _.assign({}, store, { statusName: action.statusName });
    }

    case Constants.SET_TRIPTYPE: {
      return _.assign({}, store, { tripType: action.tripType });
    }

    case Constants.SET_TRIPS: {
      return _.assign({}, store, {
        total: action.total,
        trips: action.trips,
      });
    }

    case Constants.RESET_FILTER: {
      return _.assign({}, store, {
        filters: {},
        currentPage: 1,
        filterStatus: 'SHOW ALL',
        limit: 10,
      });
    }

    case Constants.SET_FILTER_ORDER: {
      return _.assign({}, store, { filteredOrders: action.filteredOrders });
    }

    case Constants.RESET_FILTER_ORDER: {
      return _.assign({}, store, { filteredOrders: [] });
    }

    default: {
      return store;
    }
  }
}

export function SetFilters(filters) {
  return { type: Constants.SET_FILTER, filters };
}

export function UnsetFilters(keywords) {
  return (dispatch, getState) => {
    const prevFilters = getState().app.tripsHistory.filters;
    const nextFilter = _.omit(prevFilters, keywords);
    dispatch(SetFilters(nextFilter));
  };
}

export function UpdateFilters(filters) {
  return (dispatch, getState) => {
    const prevFilters = getState().app.tripsHistory.filters;
    const nextFilter = _.assign({}, prevFilters, filters);
    dispatch(SetFilters(nextFilter));
  };
}


export function FetchList() {
  return (dispatch, getState) => {
    const { tripsHistory, userLogged } = getState().app;
    const { currentPage, limit, filters } = tripsHistory;
    const { hubID, token } = userLogged;

    const params = _.assign({}, filters, {
      limit,
      offset: (currentPage - 1) * limit,
    });

    delete params.userOrderNumbers;
    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchGet(`/trip/historyByHub/${hubID}`, token, params).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch({
          type: Constants.SET_TRIPS,
          trips: data.rows,
          total: data.count,
        });
      });
    }).catch((e) => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({ type: Constants.SET_CURRENTPAGE, currentPage });
    dispatch(FetchList());
  };
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({ type: Constants.SET_LIMIT, limit });
    dispatch(SetCurrentPage(1));
  };
}

export function FilterMultipleOrder() {
  return (dispatch, getState) => {
    const { tripsHistory, userLogged } = getState().app;
    const { filters } = tripsHistory;
    const { hubID, token } = userLogged;

    const params = {};
    params.userOrderNumbers = filters.userOrderNumbers;
    params.limit = 1000000;
    params.offset = 0;

    const promises = [];
    const filterMessage = [];

    function filterSingleEDS(token, userOrderNumber, params) {
      return new Promise((resolve) => {
        delete params.userOrderNumbers;
        FetchGet(`/trip/historyByHub/${hubID}`, token, params)
          .then((response) => {
            return response.json().then(({ data }) => {
              data.UserOrderNumber = userOrderNumber;
              return resolve(data);
            });
          });
      });
    }

    dispatch({ type: modalAction.BACKDROP_SHOW });
    params.userOrderNumbers.forEach((userOrderNumber) => {
      params.userOrderNumber = userOrderNumber;
      promises.push(filterSingleEDS(token, userOrderNumber, params));
    });

    Promise.all(promises).then((responses) => {
      responses.forEach((response) => {
        if (response.rows.length === 0) {
          filterMessage.push({ UserOrderNumber: response.UserOrderNumber, Found: false });
        } else {
          const tripIDs = [];
          response.rows.forEach((trip) => {
            tripIDs.push(trip.TripID);
          });
          filterMessage.push({
            UserOrderNumber: response.UserOrderNumber,
            Found: true,
            TripID: tripIDs,
          });
        }
      });
      dispatch({
        type: Constants.SET_FILTER_ORDER,
        filteredOrders: filterMessage,
      });
      dispatch({ type: modalAction.BACKDROP_HIDE });
    });
  };
}

export function SetTripType(tripType) {
  return (dispatch) => {
    dispatch({ type: Constants.SET_TRIPTYPE, tripType: tripType.value });
    dispatch(UpdateFilters({ tripType: tripType.key }));
    dispatch(SetCurrentPage(1));
  };
}

export function ResetFilter() {
  return (dispatch) => {
    dispatch({ type: Constants.RESET_FILTER });
  };
}

export function ResetFilterOrder() {
  return { type: Constants.RESET_FILTER_ORDER };
}

export function UpdateAndFetch(filters) {
  return (dispatch) => {
    dispatch(UpdateFilters(filters));
    dispatch(SetCurrentPage(1));
  };
}

export function SetStatus(status) {
  return (dispatch) => {
    dispatch({ type: Constants.SET_STATUSNAME, statusName: status.value });
    dispatch(UpdateFilters({ statusID: status.key }));
    dispatch(SetCurrentPage(1));
  };
}
