import { combineReducers } from 'redux';
import authReducers from './modules/auth/reducers';
import containersReducers from './modules/containers/reducers';
import districtsReducers from './modules/districts/reducers';
import drivers from './modules/drivers/reducers';
import modalsReducer from './modules/modals/reducers';
import notifReducer from './modules/notification/reducers';
import orders from './modules/orders/reducers';
// import pickupOrders from './modules/orders/reducers/pickup';
import {Reducer as tripDetails} from './tripDetails/tripDetailsService.js';
import {Reducer as inboundTrips} from './inboundTrips/inboundTripsService';
import {Reducer as outboundTrips} from './modules/outboundTrips';
// import {Reducer as pickupOrders} from './modules/pickupOrders';
// import receivedOrders from './modules/orders/reducers/received';
import {Reducer as receivedOrders} from './modules/receivedOrders';
import {Reducer as grouping} from './grouping/groupingService';
import {Reducer as inboundOrders} from './inbound/inboundOrdersService';
import orderDetails from './modules/orders/reducers/details';
// import outboundTrips from './modules/trips/reducers/outbound';
import hubs from './modules/hubs/reducers';
import myTrips from './trips/tripService';
import myOrders from './orders/orderService';
import myContacts from './contacts/contactService';
import stateList from './states/stateService';
import tripsHistory from './tripHistory/service';
import myDrivers from './drivers/driverService';
import cityList from './cities/cityService';
import {Reducer as pickupOrders} from './pickupOrders/pickupOrdersService';
import {Reducer as pickupOrdersReady} from './pickupOrders/pickupOrdersReadyService';
import nearbyFleets from './nearbyFleets/nearbyFleetService';

export default combineReducers({ 
  userLogged: authReducers,
  containerList: containersReducers.containerList,
  containers: containersReducers.containers,
  ordersPrepared: containersReducers.ordersPrepared,
  districts: districtsReducers,
  driversStore: drivers,
  modals: modalsReducer,
  notification: notifReducer,

  hubs,
  tripDetails,
  inboundTrips,
  orderDetails,
  orders,
  outboundTrips,
  pickupOrders,
  pickupOrdersReady,
  receivedOrders,
  grouping,
  inboundOrders,
  myTrips,
  myOrders,
  myContacts,
  stateList,
  tripsHistory,
  myDrivers,
  cityList,
  nearbyFleets
});
