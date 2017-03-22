import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import FetchDelete from '../modules/fetch/delete';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';
import Promise from 'bluebird';
import {fetchXhr} from '../modules/fetch/getXhr';

const Constants = {
  BASE: "mytrip/defaultSet/",
  SET_TRIPS: "mytrip/trips/set",
  TOGGLE_SELECT_TRIP: "mytrip/trips/select",
  TOGGLE_SELECT_ALL: "mytrip/trips/selectAll",
  TRIP_DETAILS_SET: "mytrip/trips/details",
  FETCHING_PAGE: "mytrip/trips/fetchingStart",
  FETCHING_PAGE_STOP: "mytrip/trips/fetchingStop",
  TOGGLE_SELECT_TRIP_ORDER: "mytrip/trips/orders/select",
  TOGGLE_SELECT_TRIP_ALL: "mytrip/trips/orders/selectAll",
  TRIP_EXPAND_ORDER: "mytrip/trips/expand",
  TRIP_EXPAND_DRIVER: "mytrip/trips/expandDriver",
  TRIP_EXPAND_DRIVER_BULK: "mytrip/trips/expandDriverBulk",
  TRIP_SHRINK_ORDER: "mytrip/trips/shrink",
  TRIP_DRIVER_ASSIGN_START: "mytrip/trips/driver/assign/start",
  TRIP_DRIVER_ASSIGN_END: "mytrip/trips/driver/assign/end",
  TRIP_DRIVER_DEASSIGN_START: "mytrip/trips/driver/deassign/start",
  TRIP_DRIVER_DEASSIGN_END: "mytrip/trips/driver/deassign/end",
  SET_DRIVER: "mytrip/trips/setDriver",
  RESET_DRIVER: "mytrip/trips/resetDriver",
  SHOW_SUCCESS_ASSIGN: "mytrip/trips/showSuccess",
  CLOSE_SUCCESS_ASSIGN: "mytrip/trips/closeSuccess"
}

const initialStore = {
  currentPage: 1,
  filters: {},
  limit: 10,
  statusName: "SHOW ALL",
  sortOptions: "Sort By",
  total: 0,
  trips: [],
  selectedAll: false,
  isFetching: false,
  trip: {},
  expandedTrip: {},
  isExpandTrip: false,
  isExpandDriver: false,
  isExpandDriverBulk: false,
  isSettingDriver: false,
  orders: [],
  selectedDriver: null,
  isSuccessAssign: false
}

