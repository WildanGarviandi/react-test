import { combineReducers } from 'redux';
import authReducers from './modules/auth/reducers';
import containersReducers from './modules/containers/reducers';
import districtsReducers from './modules/districts/reducers';
import drivers from './modules/drivers/reducers';
import modalsReducer from './modules/modals/reducers';
import orders from './modules/orders/reducers';
// import pickupOrders from './modules/orders/reducers/pickup';
import {Reducer as inboundTripDetails} from './modules/inboundTripDetails';
import {Reducer as inboundTrips} from './modules/inboundTrips';
import {Reducer as outboundTrips} from './modules/outboundTrips';
import {Reducer as pickupOrders} from './modules/pickupOrders';
// import receivedOrders from './modules/orders/reducers/received';
import {Reducer as receivedOrders} from './modules/receivedOrders';
import orderDetails from './modules/orders/reducers/details';
// import outboundTrips from './modules/trips/reducers/outbound';
import tripDetails from './modules/trips/reducers/details';
import hubs from './modules/hubs/reducers';
import myOrders from './orders/orderService';
import myContacts from './contacts/contactService';
import stateList from './states/stateService';

export default combineReducers({ 
  userLogged: authReducers,
  containerList: containersReducers.containerList,
  containers: containersReducers.containers,
  ordersPrepared: containersReducers.ordersPrepared,
  districts: districtsReducers,
  driversStore: drivers,
  modals: modalsReducer,

  hubs,
  inboundTripDetails,
  inboundTrips,
  orderDetails,
  orders,
  outboundTrips,
  pickupOrders,
  receivedOrders,
  tripDetails,
  myOrders,
  myContacts,
  stateList
});
