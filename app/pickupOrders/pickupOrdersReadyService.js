import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import FetchDelete from '../modules/fetch/delete';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import {TripParser} from '../modules/trips';
import config from '../config/configValues.json';
import * as NearbyFleets from '../nearbyFleets/nearbyFleetService';
import * as DashboardService from '../dashboard/dashboardService';

const Constants = {
  BASE_ORDERS_PICKUP_READY: "pickupReady/defaultSet/",
  ORDERS_PICKUP_READY_CURRENT_PAGE_SET: "pickupReady/currentPage/set",
  ORDERS_PICKUP_READY_FETCH_END: "pickupReady/fetch/end",
  ORDERS_PICKUP_READY_FETCH_START: "pickupReady/fetch/start",
  ORDERS_PICKUP_READY_FILTER_SET: "pickupReady/filters/set",
  ORDERS_PICKUP_READY_LIMIT_SET: "pickupReady/limit/set",
  ORDERS_PICKUP_READY_SELECT_TOGGLE_ALL: "pickupReady/select/toggleAll",
  ORDERS_PICKUP_READY_SELECT_TOGGLE_ONE: "pickupReady/select/toggleOne",
  ORDERS_PICKUP_READY_SET: "pickupReady/set",
  ORDERS_PICKUP_READY_SET_TOTAL: "pickupReady/setTotal",
  ORDERS_PICKUP_READY_RESET_FILTER: "pickupReady/resetFilter",
  ORDERS_PICKUP_READY_SHOW_MODAL: "pickupReady/showModal",
  ORDERS_PICKUP_READY_HIDE_MODAL: "pickupReady/hideModal",
  ORDERS_PICKUP_SET_DRIVERS: "pickupReady/drivers/set",
  ORDERS_PICKUP_RESET_DRIVERS: "pickupReady/drivers/reset",
  ORDERS_PICKUP_DRIVER_FETCH_START: "pickupReady/fetchDriver/start",
  ORDERS_PICKUP_DRIVER_FETCH_END: "pickupReady/fetchDriver/end",
  ORDERS_PICKUP_AUTO_GROUP_ENABLE: "pickupReady/autoGroup/enable",
  ORDERS_PICKUP_AUTO_GROUP_DISABLE: "pickupReady/autoGroup/disable",
  ORDERS_PICKUP_READY_SHOW_MODAL_DETAILS: "pickupReady/showModalDetails",
  ORDERS_PICKUP_READY_HIDE_MODAL_DETAILS: "pickupReady/hideModalDetails",
}

//
// Reducers
//

const initialState = {
  checkedAll: false,
  currentPage: 1,
  filters: {},
  city: 'All',
  listType: 'All',
  isFetching: false,
  limit: 50,
  trips: [],
  total: 0,
  fixTotal: 0,
  showModal: false,
  tripActive: {},
  drivers: [],
  isFetchingDriver: false,
  isAutoGroupActive: false,
  showDetails: false
}

export function Reducer(state = initialState, action) {
  const parsedActionType = action.type.split('/');
  if (parsedActionType.length > 2 && parsedActionType[0] === "pickupReady" && parsedActionType[1] === "defaultSet") {
      const fieldName = parsedActionType[2];
      return lodash.assign({}, state, {[fieldName]: action[fieldName]});
  }

  switch(action.type) {
    case Constants.ORDERS_PICKUP_READY_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.ORDERS_PICKUP_READY_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.ORDERS_PICKUP_READY_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.ORDERS_PICKUP_READY_FILTER_SET: {
      return lodash.assign({}, state, {filters: action.filters});
    }

    case Constants.ORDERS_PICKUP_READY_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.ORDERS_PICKUP_READY_SELECT_TOGGLE_ALL: {
      const currentState = state.checkedAll;
      const newTrips = lodash.map(state.trips, (trip) => {
        return lodash.assign({}, trip, {
          IsChecked: !currentState,
        });
      });

      return lodash.assign({}, state, {
        trips: newTrips,
        checkedAll: !currentState,
      });
    }

    case Constants.ORDERS_PICKUP_READY_SELECT_TOGGLE_ONE: {
      const newTrips = lodash.map(state.trips, (trip) => {
        if(trip.UserOrderID !== action.orderID) {
          return trip;
        }

        return lodash.assign({}, trip, {
          IsChecked: !trip.IsChecked,
        });
      });

      return lodash.assign({}, state, {
        trips: newTrips,
      });
    }

    case Constants.ORDERS_PICKUP_READY_SET: {
      return lodash.assign({}, state, {
        trips: action.trips,
        total: action.total,
      });
    }

    case Constants.ORDERS_PICKUP_READY_SET_TOTAL: {
      return lodash.assign({}, state, {
        fixTotal: action.total,
      });
    }

    case Constants.ORDERS_PICKUP_READY_RESET_FILTER: {
      return lodash.assign({}, state, {
        filters: {}, 
        currentPage: 1,
        city: 'All',
        listType: 'All',
        limit: 50,
      });
    }

    case Constants.ORDERS_PICKUP_READY_SHOW_MODAL: {
      return lodash.assign({}, state, {
        showModal: true, 
        tripActive: action.trip
      });
    }

    case Constants.ORDERS_PICKUP_READY_HIDE_MODAL: {
      return lodash.assign({}, state, {
        showModal: false,
        tripActive: {}
      });
    }

    case Constants.ORDERS_PICKUP_READY_SHOW_MODAL_DETAILS: {
      return lodash.assign({}, state, {
        showDetails: true, 
        tripActive: action.trip
      });
    }

    case Constants.ORDERS_PICKUP_READY_HIDE_MODAL_DETAILS: {
      return lodash.assign({}, state, {
        showDetails: false,
        tripActive: {}
      });
    }

    case Constants.ORDERS_PICKUP_SET_DRIVERS: {
        return lodash.assign({}, state, {
            drivers: action.drivers
        });
    }

    case Constants.ORDERS_PICKUP_RESET_DRIVERS: {
        return lodash.assign({}, state, {
            drivers: []
        });
    }

    case Constants.ORDERS_PICKUP_DRIVER_FETCH_START: {
      return lodash.assign({}, state, {isFetchingDriver: true});
    }

    case Constants.ORDERS_PICKUP_DRIVER_FETCH_END: {
      return lodash.assign({}, state, {isFetchingDriver: false});
    }

    case Constants.ORDERS_PICKUP_AUTO_GROUP_ENABLE: {
      return lodash.assign({}, state, {isAutoGroupActive: true});
    }

    case Constants.ORDERS_PICKUP_AUTO_GROUP_DISABLE: {
      return lodash.assign({}, state, {isAutoGroupActive: false});
    }

    default: return state;
  }
}


