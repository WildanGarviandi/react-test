import lodash from 'lodash';
import FetchGet from './fetch/get';
import ModalActions from './modals/actions';
import {TripParser} from './trips';
import OrderStatusSelector from './orderStatus/selector';

const Constants = {
  TRIPS_OUTBOUND_CURRENTPAGE_SET: "outbound/currentPage/set",
  TRIPS_OUTBOUND_FETCH_END: "outbound/fetch/end",
  TRIPS_OUTBOUND_FETCH_START: "outbound/fetch/start",
  TRIPS_OUTBOUND_FILTERS_SET: "outbound/filters/set",
  TRIPS_OUTBOUND_FILTERS_STATUS_SET: "outbound/filtersStatus/set",
  TRIPS_OUTBOUND_LIMIT_SET: "outbound/limit/set",
  TRIPS_OUTBOUND_SET: "outbound/trips/set",
}

const initialState = {
  currentPage: 1,
  filters: {},
  filtersStatus: "SHOW ALL",
  isFetching: false,
  limit: 100,
  total: 0,
  trips: [],
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.TRIPS_OUTBOUND_CURRENTPAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.TRIPS_OUTBOUND_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.TRIPS_OUTBOUND_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.TRIPS_OUTBOUND_FILTERS_SET: {
      return lodash.assign({}, state, {filters: action.filters});
    }

    case Constants.TRIPS_OUTBOUND_FILTERS_STATUS_SET: {
      return lodash.assign({}, state, {filtersStatus: action.filtersStatus});
    }

    case Constants.TRIPS_OUTBOUND_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.TRIPS_OUTBOUND_SET: {
      return lodash.assign({}, state, {
        trips: action.trips,
        total: action.total,
      });
    }

    default: return state;
  }
}

//
// Actions
//

export function AddFilters(newFilters) {
  return (dispatch, getState) => {
    const {outboundTrips} = getState().app;
    const {filters} = outboundTrips;

    dispatch({
      type: Constants.TRIPS_OUTBOUND_FILTERS_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function FetchList() {
  return (dispatch, getState) => {
    const {outboundTrips, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = outboundTrips;

    const query = lodash.assign({}, filters, {
      limit: limit,
      nonDelivered: true,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.TRIPS_OUTBOUND_FETCH_START,
    });

    FetchGet('/trip/outbound', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.TRIPS_OUTBOUND_FETCH_END,
      });

      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_OUTBOUND_SET,
          trips: lodash.map(data.rows, TripParser),
          total: data.count,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.TRIPS_OUTBOUND_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch outbound trips"));
    });
  }
}

export function SetCurrentPage(currentPage) {
  return (dispatch, getState) => {
    dispatch({
      type: Constants.TRIPS_OUTBOUND_CURRENTPAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetFiltersStatus(keyword) {
  return (dispatch, getState) => {
    const options = OrderStatusSelector.GetList(getState());
    const orderStatus = lodash.reduce(options, (results, status) => {
      results[status.value] = status.key;
      return results;
    }, {});

    const {inboundTrips} = getState().app;
    const {filters} = inboundTrips;

    const newFilters = !orderStatus[keyword] ? {statusIDs: []} : {
      statusIDs: JSON.stringify([orderStatus[keyword]]),
    };

    dispatch({
      type: Constants.TRIPS_OUTBOUND_FILTERS_STATUS_SET,
      filtersStatus: keyword,
    });

    dispatch({
      type: Constants.TRIPS_OUTBOUND_FILTERS_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function SetLimit(limit) {
  return (dispatch, getState) => {
    dispatch({
      type: Constants.TRIPS_OUTBOUND_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}
