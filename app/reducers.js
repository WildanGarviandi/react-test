import { combineReducers } from 'redux';
import authReducers from './modules/auth/reducers';
import containersReducers from './modules/containers/reducers';
import districtsReducers from './modules/districts/reducers';
import drivers from './modules/drivers/reducers';
import modalsReducer from './modules/modals/reducers';
import orders from './modules/orders/reducers';
import pickupOrders from './modules/orders/reducers/pickup';
import receivedOrders from './modules/orders/reducers/received';

export default combineReducers({ 
  userLogged: authReducers,
  broadcast: containersReducers.broadcast,
  containerList: containersReducers.containerList,
  containers: containersReducers.containers,
  ordersPrepared: containersReducers.ordersPrepared,
  districts: districtsReducers,
  driversStore: drivers,
  modals: modalsReducer,
  orders,
  pickupOrders,
  receivedOrders,
});
