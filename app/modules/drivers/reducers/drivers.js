import * as _ from 'lodash';
import { combineReducers } from 'redux';

import * as CollHelper from '../../../helper/collection';
import * as actionTypes from '../constants';

const FleetListReducer = CollHelper.CollReducer(
  {
    START: actionTypes.FLEETS_FETCH_START,
    FAILED: actionTypes.FLEETS_FETCH_FAILED,
    RECEIVED: actionTypes.FLEETS_FETCH_RECEIVED,
  },
  fleet => fleet.UserID
);

const DriverListReducer = CollHelper.CollReducer(
  {
    START: actionTypes.DRIVERS_FETCH_START,
    FAILED: actionTypes.DRIVERS_FETCH_FAILED,
    RECEIVED: actionTypes.DRIVERS_FETCH_RECEIVED,
  },
  driver => driver.UserID
);

const inititalFleetDriversState = {
  dict: {},
  active: 0,
  driverList: [],
  driversLocation: [],
};

function FleetDriversReducer(state = inititalFleetDriversState, action) {
  switch (action.type) {
    case actionTypes.FLEET_SET: {
      return Object.assign({}, state, { active: action.fleetID });
    }

    case actionTypes.DRIVERS_FETCH_RECEIVED: {
      return Object.assign({}, state, {
        dict: Object.assign({}, state.dict, {
          [action.fleetID]: _.map(action.list, driver => driver.UserID),
        }),
        driverList: action.list,
      });
    }

    case actionTypes.DRIVERS_LOCATION_SET: {
      const { driversLocation } = action.payload;
      return Object.assign({}, state, { driversLocation });
    }

    default:
      return state;
  }
}

function DriverDeassignmentReducer(state = false, action) {
  switch (action.type) {
    case actionTypes.DRIVER_DEASSIGN_START:
      return true;

    case actionTypes.DRIVER_DEASSIGN_SUCCESS:
    case actionTypes.DRIVER_DEASSIGN_FAILED:
      return false;

    default:
      return state;
  }
}

export default combineReducers({
  driverDeassignment: DriverDeassignmentReducer,
  driverList: DriverListReducer,
  fleetDrivers: FleetDriversReducer,
  fleetList: FleetListReducer,
});
