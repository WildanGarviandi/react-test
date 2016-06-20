import * as actionTypes from '../constants';
import DriversFetch from './driversFetch';

function SetFleet(fleetID) {
  return (dispatch) => {
    dispatch({type: actionTypes.FLEET_SET, fleetID});
    dispatch(DriversFetch(fleetID));
  }
}

export default SetFleet;
