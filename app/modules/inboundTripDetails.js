import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchDrivers from './drivers/actions/driversFetch';
import FetchDelete from './fetch/delete';
import FetchGet from './fetch/get';
import FetchPost from './fetch/post';
import ModalActions from './modals/actions';
import {modalAction} from './modals/constants';

const Constants = {
  TRIPS_INBOUND_DETAILS_DEASSIGN_END: "inbound/details/deassign/end",
  TRIPS_INBOUND_DETAILS_DEASSIGN_START: "inbound/details/deassign/start",
  TRIPS_INBOUND_DETAILS_DISTRICT_END: "inbound/details/district/end",
  TRIPS_INBOUND_DETAILS_DISTRICT_SET: "inbound/details/district/set",
  TRIPS_INBOUND_DETAILS_DISTRICT_START: "inbound/details/district/start",
  TRIPS_INBOUND_DETAILS_DRIVER_END: "inbound/details/driver/end",
  TRIPS_INBOUND_DETAILS_DRIVER_SET: "inbound/details/driver/set",
  TRIPS_INBOUND_DETAILS_DRIVER_START: "inbound/details/driver/start",
  TRIPS_INBOUND_DETAILS_FETCH_END: "inbound/details/fetch/end",
  TRIPS_INBOUND_DETAILS_FETCH_START: "inbound/details/fetch/start",
  TRIPS_INBOUND_DETAILS_FLEET_CHANGED: "inbound/details/fleet/changed",
  TRIPS_INBOUND_DETAILS_FLEET_CHANGING: "inbound/details/fleet/changing",
  TRIPS_INBOUND_DETAILS_FLEET_END: "inbound/details/fleet/end",
  TRIPS_INBOUND_DETAILS_FLEET_SET: "inbound/details/fleet/set",
  TRIPS_INBOUND_DETAILS_FLEET_START: "inbound/details/fleet/start",
  TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_END: "inbound/details/order/received/end",
  TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_SET: "inbound/details/order/received/set",
  TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_START: "inbound/details/order/received/start",
  TRIPS_INBOUND_DETAILS_ORDER_REMOVE_END: "inbound/details/order/remove/end",
  TRIPS_INBOUND_DETAILS_ORDER_REMOVE_SET: "inbound/details/order/remove/set",
  TRIPS_INBOUND_DETAILS_ORDER_REMOVE_START: "inbound/details/order/remove/start",
  TRIPS_INBOUND_DETAILS_TRIP_DELIVERED_END: "inbound/details/trip/delivered/end",
  TRIPS_INBOUND_DETAILS_TRIP_DELIVERED_SET: "inbound/details/trip/delivered/set",
  TRIPS_INBOUND_DETAILS_TRIP_DELIVERED_START: "inbound/details/trip/delivered/start",
  TRIPS_INBOUND_DETAILS_TRIP_SET: "inbound/details/trip/set",
}

