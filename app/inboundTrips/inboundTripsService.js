import * as _ from 'lodash'; //eslint-disable-line
import { push } from 'react-router-redux';

import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { TripParser } from '../modules/trips';
import OrderStatusSelector from '../modules/orderStatus/selector';
import { modalAction } from '../modules/modals/constants';
import * as DashboardService from '../dashboard/dashboardService';

const Constants = {
  TRIPS_INBOUND_CURRENTPAGE_SET: 'inbound/currentPage/set',
  TRIPS_INBOUND_FETCH_END: 'inbound/fetch/end',
  TRIPS_INBOUND_FETCH_START: 'inbound/fetch/start',
  TRIPS_INBOUND_FILTERS_SET: 'inbound/filters/set',
  TRIPS_INBOUND_FILTERS_STATUS_SET: 'inbound/filtersStatus/set',
  TRIPS_INBOUND_LIMIT_SET: 'inbound/limit/set',
  TRIPS_INBOUND_SET: 'inbound/trips/set',
  TRIPS_INBOUND_RESET_STATE: 'inbound/trips/resetState',
  TRIPS_INBOUND_SHOW_DETAILS: 'inbound/trips/showDetails',
  TRIPS_INBOUND_HIDE_DETAILS: 'inbound/trips/hideDetails',
  TRIPS_INBOUND_SET_CURRENT_TRIP: 'inbound/trips/setCurrentTrip',
  TRIPS_INBOUND_SHOW_RE_ASSIGN_MODAL: 'inbound/trips/showReAssignModal',
  TRIPS_INBOUND_HIDE_RE_ASSIGN_MODAL: 'inbound/trips/hideReAssignModal',
  TRIPS_INBOUND_SET_DRIVERS: 'inbound/trips/setDrivers',
  TRIPS_INBOUND_SET_HUBS: 'inbound/trips/setHubs',
  TRIPS_INBOUND_SET_FILTER_DRIVER: 'inbound/trips/setFilterDriver',
  TRIPS_INBOUND_SET_FILTER_HUB: 'inbound/trips/setFilterHub',
  TRIPS_INBOUND_SET_CURRENT_PAGE_DRIVER: 'inbound/trips/setCurrentPageDriver',
  TRIPS_INBOUND_SET_LIMIT_DRIVERS: 'inbound/trips/setLimitDrivers',
  TRIPS_INBOUND_ERASE_FILTER: 'inbound/trips/eraseSFilter',
  TRIPS_INBOUND_SET_DROPDOWN_FILTER: 'inbound/trips/setDropdownFilter',
  TRIPS_INBOUND_ADD_HUB: 'inbound/trips/hub/add',
  TRIPS_INBOUND_DELETE_HUB: 'inbound/trips/hub/delete',
};

const initialState = {
  currentPage: 1,
  filters: {
    tripType: 0,
  },
  filtersStatus: 'SHOW ALL',
  isFetching: false,
  limit: 25,
  total: 0,
  trips: [],
  showDetails: false,
  tripActive: {},
  showModal: false,
  showReAssignModal: false,
  currentTrip: {},
  drivers: [],
  totalDrivers: 0,
  currentPageDrivers: 1,
  limitDrivers: 25,
  filterDrivers: {},
  hubs: [],
  totalHubs: 0,
  filterHubs: {},
  hubIDs: [],
  tripProblem: {},
};

