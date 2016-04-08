import _ from 'lodash';
import { combineReducers } from 'redux';
import authReducers from './modules/auth/reducers';
import containersReducers from './modules/containers/reducers';
import districtsReducers from './modules/districts/reducers';
import drivers from './modules/drivers/reducers';

export default combineReducers({ 
  userLogged: authReducers,
  broadcast: containersReducers.broadcast,
  containers: containersReducers.containers,
  ordersPrepared: containersReducers.ordersPrepared,
  districts: districtsReducers,
  drivers: drivers
});