const initialState = {
  driver: null,
  fleet: null,
  isChangingFleet: false,
  isDeassigning: false,
  isDelivering: false,
  isFetching: false,
  isSetDriver: false,
  isSetFleet: false,
  orders: [],
  trip: null,
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_END: {
      return lodash.assign({}, state, {isDeassigning: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_START: {
      return lodash.assign({}, state, {isDeassigning: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_DISTRICT_END: {
      return lodash.assign({}, state, {isSetDistrict: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_DISTRICT_SET: {
      return lodash.assign({}, state, {district: action.district});
    }

    case Constants.TRIPS_INBOUND_DETAILS_DISTRICT_START: {
      return lodash.assign({}, state, {isSetDistrict: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_DRIVER_END: {
      return lodash.assign({}, state, {isSetDriver: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_DRIVER_SET: {
      return lodash.assign({}, state, {driver: action.driver});
    }

    case Constants.TRIPS_INBOUND_DETAILS_DRIVER_START: {
      return lodash.assign({}, state, {isSetDriver: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FLEET_CHANGED: {
      return lodash.assign({}, state, {isChangingFleet: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FLEET_CHANGING: {
      return lodash.assign({}, state, {isChangingFleet: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FLEET_END: {
      return lodash.assign({}, state, {isSetFleet: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FLEET_SET: {
      return lodash.assign({}, state, {fleet: action.fleet});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FLEET_START: {
      return lodash.assign({}, state, {isSetFleet: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_END: {
      const newOrders = lodash.map(state.orders, (order) => {
        if(order.UserOrderID !== action.orderID) {
          return order;
        }

        return lodash.assign({}, order, {isReceiving: false});
      });

      return lodash.assign({}, state, {orders: newOrders});
    }

    case Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_SET: {
      const newOrders = lodash.map(state.orders, (order) => {
        if(order.UserOrderID !== action.orderID) {
          return order;
        }

        return lodash.assign({}, order, {Status: "DELIVERED"});
      });

      return lodash.assign({}, state, {orders: newOrders});
    }

    case Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_START: {
      const newOrders = lodash.map(state.orders, (order) => {
        if(order.UserOrderID !== action.orderID) {
          return order;
        }

        return lodash.assign({}, order, {isReceiving: true});
      });

      return lodash.assign({}, state, {orders: newOrders});
    }

    case Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_END: {
      const newOrders = lodash.map(state.orders, (order) => {
        if(order.UserOrderID !== action.orderID) {
          return order;
        }

        return lodash.assign({}, order, {isRemoving: false});
      });

      return lodash.assign({}, state, {orders: newOrders});
    }

    case Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_SET: {
      const newOrders = lodash.filter(state.orders, (order) => (order.UserOrderID !== action.orderID));

      return lodash.assign({}, state, {orders: newOrders});
    }

    case Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_START: {
      const newOrders = lodash.map(state.orders, (order) => {
        if(order.UserOrderID !== action.orderID) {
          return order;
        }

        return lodash.assign({}, order, {isRemoving: true});
      });

      return lodash.assign({}, state, {orders: newOrders});
    }

    case Constants.TRIPS_INBOUND_DETAILS_TRIP_DELIVERED_END: {
      return lodash.assign({}, state, {isDelivering: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_TRIP_DELIVERED_START: {
      return lodash.assign({}, state, {isDelivering: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_TRIP_SET: {
      return lodash.assign({}, state, {
        driver: action.driver,
        fleet: action.fleet,
        orders: action.orders,
        trip: action.trip,
      });
    }

    default: return state;
  }
}

//
// Actions
//

export function ChangeFleetEnd() {
  return ({
    type: Constants.TRIPS_INBOUND_DETAILS_FLEET_CHANGED,
  });
}

export function ChangeFleetStart() {
  return ({
    type: Constants.TRIPS_INBOUND_DETAILS_FLEET_CHANGING,
  });
}

export function DeassignFleet(tripID) {
  return (dispatch, getState) => {
    const {inboundTripDetails, userLogged} = getState().app;
    const {token} = userLogged;
    const {fleet} = inboundTripDetails;

    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_START,
    });

    return FetchDelete(`/trip/${tripID}/fleetmanager`, token).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_FLEET_SET,
        fleet: null,
      });

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_END,
      });
    }).catch((e) => {
      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_END,
      });

      dispatch(ModalActions.addMessage('Failed to deassign fleet'));
    });
  }
}

export function Deassign(tripID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_START,
    });

    FetchDelete(`/trip/${tripID}/driver`, token).then((response) => {
      if(!response.ok) {
        throw new Error('Failed to deassign driver');
      }

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_SET,
        driver: null,
      });

      return FetchDelete(`/trip/${tripID}/fleetmanager`, token);
    }).then((response) => {
      if(!response.ok) {
        throw new Error('Failed to deassign fleet');
      }

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_FLEET_SET,
        fleet: null,
      });

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_END,
      });

      window.location.reload(false);
    }).catch((e) => {
      const message = (e && e.message) || "Failed to deassign";
      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_END,
      });

      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function AssignFleet(tripID, fleetManagerID) {
  return (dispatch, getState) => {
    const {inboundTripDetails, userLogged} = getState().app;
    const {token} = userLogged;
    const {fleet} = inboundTripDetails;

    const body = {
      fleetManagerID: fleetManagerID,
    };

    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_FLEET_START,
    });

    if(fleet) {
      FetchDelete(`/trip/${tripID}/fleetmanager`, token).then((response) => {
        if(!response.ok) {
          throw new Error();
        }

        return FetchPost(`/trip/${tripID}/fleetmanager`, token, body);
      }).then((response) => {
        if(!response.ok) {
          throw new Error();
        }

        response.json().then(({data}) => {
          dispatch({
            type: Constants.TRIPS_INBOUND_DETAILS_FLEET_END,
          });

          dispatch({
            type: Constants.TRIPS_INBOUND_DETAILS_FLEET_SET,
            fleet: data.result,
          });

          dispatch(FetchDrivers(data.result.UserID));
          dispatch(ChangeFleetEnd());
        });
      }).catch((e) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_DETAILS_FLEET_END,
        });

        dispatch(ModalActions.addMessage("Failed to assign fleet"));
      });
    } else {
      FetchPost(`/trip/${tripID}/fleetmanager`, token, body).then((response) => {
        if(!response.ok) {
          throw new Error();
        }

        response.json().then(({data}) => {
          dispatch({
            type: Constants.TRIPS_INBOUND_DETAILS_FLEET_END,
          });

          dispatch({
            type: Constants.TRIPS_INBOUND_DETAILS_FLEET_SET,
            fleet: data.result,
          });

          dispatch(FetchDrivers(data.result.UserID));
          dispatch(ChangeFleetEnd());
        });
      }).catch((e) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_DETAILS_FLEET_END,
        });

        dispatch(ModalActions.addMessage("Failed to assign fleet"));
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

    dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_START });
    FetchPost(`/trip/${tripID}/driver`, token, body).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_END });
      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_SET,
          driver: data.result,
        });

        window.location.reload(false); 
      });
    }).catch(() => { 
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_END });
      dispatch(ModalActions.addMessage('Failed to set driver'));
    });
  }
}

export function SetTrip(trip, haveDone) {
  return (dispatch, getState) => {
    let orders, driver, fleet;

    if(haveDone) {
      orders = getState().app.inboundTripDetails.orders;
      driver = getState().app.inboundTripDetails.driver;
      fleet = getState().app.inboundTripDetails.fleet;
    } else {
      orders = _.map(trip.UserOrderRoutes, (route) => {
        return _.assign({}, route.UserOrder, {
          Status: route.OrderStatus.OrderStatus,
          DeliveryFee: route.DeliveryFee,
        });
      });

      driver = trip.Driver;
      fleet = trip.fleet;
    }

    dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_FETCH_END });

    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_TRIP_SET,
      driver: trip.Driver,
      fleet: trip.FleetManager,
      orders: orders,
      trip: lodash.assign({}, getState().app.inboundTripDetails.trip, trip),
    });

    if(trip.FleetManager) {
      dispatch(FetchDrivers(trip.FleetManager.UserID));
    }

    dispatch({
      type: "CONTAINER_DETAILS_FETCH_SUCCESS",
      ContainerID: trip.ContainerNumber,
      container: {CurrentTrip: trip},
      orders: orders,
      trip: trip,
      fillAble: trip.OrderStatus === 1 || trip.OrderStatus === 9,
      reusable: false
    });
  }
}