export function Reducer(state = initialState, action) {
  switch (action.type) {
    case Constants.TRIPS_INBOUND_CURRENTPAGE_SET: {
      return _.assign({}, state, { currentPage: action.currentPage });
    }

    case Constants.TRIPS_INBOUND_FETCH_END: {
      return _.assign({}, state, { isFetching: false });
    }

    case Constants.TRIPS_INBOUND_FETCH_START: {
      return _.assign({}, state, { isFetching: true });
    }

    case Constants.TRIPS_INBOUND_FILTERS_SET: {
      return _.assign({}, state, { filters: action.filters });
    }

    case Constants.TRIPS_INBOUND_FILTERS_STATUS_SET: {
      return _.assign({}, state, { filtersStatus: action.filtersStatus });
    }

    case Constants.TRIPS_INBOUND_LIMIT_SET: {
      return _.assign({}, state, { limit: action.limit });
    }

    case Constants.TRIPS_INBOUND_SET: {
      return _.assign({}, state, {
        trips: action.trips,
        total: action.total,
      });
    }

    case Constants.TRIPS_INBOUND_SHOW_DETAILS: {
      return _.assign({}, state, { showDetails: true, tripActive: action.trip });
    }

    case Constants.TRIPS_INBOUND_HIDE_DETAILS: {
      return _.assign({}, state, { showDetails: false, tripActive: {} });
    }

    case Constants.TRIPS_INBOUND_SET_CURRENT_TRIP: {
      return _.assign({}, state, action.payload);
    }

    case Constants.TRIPS_INBOUND_SHOW_RE_ASSIGN_MODAL: {
      return _.assign({}, state, { showReAssignModal: true });
    }

    case Constants.TRIPS_INBOUND_HIDE_RE_ASSIGN_MODAL: {
      return _.assign({}, state, { showReAssignModal: false });
    }

    case Constants.TRIPS_INBOUND_SET_DRIVERS: {
      return _.assign({}, state, action.payload);
    }

    case Constants.TRIPS_INBOUND_SET_HUBS: {
      return _.assign({}, state, action.payload);
    }

    case Constants.TRIPS_INBOUND_SET_FILTER_DRIVER: {
      return _.assign({}, state, { filterDrivers: action.payload });
    }

    case Constants.TRIPS_INBOUND_SET_FILTER_HUB: {
      return _.assign({}, state, { filterHubs: action.payload });
    }

    case Constants.TRIPS_INBOUND_SET_CURRENT_PAGE_DRIVER: {
      return _.assign({}, state, action.payload);
    }

    case Constants.TRIPS_INBOUND_SET_LIMIT_DRIVERS: {
      return _.assign({}, state, action.payload);
    }

    case Constants.TRIPS_INBOUND_SET_DROPDOWN_FILTER: {
      const { keyword, option } = action.payload;

      return _.assign({}, state, { [keyword]: option });
    }

    case Constants.TRIPS_INBOUND_ADD_HUB: {
      const hubIDs = state.hubIDs.concat([action.payload.hub.key]);
      return Object.assign({}, state, {
        hubIDs,
      });
    }

    case Constants.TRIPS_INBOUND_DELETE_HUB: {
      const hubIDs = _.filter(state.hubIDs, hubID =>
        hubID !== action.payload.hub.key);
      return Object.assign({}, state, {
        hubIDs,
      });
    }

    case Constants.TRIPS_INBOUND_RESET_STATE: {
      return initialState;
    }

    case Constants.TRIPS_INBOUND_ERASE_FILTER: {
      return _.assign({}, state, {
        filterDrivers: {},
        filterHubs: {},
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
    const { inboundTrips } = getState().app;
    const { filters } = inboundTrips;

    dispatch({
      type: Constants.TRIPS_INBOUND_FILTERS_SET,
      filters: _.assign({}, filters, newFilters),
    });
  };
}

export function FetchList() {
  return (dispatch, getState) => {
    const { inboundTrips, userLogged } = getState().app;
    const { token } = userLogged;
    const { currentPage, filters, limit, tripProblem, hubIDs } = inboundTrips;

    const query = _.assign({}, filters, {
      limit,
      nonDelivered: true,
      offset: (currentPage - 1) * limit,
      tripProblemMasterID: (tripProblem.key || '') &&
      (tripProblem.key === 0 ? '' : tripProblem.key),
      hubIDs: hubIDs.join(),
    });

    dispatch({
      type: Constants.TRIPS_INBOUND_FETCH_START,
    });

    FetchGet('/trip/inbound', token, query).then((response) => {
      if (!response.ok) {
        throw new Error();
      }

      response.json().then(({ data }) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_SET,
          trips: _.map(data.rows, TripParser),
          total: data.count,
        });

        dispatch({
          type: Constants.TRIPS_INBOUND_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.TRIPS_INBOUND_FETCH_END,
      });

      dispatch(ModalActions.addMessage('Failed to fetch inbound trips'));
    });
  };
}

export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_CURRENTPAGE_SET,
      currentPage,
    });

    dispatch(FetchList());
  };
}

