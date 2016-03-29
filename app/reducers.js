import _ from 'lodash';
import { combineReducers } from 'redux';
import authReducers from './modules/auth/reducers';
import containersReducers from './modules/containers/reducers';
import districtsReducers from './modules/districts/reducers';

export default combineReducers({ 
  userLogged: authReducers,
  containers: containersReducers.containers,
  ordersPrepared: containersReducers.ordersPrepared,
  districts: districtsReducers
});
