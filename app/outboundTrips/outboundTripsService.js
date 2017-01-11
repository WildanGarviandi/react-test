import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {TripParser} from '../modules/trips';
import OrderStatusSelector from '../modules/orderStatus/selector';

const Constants = {
  TRIPS_OUTBOUND_CURRENTPAGE_SET: "outbound/currentPage/set",
  TRIPS_OUTBOUND_FETCH_END: "outbound/fetch/end",
  TRIPS_OUTBOUND_FETCH_START: "outbound/fetch/start",
  TRIPS_OUTBOUND_FILTERS_SET: "outbound/filters/set",
  TRIPS_OUTBOUND_FILTERS_STATUS_SET: "outbound/filtersStatus/set",
  TRIPS_OUTBOUND_LIMIT_SET: "outbound/limit/set",
  TRIPS_OUTBOUND_SET: "outbound/trips/set",
  TRIPS_OUTBOUND_RESET_FILTER: "outbound/trips/resetFilter",
  NEARBY_FLEETS_CURRENTPAGE_SET: "nearbyfleets/currentPage/set",
  NEARBY_FLEETS_FETCH_END: "nearbyfleets/fetch/end",
  NEARBY_FLEETS_FETCH_START: "nearbyfleets/fetch/start",
  NEARBY_FLEETS_FILTERS_SET: "nearbyfleets/filters/set",
  NEARBY_FLEETS_FILTERS_STATUS_SET: "nearbyfleets/filtersStatus/set",
  NEARBY_FLEETS_LIMIT_SET: "nearbyfleets/limit/set",
  NEARBY_FLEETS_SET: "nearbyfleets/trips/set",
  NEARBY_FLEETS_RESET_FILTER: "nearbyfleets/trips/resetFilter",

  NEARBY_DRIVERS_CURRENTPAGE_SET: "nearbyDrivers/currentPage/set",
  NEARBY_DRIVERS_FETCH_END: "nearbyDrivers/fetch/end",
  NEARBY_DRIVERS_FETCH_START: "nearbyDrivers/fetch/start",
  NEARBY_DRIVERS_FILTERS_SET: "nearbyDrivers/filters/set",
  NEARBY_DRIVERS_FILTERS_STATUS_SET: "nearbyDrivers/filtersStatus/set",
  NEARBY_DRIVERS_LIMIT_SET: "nearbyDrivers/limit/set",
  NEARBY_DRIVERS_SET: "nearbyDrivers/trips/set",
  NEARBY_DRIVERS_RESET_FILTER: "nearbyDrivers/trips/resetFilter",

  TRIPS_OUTBOUND_DETAILS_DRIVER_END: "outbound/details/driver/end",
  TRIPS_OUTBOUND_DETAILS_DRIVER_SET: "outbound/details/driver/set",
  TRIPS_OUTBOUND_DETAILS_DRIVER_START: "outbound/details/driver/start",

  TRIPS_OUTBOUND_DETAILS_FLEET_END: "outbound/details/fleet/end",
  TRIPS_OUTBOUND_DETAILS_FLEET_SET: "outbound/details/fleet/set",
  TRIPS_OUTBOUND_DETAILS_FLEET_START: "outbound/details/fleet/start",

  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_CANCEL: "outbound/details/externalTrip/cancel",
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_EDIT: "outbound/details/externalTrip/edit",
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_END: "outbound/details/externalTrip/end",
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_SET: "outbound/details/externalTrip/set",
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_START: "outbound/details/externalTrip/start",
}

