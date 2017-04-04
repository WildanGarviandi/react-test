import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchDelete from '../modules/fetch/delete';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import FetchDrivers from '../modules/drivers/actions/driversFetch';
import {TripParser} from '../modules/trips';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {modalAction} from '../modules/modals/constants';
import * as DashboardService from '../dashboard/dashboardService';

const Constants = {
  TRIPS_OUTBOUND_CURRENTPAGE_SET: 'outbound/currentPage/set',
  TRIPS_OUTBOUND_FETCH_END: 'outbound/fetch/end',
  TRIPS_OUTBOUND_FETCH_START: 'outbound/fetch/start',
  TRIPS_OUTBOUND_FILTERS_SET: 'outbound/filters/set',
  TRIPS_OUTBOUND_FILTERS_STATUS_SET: 'outbound/filtersStatus/set',
  TRIPS_OUTBOUND_LIMIT_SET: 'outbound/limit/set',
  TRIPS_OUTBOUND_SET: 'outbound/trips/set',
  TRIPS_OUTBOUND_RESET_FILTER: 'outbound/trips/resetFilter',
  NEARBY_FLEETS_CURRENTPAGE_SET: 'nearbyFleets/currentPage/set',
  NEARBY_FLEETS_FETCH_END: 'nearbyFleets/fetch/end',
  NEARBY_FLEETS_FETCH_START: 'nearbyFleets/fetch/start',
  NEARBY_FLEETS_FILTERS_SET: 'nearbyFleets/filters/set',
  NEARBY_FLEETS_FILTERS_STATUS_SET: 'nearbyFleets/filtersStatus/set',
  NEARBY_FLEETS_LIMIT_SET: 'nearbyFleets/limit/set',
  NEARBY_FLEETS_SET: 'nearbyFleets/trips/set',
  NEARBY_FLEETS_RESET_FILTER: 'nearbyFleets/trips/resetFilter',
  NEARBY_FLEETS_DRIVERS_FETCH_END: 'nearbyFLeets/drivers/fetch/end',
  NEARBY_FLEETS_DRIVERS_FETCH_START: 'nearbyFLeets/drivers/fetch/start',
  NEARBY_FLEETS_DRIVERS_SET: 'nearbyFLeets/drivers/trips/set',

  NEARBY_DRIVERS_CURRENTPAGE_SET: 'nearbyDrivers/currentPage/set',
  NEARBY_DRIVERS_FETCH_END: 'nearbyDrivers/fetch/end',
  NEARBY_DRIVERS_FETCH_START: 'nearbyDrivers/fetch/start',
  NEARBY_DRIVERS_FILTERS_SET: 'nearbyDrivers/filters/set',
  NEARBY_DRIVERS_FILTERS_STATUS_SET: 'nearbyDrivers/filtersStatus/set',
  NEARBY_DRIVERS_LIMIT_SET: 'nearbyDrivers/limit/set',
  NEARBY_DRIVERS_SET: 'nearbyDrivers/trips/set',
  NEARBY_DRIVERS_RESET_FILTER: 'nearbyDrivers/trips/resetFilter',

  TRIPS_OUTBOUND_DETAILS_DRIVER_END: 'outbound/details/driver/end',
  TRIPS_OUTBOUND_DETAILS_DRIVER_SET: 'outbound/details/driver/set',
  TRIPS_OUTBOUND_DETAILS_DRIVER_START: 'outbound/details/driver/start',

  TRIPS_OUTBOUND_ASSIGNING_START: 'outbound/assigning/start',
  TRIPS_OUTBOUND_ASSIGNING_END: 'outbound/assigning/end',

  TRIPS_OUTBOUND_DETAILS_FLEET_END: 'outbound/details/fleet/end',
  TRIPS_OUTBOUND_DETAILS_FLEET_SET: 'outbound/details/fleet/set',
  TRIPS_OUTBOUND_DETAILS_FLEET_START: 'outbound/details/fleet/start',

  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_CANCEL: 'outbound/details/externalTrip/cancel',
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_EDIT: 'outbound/details/externalTrip/edit',
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_END: 'outbound/details/externalTrip/end',
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_SET: 'outbound/details/externalTrip/set',
  TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_START: 'outbound/details/externalTrip/start',

  TRIPS_OUTBOUND_DETAILS_TRIP_SET: 'outbound/details/trip/set',

  TRIPS_OUTBOUND_DETAILS_FETCH_END: 'outbound/details/fetch/end',
  TRIPS_OUTBOUND_DETAILS_FETCH_START: 'outbound/details/fetch/start',

  TRIPS_INBOUND_RESET_FILTER: 'inbound/trips/resetFilter',

  HUB_UPDATE_START: 'outbound/hub/update/start',
  HUB_UPDATE_END: 'outbound/hub/update/end',
  BASE_OUTBOUND: "outbound/defaultSet/",
  DRIVER_CURRENT_PAGE_SET: "outbound/driver/currentPage",
  DRIVER_LIMIT_SET: "outbound/driver/limit"
}