export function SetFiltersStatus(keyword) {
  return (dispatch, getState) => {
    const options = OrderStatusSelector.GetList(getState());
    const orderStatus = _.reduce(options, (results, status) => {
      results[status.value] = status.key;
      return results;
    }, {});

    const { inboundTrips } = getState().app;
    const { filters } = inboundTrips;

    const newFilters = !orderStatus[keyword] ? { statusIDs: [] } : {
      statusIDs: JSON.stringify([orderStatus[keyword]]),
    };

    dispatch({
      type: Constants.TRIPS_INBOUND_FILTERS_STATUS_SET,
      filtersStatus: keyword,
    });

    dispatch({
      type: Constants.TRIPS_INBOUND_FILTERS_SET,
      filters: _.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  };
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_LIMIT_SET,
      limit,
    });

    dispatch(SetCurrentPage(1));
  };
}

export function GoToContainer(containerNumber) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { hubID, token } = userLogged;

    const query = {
      containerNumber,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchGet('/trip/inbound', token, query).then((response) => {
      if (!response.ok) {
        throw new Error('Container not found');
      }

      return response.json().then(({ data }) => {
        if (data.count < 1) {
          throw new Error('Container not found');
        }

        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(push(`/trips/${data.rows[0].TripID}`));
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to get container details';
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  };
}

export function ResetState() {
  return (dispatch) => {
    dispatch({ type: Constants.TRIPS_INBOUND_RESET_STATE });
  };
}

export function GoToTrip(tripID) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { hubID, token } = userLogged;

    const query = {
      tripID: tripID.split('-')[1],
    };

    if (typeof query.tripID === 'undefined') {
      dispatch(ModalActions.addMessage('Not a valid trip ID'));
      return;
    }

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchGet('/trip/inbound', token, query).then((response) => {
      if (!response.ok) {
        throw new Error('Trip not found');
      }

      return response.json().then(({ data }) => {
        if (data.count < 1) {
          throw new Error('Trip not found');
        }

        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(push(`/trips/${data.rows[0].TripID}`));
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to get trip details';
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  };
}

export function ShowDetails(tripID) {
  return (dispatch, getState) => {
    const { inboundTrips } = getState().app;
    const { trips } = inboundTrips;

    dispatch({
      type: Constants.TRIPS_INBOUND_SHOW_DETAILS,
      trip: _.find(trips, { TripID: tripID }),
    });
  };
}

export function HideDetails() {
  return (dispatch) => {
    dispatch({ type: Constants.TRIPS_INBOUND_HIDE_DETAILS });
  };
}

export function setDropdownFilter(keyword, option) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_SET_DROPDOWN_FILTER,
      payload: {
        keyword,
        option,
      },
    });
  };
}

export function TripDeliver(tripID, reuse) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    dispatch({ type: modalAction.BACKDROP_SHOW });

    const query = {
      reusePackage: reuse,
    };

    FetchPost(`/trip/${tripID}/markdeliver`, token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage('Trip marked as delivered'));
      dispatch(HideDetails());
      dispatch(FetchList());
      dispatch(DashboardService.FetchCount());

      return undefined;
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to mark trip as delivered';
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  };
}