export default function Reducer(store = initialStore, action) {
  const parsedActionType = action.type.split('/');
  if(parsedActionType.length > 2 && parsedActionType[0] === "mytrip" && parsedActionType[1] === "defaultSet") {
    const fieldName = parsedActionType[2];
    return lodash.assign({}, store, {[fieldName]: action[fieldName]});
  }

  switch(action.type) {
    case Constants.SET_TRIPS: {
      return lodash.assign({}, store, {
        total: action.total,
        trips: action.trips,
      });
    }

    case Constants.TOGGLE_SELECT_TRIP: {
      const newTrips= lodash.map(store.trips, (trip) => {
        if(trip.TripID !== action.tripID) {
            return trip;
        }

        return lodash.assign({}, trip, {IsChecked: !trip.IsChecked});
      });

      return lodash.assign({}, store, {
        trips: newTrips,
      });
    }

    case Constants.TOGGLE_SELECT_ALL: {
      const {trips, selectedAll} = store;
      const newTrips = lodash.map(trips, (trip) => {
        return lodash.assign({}, trip, {IsChecked: !selectedAll});
      });

      return lodash.assign({}, store, {
        selectedAll: !selectedAll,
        trips: newTrips,
      })
    }

    case Constants.FETCHING_PAGE: {
      return lodash.assign({}, store, {
        isFetching: true
      });
    }

    case Constants.TRIP_DETAILS_SET: {
      return lodash.assign({}, store, {
        trip: action.trip,
        isFetching: false
      });
    }

    case Constants.FETCHING_PAGE_STOP: {
      return lodash.assign({}, store, {
        trip: {},
        isFetching: false
      });
    }

    case Constants.TOGGLE_SELECT_TRIP_ORDER: {
        
      const { orders } = store;

      let newOrders = lodash.clone(orders);
      if (newOrders.includes(action.orderID)) {
        lodash.pull(newOrders, action.orderID);
      } else {
        newOrders.push(action.orderID);
      }

      return lodash.assign({}, store, {
        orders: newOrders
      });
    }

    case Constants.TOGGLE_SELECT_TRIP_ALL: {
      const {expandedTrip, orders} = store;

      let newOrders = [];
      if (expandedTrip.UserOrderRoutes.length !== orders.length) {
        newOrders = expandedTrip.UserOrderRoutes.map((order) => {
            return order.UserOrderRouteID;
        });
      }

      return lodash.assign({}, store, {
        orders: newOrders
      })
    }

    case Constants.TRIP_EXPAND_ORDER: {
      return lodash.assign({}, store, {
        expandedTrip: action.trip,
        orders: [],
        isExpandTrip: true
      });
    }

    case Constants.TRIP_EXPAND_DRIVER: {
      return lodash.assign({}, store, {
        isExpandDriver: true
      });
    }

    case Constants.TRIP_EXPAND_DRIVER_BULK: {
      return lodash.assign({}, store, {
        isExpandDriver: true,
        isExpandDriverBulk: true
      });
    }

    case Constants.TRIP_SHRINK_ORDER: {
      return lodash.assign({}, store, {
        expandedTrip: {},
        isExpandTrip: false,
        isExpandDriver: false,
        isExpandDriverBulk: false
      });
    }

    case Constants.TRIP_DRIVER_ASSIGN_START: {
      return lodash.assign({}, store, {
        isSettingDriver: true
      });
    }

    case Constants.TRIP_DRIVER_ASSIGN_END: {
      return lodash.assign({}, store, {
        isSettingDriver: false
      });
    }

    case Constants.TRIP_DRIVER_DEASSIGN_START: {
      return lodash.assign({}, store, {
        isSettingDriver: true
      });
    }

    case Constants.TRIP_DRIVER_DEASSIGN_END: {
      return lodash.assign({}, store, {
        isSettingDriver: false
      });
    }

    case Constants.SET_DRIVER: {
      return lodash.assign({}, store, {
        selectedDriver: action.driverID
      });
    }

    case Constants.RESET_DRIVER: {
      return lodash.assign({}, store, {
        selectedDriver: action.driverID
      });
    }        

    case Constants.SHOW_SUCCESS_ASSIGN: {
      return lodash.assign({}, store, {
          isSuccessAssign: true
      });
    }

    case Constants.CLOSE_SUCCESS_ASSIGN: {
      return lodash.assign({}, store, {
          isSuccessAssign: false
      });
    }

    default: {
      return store;
    }
  }
}

export function StoreSetter(keyword, value) {
  return {type: Constants.BASE + keyword, [keyword]: value};
}

export function SetFilters(filters) {
  return StoreSetter("filters", filters);
}

export function UpdateFilters(filters) {
  return (dispatch, getState) => {
    const prevFilters = getState().app.myTrips.filters;
    const nextFilter = lodash.assign({}, prevFilters, filters);
    dispatch(SetFilters(nextFilter));
  }
}

export function SetDropDownFilter(keyword) {
  const filterNames = {
    "statusName": "status",
    "sortOptions": "sortOptions"
  };

  return (selectedOption) => {
    const filterName = filterNames[keyword];

    return (dispatch, getState) => {
        dispatch(StoreSetter(keyword, selectedOption.value));
        dispatch(StoreSetter("currentPage", 1));
        dispatch(UpdateFilters({[filterName]: selectedOption.key}));
        dispatch(FetchList());
    }
  }
}