export function StoreSetter(keyword, value) {
    return {type: Constants.BASE_ORDERS_PICKUP_READY + keyword, [keyword]: value};
}

export function SetFilters(filters) {
    return StoreSetter("filters", filters);
}

export function UpdateFilters(filters) {
    return (dispatch, getState) => {
        const prevFilters = getState().app.pickupOrdersReady.filters;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFilters(nextFilter));
    }
}

export function SetDropDownFilter(keyword) {
    const filterNames = {
        "city": "city",
        "listType": "listType"
    };

    return (selectedOption) => {
        const filterName = filterNames[keyword];

        return (dispatch, getState) => {
            dispatch(StoreSetter(keyword, selectedOption.value));
            dispatch(StoreSetter("currentPage", 1));
            dispatch(UpdateFilters({[filterName]: selectedOption.value}));
            dispatch(FetchList());
        }
    }
}

export function UpdateAndFetch(filters) {
    return (dispatch) => {
        dispatch(StoreSetter("currentPage", 1));
        dispatch(UpdateFilters(filters));
        dispatch(FetchList());
    }
}

export function FetchList() {
  return (dispatch, getState) => {
    const {pickupOrdersReady, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = pickupOrdersReady;

    if (filters.city === 'All') {
      delete filters.city;
    }

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.ORDERS_PICKUP_READY_FETCH_START,
    });

    FetchGet('/order/order-ready', token, query, true).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_PICKUP_READY_SET,
          trips: data.rows,
          total: data.count,
        });

        if (lodash.isEmpty(filters)) {
          dispatch({
            type: Constants.ORDERS_PICKUP_READY_SET_TOTAL,
            total: data.count,
          });
        }

        dispatch({
          type: Constants.ORDERS_PICKUP_READY_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_PICKUP_READY_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch pickup orders"));
    });
  }
}

export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_READY_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_READY_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function ToggleSelectAll() {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_READY_SELECT_TOGGLE_ALL,
    });
  }
}

export function ToggleSelectOne(orderID) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_PICKUP_READY_SELECT_TOGGLE_ONE,
      orderID: orderID,
    });
  }
}

export function ResetFilter() {
  return (dispatch) => {
    dispatch({type: Constants.ORDERS_PICKUP_READY_RESET_FILTER});
  }
}

export function ShowAssignModal(tripID) {
  return (dispatch, getState) => {
    const {pickupOrdersReady, userLogged} = getState().app;
    const {token} = userLogged;
    let params =  {
      suggestLastMileFleet: 0
    };

    FetchGet('/trip/' + tripID, token, params).then((response) => {
      response.json().then(function({data}) {
        dispatch({
          type: Constants.ORDERS_PICKUP_READY_SHOW_MODAL,
          trip: TripParser(data),
        });
      });
    })
    
  }
}

export function HideAssignModal() {
  return (dispatch) => {
    dispatch({type: Constants.ORDERS_PICKUP_READY_HIDE_MODAL});
    dispatch({type: Constants.ORDERS_PICKUP_RESET_DRIVERS});
  }
}

