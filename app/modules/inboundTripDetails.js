import lodash from 'lodash';
import moment from 'moment';
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
  TRIPS_INBOUND_DETAILS_EXTERNALTRIP_CANCEL: "inbound/details/externalTrip/cancel",
  TRIPS_INBOUND_DETAILS_EXTERNALTRIP_EDIT: "inbound/details/externalTrip/edit",
  TRIPS_INBOUND_DETAILS_EXTERNALTRIP_END: "inbound/details/externalTrip/end",
  TRIPS_INBOUND_DETAILS_EXTERNALTRIP_SET: "inbound/details/externalTrip/set",
  TRIPS_INBOUND_DETAILS_EXTERNALTRIP_START: "inbound/details/externalTrip/start",
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
  externalTrip: null,
  fleet: null,
  isChangingFleet: false,
  isDeassigning: false,
  isDelivering: false,
  isEditing3PL: false,
  isFetching: false,
  isSaving3PL: false,
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

    case Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_CANCEL: {
      return lodash.assign({}, state, {
        isEditing3PL: false,
        externalTrip: lodash.assign({}, state.prev3PL),
      });
    }

    case Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_EDIT: {
      return lodash.assign({}, state, {
        isEditing3PL: true,
        prev3PL: lodash.assign({}, state.externalTrip),
      });
    }

    case Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_END: {
      return lodash.assign({}, state, {isSaving3PL: false});
    }

    case Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_SET: {
      return lodash.assign({}, state, {
        externalTrip: action.externalTrip,
      });
    }

    case Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_START: {
      return lodash.assign({}, state, {isSaving3PL: true});
    }

    case Constants.TRIPS_INBOUND_DETAILS_FLEET_CHANGED: {
      return lodash.assign({}, state, {isChangingFleet: false});
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
        externalTrip: action.externalTrip,
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
        return response.json().then(({error}) => {
          throw error;
        });
      }

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_FLEET_SET,
        fleet: null,
      });

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_END,
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to deassign fleet";
      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DEASSIGN_END,
      });

      dispatch(ModalActions.addMessage(message));
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
        return response.json().then(({error}) => {
          throw error;
        });
      }

      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_SET,
        driver: null,
      });

      return FetchDelete(`/trip/${tripID}/fleetmanager`, token);
    }).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
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
          return response.json().then(({error}) => {
            throw error;
          });
        }

        return FetchPost(`/trip/${tripID}/fleetmanager`, token, body);
      }).then((response) => {
        if(!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
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
        const message = (e && e.message) ? e.message : "Failed to assign fleet";
        dispatch({
          type: Constants.TRIPS_INBOUND_DETAILS_FLEET_END,
        });

        dispatch(ModalActions.addMessage(message));
      });
    } else {
      FetchPost(`/trip/${tripID}/fleetmanager`, token, body).then((response) => {
        if(!response.ok) {
          return response.json().then(({error}) => {
            throw error;
          });
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
        const message = (e && e.message) ? e.message : "Failed to assign fleet";
        dispatch({
          type: Constants.TRIPS_INBOUND_DETAILS_FLEET_END,
        });

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

    dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_START });
    FetchPost(`/trip/${tripID}/driver`, token, body).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_END });
      response.json().then(({data}) => {
        dispatch({
          type: Constants.TRIPS_INBOUND_DETAILS_DRIVER_SET,
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

export function SetTrip(trip, haveDone) {
  return (dispatch, getState) => {
    let orders, driver, externalTrip, fleet;

    if(haveDone) {
      orders = getState().app.inboundTripDetails.orders;
      driver = getState().app.inboundTripDetails.driver;
      externalTrip = getState().app.inboundTripDetails.externalTrip;
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
      externalTrip = trip.ExternalTrip;

      if(externalTrip) {
        externalTrip.ArrivalTime = new Date(externalTrip.ArrivalTime);
        externalTrip.DepartureTime = new Date(externalTrip.DepartureTime);
      }
    }

    dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_FETCH_END });

    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_TRIP_SET,
      driver: trip.Driver,
      externalTrip: externalTrip,
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
        if(response.status == 403) {
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
      const message = (e && e.message) ? e.message : "Failed to fetch trip details";
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage(message));
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
        return response.json().then(({error}) => {
          throw error;
        });
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
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to remove order";
      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_ORDER_REMOVE_END,
        orderID: orderID,
      });

      dispatch(ModalActions.addMessage(message));
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

    if(!scannedOrder) {
      dispatch(ModalActions.addMessage('Order not found'));
      return;
    }

    dispatch({type: modalAction.BACKDROP_SHOW});
    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_START,
    });

    FetchPost(`/order/${scannedOrder.UserOrderID}/markdeliver`, token).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_END });
      dispatch(ModalActions.addMessage(`Order ${scannedID} has been received`));
      dispatch({
        type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_SET,
        orderID: scannedOrder.UserOrderID,
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to mark order as received";
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch({ type: Constants.TRIPS_INBOUND_DETAILS_ORDER_RECEIVED_END });
      dispatch(ModalActions.addMessage(message));
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
        return response.json().then(({error}) => {
          throw error;
        });
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
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to mark trip as delivered";
      dispatch({type: modalAction.BACKDROP_HIDE});
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function SetExternalTrip(externalTrip) {
  return (dispatch) => {
    dispatch({
      type: Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_SET,
      externalTrip: externalTrip
    });
  }
}

export function UpdateExternalTrip(newExternalTrip) {
  return (dispatch, getState) => {
    const {externalTrip} = getState().app.inboundTripDetails;

    if(!externalTrip) {
      dispatch(SetExternalTrip(newExternalTrip));
    } else {
      dispatch(SetExternalTrip(lodash.assign({}, externalTrip, newExternalTrip)));
    }
  }
}

export function CreateExternalTrip(tripID) {
  return (dispatch, getState) => {
    const {inboundTripDetails, userLogged} = getState().app;
    const {token} = userLogged;
    const {externalTrip} = inboundTripDetails;

    if(!externalTrip) {
      dispatch(ModalActions.addMessage("Can't create external trip without any information"));
      return;
    }

    if(!externalTrip.Fee) {
      dispatch(ModalActions.addMessage("Can't create external trip. Missing fee information."));
      return;
    }

    if(!externalTrip.Transportation) {
      dispatch(ModalActions.addMessage("Can't create external trip. Missing transportation information."));
      return;
    }

    if(!externalTrip.DepartureTime) {
      dispatch(ModalActions.addMessage("Can't create external trip. Missing departure time information."));
      return;
    }

    if(!externalTrip.ArrivalTime) {
      dispatch(ModalActions.addMessage("Can't create external trip. Missing arrival time information."));
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
    const {inboundTripDetails, userLogged} = getState().app;
    const {token} = userLogged;
    const {externalTrip} = inboundTripDetails;

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
          type: Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_SET,
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
  return {type: Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_EDIT};
}

export function StopEdit3PL() {
  return {type: Constants.TRIPS_INBOUND_DETAILS_EXTERNALTRIP_CANCEL};
}