export function SetCurrentPage(currentPage) {
  return (dispatch, getState) => {
    dispatch(StoreSetter("currentPage", currentPage));
    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch, getState) => {
    dispatch(StoreSetter("limit", limit));
    dispatch(SetCurrentPage(1));
  }
}

export function UpdateAndFetch(filters) {
  return (dispatch) => {
    dispatch(StoreSetter("currentPage", 1));
    dispatch(UpdateFilters(filters));
    dispatch(FetchList());
  }
}

export function ToggleChecked(tripID) {
  return {
    type: Constants.TOGGLE_SELECT_TRIP,
    tripID: tripID
  }
}
 
export function ToggleCheckedAll() {
  return { type: Constants.TOGGLE_SELECT_ALL };
}

export function FetchList() {
  return (dispatch, getState) => {
    const {myTrips, userLogged} = getState().app;
    const {currentPage, limit, total, filters} = myTrips;
    const {token} = userLogged;
    const sortFilter = [{
      key: 1, sortBy: 'AssignedTime', sortCriteria: 'ASC'      
    }, {
      key: 2, sortBy: 'AssignedTime', sortCriteria: 'DESC'      
    }];

    if (filters.sortOptions) {
      let sortKey = _.find(sortFilter, {'key': filters.sortOptions});
      filters.sortBy = sortKey.sortBy;
      filters.sortCriteria = sortKey.sortCriteria;
      delete filters.sortOptions;
    }

    const params = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage - 1) * limit
    });

    if (filters.status) {
      params.statusIDs = JSON.stringify([filters.status]);
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({type: Constants.FETCHING_PAGE});
    FetchGet('/trip/unassigned', token, params).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        })
      }

      return response.json().then(({data}) => {
        if (data.count < total) {
          dispatch(SetCurrentPage(1));
        }
        dispatch({type: modalAction.BACKDROP_HIDE});
        dispatch({
          type: Constants.SET_TRIPS,
          trips: data.rows,
          total: data.count,
        });
        dispatch({type: Constants.FETCHING_PAGE_STOP});
      });
    }).catch((e) => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(e.message));
      dispatch({type: Constants.FETCHING_PAGE_STOP});
    });
  }
}

