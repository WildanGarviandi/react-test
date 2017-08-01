import { combineReducers } from 'redux';
import authReducers from './modules/auth/reducers';
import containersReducers from './modules/containers/reducers';
import districtsReducers from './modules/districts/reducers';
import drivers from './modules/drivers/reducers';
import modalsReducer from './modules/modals/reducers';
import notifReducer from './modules/notification';
import orders from './modules/orders/reducers';
import { Reducer as inboundTripDetails } from './modules/inboundTripDetails';
import { Reducer as tripDetails } from './tripDetails/tripDetailsService';
import { Reducer as inboundTrips } from './inboundTrips/inboundTripsService';
import { Reducer as outboundTripsService } from './outboundTrips/outboundTripsService';
import { Reducer as receivedOrders } from './modules/receivedOrders';
import { Reducer as grouping } from './grouping/groupingService';
import { Reducer as inboundOrders } from './inbound/inboundOrdersService';
import { Reducer as updateOrders } from './updateOrders/updateOrdersService';
import orderDetails from './modules/orders/reducers/details';
import hubs from './modules/hubs';
import myTrips from './trips/tripService';
import myOngoingTrips from './ongoingTrips/tripService';
import myOrders from './orders/orderService';
import myContacts from './contacts/contactService';
import stateList from './states/stateService';
import tripsHistory from './tripHistory/service';
import myDrivers from './drivers/driverService';
import cityList from './cities/cityService';
import publicCountryList from './location/countryService';
import publicStateList from './location/stateService';
import publicCityList from './location/cityService';
import registerData from './modules/auth/actions/register';
import { Reducer as pickupOrders } from './pickupOrders/pickupOrdersService';
import { Reducer as pickupOrdersReady } from './pickupOrders/pickupOrdersReadyService';
import nearbyFleets from './nearbyFleets/nearbyFleetService';
import dashboard from './dashboard/dashboardService';
import { Reducer as performance } from './performance/performanceService';
import orderMonitoring from './orderMonitoring/orderMonitoringService';
import tripProblems from './tripProblems/tripProblemsService';
import errors from './modules/errors';

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
  inboundTripDetails,
  tripDetails,
  inboundTrips,
  orderDetails,
  orders,
  outboundTripsService,
  pickupOrders,
  pickupOrdersReady,
  receivedOrders,
  grouping,
  inboundOrders,
  updateOrders,
  myTrips,
  myOngoingTrips,
  myOrders,
  myContacts,
  stateList,
  tripsHistory,
  myDrivers,
  cityList,
  publicCountryList,
  publicStateList,
  publicCityList,
  registerData,
  nearbyFleets,
  dashboard,
  performance,
  orderMonitoring,
  tripProblems,
  errors,
});