export function FetchDrivers() {
  return (dispatch, getState) => {
    const { inboundTrips, userLogged } = getState().app;
    const { token } = userLogged;
    const { currentPageDrivers, filterDrivers, limitDrivers } = inboundTrips;

    const query = _.assign({}, filterDrivers, {
      limit: limitDrivers,
      offset: (currentPageDrivers - 1) * limitDrivers,
    });

    FetchGet('/driver', token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_SET_DRIVERS,
          payload: {
            drivers: data.rows,
            totalDrivers: data.count,
          },
        });
      });
    }).catch((e) => {
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

export function SetCurrentTrip(trip) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_SET_CURRENT_TRIP,
      payload: {
        currentTrip: trip,
      },
    });
  };
}

export function ShowReAssignModal() {
  return (dispatch) => {
    dispatch({ type: Constants.TRIPS_INBOUND_SHOW_RE_ASSIGN_MODAL });
  };
}

export function HideReAssignModal() {
  return (dispatch) => {
    dispatch({ type: Constants.TRIPS_INBOUND_HIDE_RE_ASSIGN_MODAL });
  };
}

export function SetFilterHub(payload) {
  return (dispatch) => {
    dispatch({ type: Constants.TRIPS_INBOUND_SET_FILTER_HUB, payload });
  };
}

export function FetchHubs() {
  return (dispatch, getState) => {
    const { userLogged, inboundTrips } = getState().app;
    const { filterHubs } = inboundTrips;
    const { token } = userLogged;

    FetchGet('/local', token, {}, true).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        let res = {};
        if (filterHubs.name) {
          const filtered = [];
          _.filter(data.rows, (hub) => {
            if (_.includes(hub.Name.toLowerCase(), filterHubs.name.toLowerCase())) {
              filtered.push(hub);
            }
          });
          res = {
            count: filtered.length,
            rows: filtered,
          };
        } else {
          res = data;
        }

        dispatch({
          type: Constants.TRIPS_INBOUND_SET_HUBS,
          payload: {
            totalHubs: res.count,
            hubs: res.rows,
          },
        });
      });
    }).catch((e) => {
      dispatch(ModalActions.addMessage(e.message));
    });
  };
}

export function SetFilterDriver(payload) {
  return (dispatch) => {
    dispatch({ type: Constants.TRIPS_INBOUND_SET_FILTER_DRIVER, payload });
  };
}

export function AssignDriver(tripID, driverID) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const body = {
      DriverID: driverID,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchPost(`/trip/${tripID}/driver`, token, body).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      response.json().then(() => {
        dispatch(ModalActions.addMessage('Assign driver success'));
        dispatch(FetchList());
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(HideReAssignModal());
      });

      return undefined;
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to set driver';
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  };
}

export function AssignHub(tripID, hubID) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const body = {
      hubID,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });
    FetchPost(`/trip/${tripID}/transfer`, token, body, true).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      response.json().then(() => {
        dispatch(ModalActions.addMessage('Assign hub success'));
        dispatch(FetchList());
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(HideReAssignModal());
      });

      return undefined;
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to assign hub';
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  };
}

export function SetCurrentPageDrivers(currentPageDrivers) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_SET_CURRENT_PAGE_DRIVER,
      payload: { currentPageDrivers },
    });
    dispatch(FetchDrivers());
  };
}

export function setLimitDrivers(limitDrivers) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_SET_LIMIT_DRIVERS,
      payload: { limitDrivers },
    });
    dispatch(SetCurrentPageDrivers(1));
  };
}

export function eraseFilter() {
  return (dispatch) => {
    dispatch({ type: Constants.TRIPS_INBOUND_ERASE_FILTER });
  };
}

export function addHubFilter(hub) {
  return {
    type: Constants.TRIPS_INBOUND_ADD_HUB,
    payload: {
      hub,
    },
  };
}

export function deleteHubFilter(hub) {
  return {
    type: Constants.TRIPS_INBOUND_DELETE_HUB,
    payload: {
      hub,
    },
  };
}