export function fetchDetails(id) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({type: Constants.FETCHING_PAGE});
    FetchGet('/trip/' + id, token).then(function(response) {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(function({data}) {
        dispatch({
          type: Constants.TRIP_DETAILS_SET,
          trip: data,
        });
        dispatch({type: modalAction.BACKDROP_HIDE});
      });
    }).catch((e) => {
      window.history.back();
      const message = (e && e.message) ? e.message : "Failed to fetch trip details";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function ExportTrip() {
  return (dispatch, getState) => {
    const {myTrips, userLogged} = getState().app;
    const {filters, total} = myTrips;
    const {token} = userLogged;
    const acceptHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const responseType = 'arraybuffer';
    let params = lodash.assign({}, filters, {});
    let isProceed;

    if (filters.status) {
      params.statusIDs = JSON.stringify([filters.status]);
    }

    var output ='<p style="text-align: center">'+
                '<img src="../img/loading.gif" style="width:100px; height:100px;" />'+
                '<br />'+
                'You can do other things, while exporting in progress'+
                '</p>';

    var popout = window.open();
    popout.document.write(output);
    let xhr = fetchXhr('/trip/assigned/export/', params, token, acceptHeader, responseType);
    xhr.onload = function (oEvent) {
      let blob = new Blob([xhr.response], {type: acceptHeader});
      let fileName = 'export_'+ moment(new Date()).format('YYYY-MM-DD HH:mm:ss') +'.xlsx';
      if (typeof window.navigator.msSaveBlob !== 'undefined') {
        window.navigator.msSaveBlob(blob, fileName);
      } else {
        let URL = window.URL || window.webkitURL;
        let downloadUrl = window.URL.createObjectURL(blob);

        if (fileName) {
          let a = document.createElement("a");
          if (typeof a.download === 'undefined') {
            popout.location.href = downloadUrl;
          } else {
            a.href = downloadUrl;
            a.download = fileName;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
          }
        } else {
            popout.location.href = downloadUrl;
        }

        setTimeout(function () { 
          window.URL.revokeObjectURL(downloadUrl); 
          popout.close();
        }, 1000);
      }
    };

    xhr.send(null);
  }
}

export function ToggleOrderChecked(orderID) {
  return {
    type: Constants.TOGGLE_SELECT_TRIP_ORDER,
    orderID: orderID
  }
}
 
export function ToggleOrderCheckedAll() {
  return { type: Constants.TOGGLE_SELECT_TRIP_ALL };
}

export function ExpandTrip(trip) {
  return {
    type: Constants.TRIP_EXPAND_ORDER,
    trip: trip
  }
}

export function ExpandDriver() {
  return {
    type: Constants.TRIP_EXPAND_DRIVER
  }
}

export function ExpandDriverBulk() {
  return {
    type: Constants.TRIP_EXPAND_DRIVER_BULK
  }
}

export function ShrinkTrip(trip) {
  return {
    type: Constants.TRIP_SHRINK_ORDER
  }
}

export function CloseSuccessAssign() {
  return {
    type: Constants.CLOSE_SUCCESS_ASSIGN
  }
}

export function ReassignDriver(tripID, driverID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const body = {
      DriverID: driverID,
    };

    dispatch({ type: Constants.TRIP_DRIVER_DEASSIGN_START });
    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchDelete(`/trip/${tripID}/driver`, token).then((response) => { 
      dispatch({ type: Constants.TRIP_DRIVER_DEASSIGN_END });
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      dispatch({ type: Constants.TRIP_DRIVER_ASSIGN_START });
      return FetchPost(`/trip/${tripID}/driver`, token, body);
    }).then((response) => {
      dispatch({ type: Constants.TRIP_DRIVER_ASSIGN_END });
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      dispatch({ type: Constants.SHOW_SUCCESS_ASSIGN });
      dispatch(ResetDriver());
      dispatch(ShrinkTrip());
      dispatch(FetchList());
      dispatch({type: modalAction.BACKDROP_HIDE});
    }).catch((e) => {
      const message = (e && e.message) || "Failed to set driver";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
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

    dispatch({ type: Constants.TRIP_DRIVER_ASSIGN_START });
    dispatch({type: modalAction.BACKDROP_SHOW});
    FetchPost(`/trip/${tripID}/driver`, token, body).then((response) => {
      dispatch({ type: Constants.TRIP_DRIVER_ASSIGN_END });
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      dispatch({ type: Constants.SHOW_SUCCESS_ASSIGN });
      dispatch(ResetDriver());
      dispatch(ShrinkTrip());
      dispatch(FetchList());
      dispatch({type: modalAction.BACKDROP_HIDE});
    }).catch((e) => {
      const message = (e && e.message) || "Failed to set driver";
      dispatch(ModalActions.addMessage(message));
      dispatch({type: modalAction.BACKDROP_HIDE});
    });
  }
}

export function BulkAssignDriver(trips, driverID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    let tripIDs = [];
    trips.forEach(function(trip) {
      tripIDs.push(trip.TripID);
    })

    const body = {
      driverID: driverID,
      tripIDs: tripIDs
    };

    dispatch({ type: Constants.TRIP_DRIVER_ASSIGN_START });
    FetchPost(`/trip/bulk-assign`, token, body).then((response) => {
      dispatch({ type: Constants.TRIP_DRIVER_ASSIGN_END });
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }
      window.location.reload(false); 
    }).catch((e) => {
      const message = (e && e.message) || "Failed to set driver";
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function SetDriver(driverID) {
  return {
    type: Constants.SET_DRIVER,
    driverID: driverID
  }
}

export function ResetDriver() {
  return {
    type: Constants.RESET_DRIVER
  }
}