const initialState = {
  currentPage: 1,
  filters: {
    tripType: 0,
    externalTrip: 'All'
  },
  filtersStatus: 'SHOW ALL',
  isDetailFetching: false,
  limit: 25,
  total: 0,
  trips: [],
  nearbyFleets: {
    isFetching: false,
    fleets: [],
    total: 0,
    drivers: [],
    isDriverFetching: false
  },
  nearbyDrivers: {
    isFetching: false,
    drivers: [],
    total: 0,
  },
  filtersDrivers: {},
  currentPageDrivers: 1,
  limitDrivers: 10,
  totalDrivers: 0,
  driver: null,
  isSetDriver: false,
  fleet: null,
  isSetFleet: false,
  externalTrip: null,
  isSaving3PL: false,
  isEditing3PL: false,
  orders: [],
  trip: null,
  suggestLastMileFleet: null,
  prev3PL: null,
  isAssigning: false,
  isHubAssigning: false,
  isSuccessAssigning: false
}

export function Reducer(state = initialState, action) {
  const parsedActionType = action.type.split('/');
  if (parsedActionType.length > 2 && parsedActionType[0] === "outbound" && parsedActionType[1] === "defaultSet") {
      const fieldName = parsedActionType[2];
      return lodash.assign({}, state, {[fieldName]: action[fieldName]});
  }

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
        filterStatus: 'SHOW ALL',
        limit: 25,
      });
    }

    case Constants.NEARBY_FLEETS_FETCH_END: {
      return lodash.merge({}, state, {
        nearbyFleets: {
          isFetching: false
        }
      });
    }

    case Constants.NEARBY_FLEETS_FETCH_START: {
      return lodash.merge({}, state, {
        nearbyFleets: {
          isFetching: true
        }
      });
    }

    case Constants.NEARBY_FLEETS_SET: {
      return lodash.assign({}, state, {
        nearbyFleets: {
          fleets: action.fleets,
          total: action.total
        }
      });
    }

    case Constants.NEARBY_FLEETS_DRIVERS_FETCH_END: {
      return lodash.merge({}, state, {
        nearbyFleets: {
          isDriverFetching: false
        }
      });
    }

    case Constants.NEARBY_FLEETS_DRIVERS_FETCH_START: {
      return lodash.merge({}, state, {
        nearbyFleets: {
          isDriverFetching: true
        }
      });
    }

    case Constants.DRIVER_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPageDrivers: action.currentPage});
    }

    case Constants.ORDERS_PICKUP_DRIVER_LIMIT_SET: {
      return lodash.assign({}, state, {limitDrivers: action.limit});
    }

    case Constants.NEARBY_FLEETS_DRIVERS_SET: {
      return lodash.assign({}, state, {
        nearbyFleets: {
          drivers: action.drivers
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
      return lodash.assign({}, state, {
        nearbyDrivers: {
          drivers: action.drivers,
          total: action.total
        },
        totalDrivers: action.totalDrivers
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_TRIP_SET: {
      return lodash.assign({}, state, {
        driver: action.driver,
        externalTrip: action.externalTrip,
        fleet: action.fleet,
        orders: action.orders,
        prev3PL: action.externalTrip,
        trip: action.trip,
        suggestLastMileFleet: action.suggestLastMileFleet
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FETCH_END: {
      return lodash.assign({}, state, {isDetailFetching: false});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FETCH_START: {
      return lodash.assign({}, state, {isDetailFetching: true});
    }

    case Constants.TRIPS_OUTBOUND_ASSIGNING_START: {
      return lodash.assign({}, state, {
        isAssigning: true,
        isSuccessAssigning: false
      });
    }

    case Constants.TRIPS_OUTBOUND_ASSIGNING_END: {
      return lodash.assign({}, state, {
        isAssigning: false,
        nearbyDrivers: {
          drivers: []
        },
        filtersDrivers: {},
        totalDrivers: 0,
        currentPageDrivers: 1,
        limitDrivers: 10
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_START: {
      return lodash.assign({}, state, {isSetDriver: true});
    }
    case Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_END: {
      return lodash.assign({}, state, {isSetDriver: false});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_SET: {
      return lodash.assign({}, state, {
        driver: action.driver,
        isSuccessAssigning: action.isSuccessAssigning
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FLEET_START: {
      return lodash.assign({}, state, {isSetFleet: true});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END: {
      return lodash.assign({}, state, {isSetFleet: false});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_FLEET_SET: {
      return lodash.assign({}, state, {
        fleet: action.fleet,
        isSuccessAssigning: action.isSuccessAssigning
      });
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_END: {
      return lodash.assign({}, state, {isSaving3PL: false});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_SET: {
      return lodash.assign({}, state, {isSuccessAssigning: true});
    }

    case Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_START: {
      return lodash.assign({}, state, {isSaving3PL: true});
    }

    case Constants.TRIPS_INBOUND_RESET_FILTER: {
      return lodash.assign({}, state, {
        filters: {
          tripType: 0
        }, 
        currentPage: 1,
        filterStatus: 'SHOW ALL',
        limit: 25,
      });
    }

    case Constants.HUB_UPDATE_START: {
      return lodash.assign({}, state, {isHubAssigning: true});
    }

    case Constants.HUB_UPDATE_END: {
      return lodash.assign({}, state, {isHubAssigning: false});
    }

    default: return state;
  }
}

//
// Actions
//

export function AddFilters(newFilters) {
  return (dispatch, getState) => {
    const {outboundTripsService} = getState().app;
    const {filters} = outboundTripsService;

    dispatch({
      type: Constants.TRIPS_OUTBOUND_FILTERS_SET,
      filters: lodash.assign({}, filters, newFilters),
    });

    dispatch(SetCurrentPage(1));
  }
}

export function FetchList() {
  return (dispatch, getState) => {
    const {outboundTripsService, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = outboundTripsService;

    const query = lodash.assign({}, filters, {
      limit: limit,
      nonDelivered: true,
      offset: (currentPage-1)*limit,
      suggestLastMileFleet: 1
    });

    dispatch({type: modalAction.BACKDROP_SHOW});
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
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }).catch(() => {
      dispatch({
        type: Constants.TRIPS_OUTBOUND_FETCH_END,
      });
      dispatch({type: modalAction.BACKDROP_HIDE});

      dispatch(ModalActions.addMessage('Failed to fetch outbound trips'));
    });
  }
}

export function FetchListNearbyFleets() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      limit: 10000
    };

    const isHubAPI = true;

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({
      type: Constants.NEARBY_FLEETS_FETCH_START,
    });

    FetchGet('/fleet/nearby-fleets', token, query, isHubAPI).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
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
      dispatch({type: modalAction.BACKDROP_HIDE});

      dispatch(ModalActions.addMessage('Failed to fetch nearby vendor'));
    });
  }
}

export function FetchListFleetDrivers (fleetID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({
      type: Constants.NEARBY_FLEETS_DRIVERS_FETCH_START
    });

    const query = {
      limit: 'all'
    }

    FetchGet('/fleet/' + fleetID + '/drivers', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.NEARBY_FLEETS_DRIVERS_SET,
          drivers: data.rows
        });

        dispatch({
          type: Constants.NEARBY_FLEETS_DRIVERS_FETCH_END
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.NEARBY_FLEETS_DRIVERS_FETCH_END
      });
      dispatch({type: modalAction.BACKDROP_HIDE});

      dispatch(ModalActions.addMessage('Failed to fetch nearby driver'));
    });
  }
}

export function StoreSetter(keyword, value) {
    return {type: Constants.BASE_OUTBOUND + keyword, [keyword]: value};
}

export function SetFiltersDrivers(filters) {
    return StoreSetter("filtersDrivers", filters);
}

export function UpdateFiltersDrivers(filters) {
  return (dispatch, getState) => {
    const prevFilters = getState().app.pickupOrdersReady.filtersDrivers;
    const nextFilter = lodash.assign({}, prevFilters, filters);
    dispatch(SetFiltersDrivers(nextFilter));
  }
}

export function UpdateAndFetchDrivers(filters) {
  return (dispatch) => {
    dispatch(StoreSetter("currentPageDrivers", 1));
    dispatch(UpdateFiltersDrivers(filters));
    dispatch(FetchListNearbyDrivers());
    }
}

export function SetCurrentPageDrivers(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.DRIVER_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchListNearbyDrivers());
  }
}

export function SetLimitDrivers(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.DRIVER_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPageDrivers(1));
  }
}

export function FetchListNearbyDrivers(tripID) {
  return (dispatch, getState) => {
    const {outboundTripsService, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPageDrivers, filtersDrivers, limitDrivers} = outboundTripsService;

    const query = lodash.assign({}, filtersDrivers, {
      limit: limitDrivers,
      offset: (currentPageDrivers-1)*limitDrivers,
    });

    const isHubAPI = true;

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({
      type: Constants.NEARBY_DRIVERS_FETCH_START,
    });

    FetchGet('/driver', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.NEARBY_DRIVERS_SET,
          drivers: data.rows,
          totalDrivers: data.count,
        });

        dispatch({
          type: Constants.NEARBY_DRIVERS_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.NEARBY_DRIVERS_FETCH_END,
      });
      dispatch({type: modalAction.BACKDROP_HIDE});

      dispatch(ModalActions.addMessage('Failed to fetch nearby driver'));
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

function SetTrip(trip, haveDone) {
  return (dispatch, getState) => {
    let orders, driver, externalTrip, fleet;

    orders = _.map(trip.UserOrderRoutes, (route) => {
      return _.assign({}, route.UserOrder, {
        Status: route.OrderStatus.OrderStatus,
        DeliveryFee: route.DeliveryFee,
      });
    });

    externalTrip = trip.ExternalTrip;
    if(externalTrip) {
      externalTrip.ArrivalTime = new Date(externalTrip.ArrivalTime);
      externalTrip.DepartureTime = new Date(externalTrip.DepartureTime);
    }

    dispatch({
      type: Constants.TRIPS_OUTBOUND_DETAILS_TRIP_SET,
      driver: trip.Driver,
      externalTrip: externalTrip,
      fleet: trip.FleetManager,
      orders: orders,
      trip: lodash.assign({}, getState().app.outboundTripsService.trip, trip),
    });

    dispatch({ type: Constants.TRIPS_OUTBOUND_DETAILS_FETCH_END });
    dispatch({ type: Constants.TRIPS_OUTBOUND_ASSIGNING_START});
    dispatch({type: modalAction.BACKDROP_HIDE});

    if(trip.FleetManager) {
      dispatch(FetchDrivers(trip.FleetManager.UserID));
    }
  }
}

export function FetchDetails(tripID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;
    let params =  {
      suggestLastMileFleet: 0
    };

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({ type: Constants.TRIPS_OUTBOUND_DETAILS_FETCH_START });
    FetchGet('/trip/' + tripID, token, params).then((response) => {
      if(!response.ok) {
        if(response.status === 403) {
          throw new Error("This trip doesn't belong to this hub");
        }

        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(function({data}) {
        dispatch(SetTrip(data));
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to fetch trip details';
      dispatch({ type: Constants.TRIPS_OUTBOUND_DETAILS_FETCH_END });
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
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
    dispatch({type:modalAction.BACKDROP_SHOW});
    FetchPost(`/trip/${tripID}/driver`, token, body).then((response) => {
      if (!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      dispatch({ type: Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_END });
      response.json().then(({data}) => {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_SET,
          driver: data.result,
          isSuccessAssigning: true
        });
        dispatch(FetchList());
        dispatch(DashboardService.FetchCount());
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to set driver';
      dispatch({ type: Constants.TRIPS_OUTBOUND_DETAILS_DRIVER_END });
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function AssignFleet(tripID, fleetManagerID, driverID) {
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

    dispatch({type:modalAction.BACKDROP_SHOW});

    if (fleet) {
      FetchDelete(`/trip/${tripID}/fleetmanager`, token, {}, true).then((response) => {
        if (!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
        }

        return FetchPost(`/trip/${tripID}/fleetmanager`, token, body, true);
      }).then((response) => {
        if (!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
        }

        response.json().then(({data}) => {
          dispatch({type: modalAction.BACKDROP_HIDE})
          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END
          });

          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_SET,
            fleet: data.result,
            isSuccessAssigning: (driverID == undefined)
          });

          if (driverID) {
            dispatch(AssignDriver(tripID, driverID));
          } else {
            dispatch(FetchList())
            dispatch(DashboardService.FetchCount());
          }
        });
      }).catch((e) => {
        const message = (e && e.message) ? e.message : 'Failed to assign fleet';
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END
        });

        dispatch(ModalActions.addMessage(message));
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    } else {
      FetchPost(`/trip/${tripID}/fleetmanager`, token, body, true).then((response) => {
        if (!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
        }

        response.json().then(({data}) => {
          dispatch({type: modalAction.BACKDROP_HIDE})
          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END
          });

          dispatch({
            type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_SET,
            fleet: data.result,
            isSuccessAssigning: (driverID == undefined)
          });

          if (driverID) {
            dispatch(AssignDriver(tripID, driverID))
          }
        });
      }).catch((e) => {
        const message = (e && e.message) ? e.message : 'Failed to assign fleet';
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_FLEET_END,
        });

        dispatch(ModalActions.addMessage(message));
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }
  }
}

export function CreateExternalTrip(externalData) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    if (!externalData) {
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
      {key: 'ArrivalTime', value: 'Arrival Time'}
    ];

    mandatoryInformation.forEach(function(x) {
      if (!externalData[x.key]) {
        missingInformation.push(x.value);
      }
    });

    if (externalData.ArrivalTime <= externalData.DepartureTime) {
      dispatch(ModalActions.addMessage("Arrival Time should be later than Departure Time"));
      return;
    }

    if (externalData.Fee < 1) {
      dispatch(ModalActions.addMessage("Fee should be more than 0"));
      return;
    }

    if (missingInformation.length > 0) {
      dispatch(ModalActions.addMessage("Can't create external trip. Missing " + missingInformation.join() + ' information.'));
      return;
    }

    const body = lodash.assign({}, externalData, {
      ArrivalTime: externalData.ArrivalTime.utc(),
      DepartureTime: externalData.DepartureTime.utc(),
    });

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost(`/external-trip`, token, body).then((response) => {
      if (!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch({type: Constants.TRIPS_OUTBOUND_DETAILS_EXTERNALTRIP_SET});
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to mark trip as delivered';
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function GoToContainer(containerNumber) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      containerNumber: containerNumber,
    };

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchGet('/trip/inbound', token, query).then((response) => {
      if (!response.ok) {
        throw new Error('Container not found');
      }

      return response.json().then(({data}) => {
        if (data.count < 1) {
          throw new Error('Container not found');
        }

        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch(push(`/trips/${data.rows[0].TripID}`));
      })
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to get container details';
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function ResetFilterInbound() {
  return (dispatch) => {
    dispatch({type: Constants.TRIPS_INBOUND_RESET_FILTER});
  }
}

export function EndAssigning () {
  return (dispatch, getState) => {
    const {outboundTripsService} = getState().app;
    const {isSuccessAssigning} = outboundTripsService;

    dispatch({type: Constants.TRIPS_OUTBOUND_ASSIGNING_END});
    (isSuccessAssigning) && dispatch(FetchList());
  }
}

export function setHub(tripID, hubID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      DestinationHubID: hubID,
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({type: Constants.HUB_UPDATE_START});
    FetchPost(`/trip/${tripID}/setdestination`, token, query).then((response) => {
      if (!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_OUTBOUND_DETAILS_TRIP_SET,
          trip: data
        });
        dispatch({type: Constants.HUB_UPDATE_END});
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to set hub';
      dispatch({type: Constants.HUB_UPDATE_END});
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}