export function FetchDetails(tripID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_FETCH_START });
    FetchGet('/trip/' + tripID, token).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(function({data}) {
        dispatch(SetTrip(data));
      });
    }).catch(() => { 
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage('Failed to fetch trip details'));
    });
  }
}

export function OrderRemove(tripID, orderID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const body = {
      ordersID: [orderID],
    }

    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_START,
      orderID: orderID,
    });

    FetchDelete(`/trip/${tripID}/orders`, token, body).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_END,
        orderID: orderID,
      });

      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_SET,
          orderID: orderID,
        });
      });
    }).catch(() => { 
      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_END,
        orderID: orderID,
      });

      dispatch(ModalActions.addMessage('Failed to remove order'));
    });
  }
}

export function OrderReceived(scannedID) {
  return (dispatch, getState) => {
    const {inboundTripDetails, userLogged} = getState().app;
    const {token} = userLogged;
    const {orders} = inboundTripDetails;

    const scannedOrder = lodash.find(orders, (order) => {
      return order.OrderStatus.OrderStatus !== 5 &&
        (order.UserOrderNumber === scannedID || order.WebOrderID === scannedID);
    });

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_START,
    });

    FetchPost(`/order/${scannedOrder.UserOrderID}/markdeliver`, token).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_END });
      dispatch(ModalActions.addMessage(`Order ${scannedID} has been received`));
      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_SET,
        orderID: scannedOrder.UserOrderID,
      });
    }).catch(() => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_END });
      dispatch(ModalActions.addMessage('Failed to mark order as received'));
    });
  }
}

export function TripDeliver(tripID, reuse) {
  return (dispatch, getState) => {
    const {inboundTripDetails, userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({type: modalAction.BACKDROP_SHOW});

    const query = {
      reusePackage: reuse ? true : false,
    }

    FetchPost(`/trip/${tripID}/markdeliver`, token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage('Trip marked as delivered'));

      const newTrip = lodash.assign({}, inboundTripDetails.trip, {
        OrderStatus: {
          OrderStatus: "DELIVERED",
        },
      });

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_TRIP_SET,
        driver: inboundTripDetails.driver,
        fleet: inboundTripDetails.fleet,
        orders: inboundTripDetails.orders,
        trip: newTrip,
      });

      if(reuse) {
        response.json().then(({data}) => {
          dispatch(push(`/trips/${data.NextTrip.TripID}`));
        });
      }
    }).catch(() => {
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage('Failed to mark trip as delivered'));
    });
  }
}