const initialState = {
  currentPage: 1,
  filters: {
    tripType: 0,
    externalTrip: 'All'
  },
  filtersStatus: "SHOW ALL",
  isFetching: false,
  limit: 100,
  total: 0,
  trips: [],
  nearbyfleets: {
    isFetching: false,
    fleets: [],
    total: 0,
  },
  nearbyDrivers: {
    isFetching: false,
    drivers: [],
    total: 0,
  },
  driver: null,
  isSetDriver: false,
  fleet: null,
  isSetFleet: false,
  externalTrip: null,
  isSaving3PL: false,
  isEditing3PL: false,
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

    case Constants.TRIPS_OUTBOUND_RESET_FILTER: {
      return lodash.assign({}, state, {
        filters: {
          tripType: 0,
          externalTrip: 'All'
        },
        currentPage: 1,
        filterStatus: "SHOW ALL",
        limit: 100,
      });
    }

    case Constants.NEARBY_FLEETS_FETCH_END: {
      return lodash.merge({}, state, {
        nearbyfleets: {
          isFetching: false
        }
      });
    }

    case Constants.NEARBY_FLEETS_FETCH_START: {
      return lodash.merge({}, state, {
        nearbyfleets: {
          isFetching: true
        }
      });
    }

    case Constants.NEARBY_FLEETS_SET: {
      return lodash.merge({}, state, {
        nearbyfleets: {
          fleets: action.fleets,
          total: action.total
        }
      });
    }

    case Constants.NEARBY_DRIVERS_FETCH_END: {
      return lodash.merge({}, state, {
        nearbyDrivers: {
          isFetching: false
        }
      });
    }

    case Constants.NEARBY_DRIVERS_FETCH_START: {
      return lodash.merge({}, state, {
        nearbyDrivers: {
          isFetching: true
        }
      });
    }

    case Constants.NEARBY_DRIVERS_SET: {
      return lodash.merge({}, state, {
        nearbyDrivers: {
          drivers: action.drivers,
          total: action.total
        }
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_END: {
      return lodash.assign({}, state, {isSetDriver: false});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_SET: {
      return lodash.assign({}, state, {driver: action.driver});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_START: {
      return lodash.assign({}, state, {isSetDriver: true});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END: {
      return lodash.assign({}, state, {isSetFleet: false});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FLEET_SET: {
      return lodash.assign({}, state, {fleet: action.fleet});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FLEET_START: {
      return lodash.assign({}, state, {isSetFleet: true});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_CANCEL: {
      return lodash.assign({}, state, {
        isEditing3PL: false,
        externalTrip: lodash.assign({}, state.prev3PL),
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_EDIT: {
      return lodash.assign({}, state, {
        isEditing3PL: true,
        prev3PL: lodash.assign({}, state.externalTrip),
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_END: {
      return lodash.assign({}, state, {isSaving3PL: false});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_SET: {
      return lodash.assign({}, state, {
        externalTrip: action.externalTrip,
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_START: {
      return lodash.assign({}, state, {isSaving3PL: true});
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

      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_OUTBOUND_SET,
          trips: lodash.map(data.rows, TripParser),
          total: data.count,
        });

        dispatch({
          type: Constants.TRIPS_OUTBOUND_FETCH_END,
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

export function FetchListNearbyFleets() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = '';

    const isHubAPI = true;

    dispatch({
      type: Constants.NEARBY_FLEETS_FETCH_START,
    });

    FetchGet('/fleet/nearby-fleets', token, query, isHubAPI).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.NEARBY_FLEETS_SET,
          fleets: data,
          total: data.length,
        });

        dispatch({
          type: Constants.NEARBY_FLEETS_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.NEARBY_FLEETS_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch nearby vendor"));
    });
  }
}

export function FetchListNearbyDrivers(tripID) {
  return (dispatch, getState) => {
    const {outboundTrips, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = outboundTrips;

    const query = {
      tripID: tripID
    };

    const isHubAPI = true;

    dispatch({
      type: Constants.NEARBY_DRIVERS_FETCH_START,
    });

    FetchGet('/drivers', token, query, isHubAPI).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.NEARBY_DRIVERS_SET,
          drivers: data,
          total: data.length,
        });

        dispatch({
          type: Constants.NEARBY_DRIVERS_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.NEARBY_DRIVERS_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch nearby driver"));
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

export function ResetFilter() {
  return (dispatch) => {
    dispatch({type: Constants.TRIPS_OUTBOUND_RESET_FILTER});
  }
}

export function AssignDriver(tripID, driverID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const body = {
      DriverID: driverID,
    };

    dispatch({ type: Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_START });
    FetchPost(`/trip/${tripID}/driver`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      dispatch({ type: Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_END });
      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_SET,
          driver: data.result,
        });

        window.location.reload(false); 
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to set driver";
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_END });
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function AssignFleet(tripID, fleetManagerID) {
  return (dispatch, getState) => {
    const {outboundTripsService, userLogged} = getState().app;
    const {token} = userLogged;
    const {fleet} = outboundTripsService;

    const body = {
      fleetManagerID: fleetManagerID,
    };

    dispatch({
      type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_START,
    });

    if(fleet) {
      FetchDelete(`/trip/${tripID}/fleetmanager`, token, {}, true).then((response) => {
        if(!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
        }

        return FetchPost(`/trip/${tripID}/fleetmanager`, token, body, true);
      }).then((response) => {
        if(!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
        }

        response.json().then(({data}) => {
          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END,
          });

          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_SET,
            fleet: data.result,
          });
        });

        dispatch(FetchList());
      }).catch((e) => {
        const message = (e && e.message) ? e.message : "Failed to assign fleet";
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END,
        });

        dispatch(ModalActions.addMessage(message));
      });
    } else {
      FetchPost(`/trip/${tripID}/fleetmanager`, token, body, true).then((response) => {
        if(!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
        }

        response.json().then(({data}) => {
          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END,
          });

          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_SET,
            fleet: data.result,
          });
        });

        dispatch(FetchList());
      }).catch((e) => {
        const message = (e && e.message) ? e.message : "Failed to assign fleet";
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END,
        });

        dispatch(ModalActions.addMessage(message));
      });
    }
  }
}

export function SetExternalTrip(externalTrip) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_SET,
      externalTrip: externalTrip
    });
  }
}

export function UpdateExternalTrip(newExternalTrip) {
  return (dispatch, getState) => {
    const {externalTrip} = getState().app.outboundTripsService;

    if(!externalTrip) {
      dispatch(SetExternalTrip(newExternalTrip));
    } else {
      dispatch(SetExternalTrip(lodash.assign({}, externalTrip, newExternalTrip)));
    }
  }
}

export function CreateExternalTrip(tripID) {
  return (dispatch, getState) => {
    const {outboundTripsService, userLogged} = getState().app;
    const {token} = userLogged;
    const {externalTrip} = outboundTripsService;

    if(!externalTrip) {
      dispatch(ModalActions.addMessage("Can't create external trip without any information"));
      return;
    }

    let missingInformation = [];
    const mandatoryInformation = [
      {key: 'AwbNumber', value: 'AWB Number'},
      {key: 'Sender', value: 'Sender'},
      {key: 'Fee', value: 'Fee'},
      {key: 'Transportation', value: 'Transportation'},
      {key: 'DepartureTime', value: 'Departure Time'},
      {key: 'ArrivalTime', value: 'Arrival Time'},
      {key: 'PictureUrl', value: 'Receipt'}
    ];

    mandatoryInformation.forEach(function(x) {
      if (!externalTrip[x.key]) {
        missingInformation.push(x.value);
      }
    });

    if (missingInformation.length > 0) {
      dispatch(ModalActions.addMessage("Can't create external trip. Missing " + missingInformation.join() + " information."));
      return;
    }

    const body = lodash.assign({}, externalTrip, {
      ArrivalTime: externalTrip.ArrivalTime.utc(),
      DepartureTime: externalTrip.DepartureTime.utc(),
      TripID: tripID,
    });

    dispatch({type:modalAction.BACKDROP_SHOW});
    FetchPost(`/external-trip`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      window.location.reload(false);
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to mark trip as delivered';
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function SaveEdit3PL(tripID) {
  return (dispatch, getState) => {
    const {outboundTripsService, userLogged} = getState().app;
    const {token} = userLogged;
    const {externalTrip} = outboundTripsService;

    if(!externalTrip) {
      dispatch(ModalActions.addMessage("Can't create external trip without any information"));
      return;
    }

    let missingInformation = [];
    const mandatoryInformation = [
      {key: 'AwbNumber', value: 'AWB Number'},
      {key: 'Sender', value: 'Sender'},
      {key: 'Fee', value: 'Fee'},
      {key: 'Transportation', value: 'Transportation'},
      {key: 'DepartureTime', value: 'Departure Time'},
      {key: 'ArrivalTime', value: 'Arrival Time'},
      {key: 'PictureUrl', value: 'Receipt'}
    ];

    mandatoryInformation.forEach(function(x) {
      if (!externalTrip[x.key]) {
        missingInformation.push(x.value);
      }
    });

    if (missingInformation.length > 0) {
      dispatch(ModalActions.addMessage("Can't create external trip. Missing " + missingInformation.join() + " information."));
      return;
    }

    const body = lodash.assign({}, externalTrip, {
      ArrivalTime: new moment(externalTrip.ArrivalTime).utc(),
      DepartureTime: new moment(externalTrip.DepartureTime).utc(),
      TripID: tripID,
    });

    dispatch({type:modalAction.BACKDROP_SHOW});
    FetchPost(`/external-trip/${externalTrip.ExternalTripID}`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      return response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch(StopEdit3PL());
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_SET,
          externalTrip: lodash.assign(data.ExternalTrip, {
            ArrivalTime: new Date(data.ExternalTrip.ArrivalTime),
            DepartureTime: new Date(data.ExternalTrip.DepartureTime),
          })
        });
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to mark trip as delivered';
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function StartEdit3PL() {
  return {type: Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_EDIT};
}

export function StopEdit3PL() {
  return {type: Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_CANCEL};
}