export function ShowDetails(tripID) {
  return (dispatch, getState) => {
    const {pickupOrdersReady} = getState().app;
    const {trips} = pickupOrdersReady;
    
    dispatch({
      type: Constants.ORDERS_PICKUP_READY_SHOW_MODAL_DETAILS,
      trip: TripParser(lodash.find(trips, {TripID: tripID})),
    });
  }
}

export function HideDetails() {
  return (dispatch) => {
    dispatch({type: Constants.ORDERS_PICKUP_READY_HIDE_MODAL_DETAILS});
  }
}

export function SplitTrip(id, vehicleID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      vehicleID: vehicleID
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost('/trip/split/' + id, token, query, true).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch(ModalActions.addMessage("Success splitting trip"));
        dispatch(FetchList());
        dispatch({
          type: Constants.ORDERS_PICKUP_READY_SHOW_MODAL,
          trip: TripParser(data[0]),
        });
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch(DashboardService.FetchCount());
      });
    }).catch(() => {
      dispatch(ModalActions.addMessage("Failed in splitting trip"));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function FetchDrivers(tripID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      offset: 0,
      limit: 'all'
    };
        
    dispatch({type: Constants.ORDERS_PICKUP_DRIVER_FETCH_START});
    FetchGet('/driver', token, query).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        dispatch({type: Constants.ORDERS_PICKUP_DRIVER_FETCH_END});
        dispatch({
          type: Constants.ORDERS_PICKUP_SET_DRIVERS,
          drivers: data.rows
        })
      });
    }).catch((e) => {
      dispatch({type: Constants.ORDERS_PICKUP_DRIVER_FETCH_END});
      dispatch(ModalActions.addMessage(e.message));
    });
  }
}

export function AssignFleet(tripID, fleetManagerID) {
  return (dispatch, getState) => {
    const {pickupOrdersReady, userLogged} = getState().app;
    const {token} = userLogged;
    const {tripActive} = pickupOrdersReady;

    const body = {
      fleetManagerID: fleetManagerID,
    };

    dispatch({type: modalAction.BACKDROP_SHOW});

    if (tripActive.FleetManager) {
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
          dispatch({type: modalAction.BACKDROP_HIDE});
          dispatch(NearbyFleets.FetchDriverFleet(fleetManagerID));
          dispatch(DashboardService.FetchCount());
        });
      }).catch((e) => {
        const message = (e && e.message) ? e.message : "Failed to assign fleet";
        dispatch({type: modalAction.BACKDROP_HIDE});

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
          dispatch({type: modalAction.BACKDROP_HIDE});
          dispatch(NearbyFleets.FetchDriverFleet(fleetManagerID));
          dispatch(DashboardService.FetchCount());
        });
      }).catch((e) => {
        const message = (e && e.message) ? e.message : "Failed to assign fleet";
        dispatch({type: modalAction.BACKDROP_HIDE});

        dispatch(ModalActions.addMessage(message));
      });
    }
  }
}

export function AssignDriver(tripID, driverID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const body = {
      DriverID: driverID,
    };

    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost(`/trip/${tripID}/driver`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(({data}) => {
        dispatch(ModalActions.addMessage('Assign driver success'));
        dispatch(FetchList());
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch(HideAssignModal());
        window.location.reload(false);
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to set driver";
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function CheckAutoGroup() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    FetchGet('/task-plan/incomplete/', token, {}, true).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        if (data.count === 0) {
          dispatch({type: Constants.ORDERS_PICKUP_AUTO_GROUP_ENABLE});
        } else {
          dispatch({type: Constants.ORDERS_PICKUP_AUTO_GROUP_DISABLE});
        }
      });
    });
  }
}

export function AutoGroup() {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    FetchGet('/task-plan/auto-group/', token, {}, true).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch(ModalActions.addMessage('Auto Group in Progress'));
        dispatch({type: Constants.ORDERS_PICKUP_AUTO_GROUP_DISABLE});
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed in auto grouping";
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function GroupOrders() {
  return (dispatch, getState) => {
    const {pickupOrdersReady, userLogged} = getState().app;
    const {token} = userLogged;
    const {trips} = pickupOrdersReady;

    const checkedOrdersIDs = lodash.chain(trips)
      .filter((order) => {
        return order.IsChecked;
      })
      .map((order) => (order.UserOrderID))
      .value();

    if (checkedOrdersIDs.length === 0) {
      dispatch(ModalActions.addMessage('No order selected'));
      return;
    }

    const body = {
      ordersID: checkedOrdersIDs,
    }

    dispatch({type: modalAction.BACKDROP_SHOW});

    FetchPost('/trip/firstLeg', token, body).then((response) => {
      if(response.ok) {
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch(DashboardService.FetchCount());

        response.json().then(({data}) => {
          dispatch(push('/trips/' + data.TripID));
        });
      } else {
        response.json().then(({error}) => {          
          dispatch({type: modalAction.BACKDROP_HIDE});
          dispatch(ModalActions.addMessage("Failed to group orders. " + error.message[0].reason));
        });
      }
    });
  }
}