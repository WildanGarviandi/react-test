import lodash from 'lodash';
import {combineReducers} from 'redux';
import * as CollHelper from '../../../helper/collection';
import * as actionTypes from '../constants';

const FleetListReducer = CollHelper.CollReducer({
  START: actionTypes.FLEETS_FETCH_START,
  FAILED: actionTypes.FLEETS_FETCH_FAILED,
  RECEIVED: actionTypes.FLEETS_FETCH_RECEIVED,
}, (fleet) => (fleet.UserID));

const DriverListReducer = CollHelper.CollReducer({
  START: actionTypes.DRIVERS_FETCH_START,
  FAILED: actionTypes.DRIVERS_FETCH_FAILED,
  RECEIVED: actionTypes.DRIVERS_FETCH_RECEIVED,
}, (driver) => (driver.Driver.UserID));

const inititalFleetDriversState = {
  dict: {},
  active: 0,
}

function FleetDriversReducer(state = inititalFleetDriversState, action) {
  switch(action.type) {
    case actionTypes.FLEET_SET: {
      return lodash.assign({}, state, {active: action.fleetID});
    }

    case actionTypes.DRIVERS_FETCH_RECEIVED: {
      return lodash.assign({}, state, {
        dict: lodash.assign({}, state.dict, {
          [action.fleetID]: lodash.map(action.list, (driver) => (driver.Driver.UserID)),
        }),
      });
    }

    default: return state;
  }
}

function DriverDeassignmentReducer(state = false, action) {
  switch(action.type) {
    case actionTypes.DRIVER_DEASSIGN_START:
      return true;

    case actionTypes.DRIVER_DEASSIGN_SUCCESS:
    case actionTypes.DRIVER_DEASSIGN_FAILED:
      return false;

    default: return state;
  }
}

export default combineReducers({
  driverDeassignment: DriverDeassignmentReducer,
  driverList: DriverListReducer,
  fleetDrivers: FleetDriversReducer,
  fleetList: FleetListReducer,
});
