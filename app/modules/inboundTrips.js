import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from './fetch/get';
import ModalActions from './modals/actions';
import {TripParser} from './trips';
import OrderStatusSelector from './orderStatus/selector';
import {modalAction} from './modals/constants';

const Constants = {
  TRIPS_INBOUND_CURRENTPAGE_SET: "inbound/currentPage/set",
  TRIPS_INBOUND_FETCH_END: "inbound/fetch/end",
  TRIPS_INBOUND_FETCH_START: "inbound/fetch/start",
  TRIPS_INBOUND_FILTERS_SET: "inbound/filters/set",
  TRIPS_INBOUND_FILTERS_STATUS_SET: "inbound/filtersStatus/set",
  TRIPS_INBOUND_LIMIT_SET: "inbound/limit/set",
  TRIPS_INBOUND_SET: "inbound/trips/set",
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
    case Constants.TRIPS_INBOUND_CURRENTPAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.TRIPS_INBOUND_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.TRIPS_INBOUND_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.TRIPS_INBOUND_FILTERS_SET: {
      return lodash.assign({}, state, {filters: action.filters});
    }

    case Constants.TRIPS_INBOUND_FILTERS_STATUS_SET: {
      return lodash.assign({}, state, {filtersStatus: action.filtersStatus});
    }

    case Constants.TRIPS_INBOUND_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.TRIPS_INBOUND_SET: {
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
    const {inboundTrips} = getState().app;
    const {filters} = inboundTrips;

    dispatch({
      type: Constants.TRIPS_INBOUND_FILTERS_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function FetchList() {
  return (dispatch, getState) => {
    const {inboundTrips, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = inboundTrips;

    const query = lodash.assign({}, filters, {
      limit: limit,
      nonDelivered: true,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.TRIPS_INBOUND_FETCH_START,
    });

    FetchGet('/trip/inbound', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.TRIPS_INBOUND_FETCH_END,
      });

      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_SET,
          trips: lodash.map(data.rows, TripParser),
          total: data.count,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.TRIPS_INBOUND_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch inbound trips"));
    });
  }
}

export function SetCurrentPage(currentPage) {
  return (dispatch, getState) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_CURRENTPAGE_SET,
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

    console.log('os', orderStatus);

    const {inboundTrips} = getState().app;
    const {filters} = inboundTrips;

    const newFilters = !orderStatus[keyword] ? {} : {
      statusIDs: JSON.stringify([orderStatus[keyword]]),
    };

    dispatch({
      type: Constants.TRIPS_INBOUND_FILTERS_STATUS_SET,
      filtersStatus: keyword,
    });

    dispatch({
      type: Constants.TRIPS_INBOUND_FILTERS_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function SetLimit(limit) {
  return (dispatch, getState) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function GoToContainer(containerNumber) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {hubID, token} = userLogged;

    const query = {
      containerNumber: containerNumber,
    };

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/trip/inbound', token, query).then((response) => {
      if(!response.ok) {
        throw new Error('Container not found');
      }

      return response.json().then(({data}) => {
        if(data.count < 1) {
          throw new Error('Container not found');
        }

        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch(push(`/trips/${data.rows[0].TripID}`));
      })
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to get container details";
    dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}
