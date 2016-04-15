import * as actionTypes from '../constants';
import fetch from '../../fetch/post';
import prayItWork from '../../containers/actions/containerDetailsFetch';

export default (containerID, driverID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const params = {
      driverID: driverID
    }

    dispatch({ type: actionTypes.DRIVERS_PICK_START, containerID: containerID, driverID: driverID});
    fetch('/container/' + containerID + '/driver', token, params).then(function(response) {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({
            type: actionTypes.DRIVERS_PICK_SUCCESS, 
            drivers: response
          });
          dispatch(prayItWork(containerID));
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({ type: actionTypes.DRIVERS_PICK_FAILED, error: error});
        });
      }
    }).catch(() => {
        dispatch({ type: actionTypes.DRIVERS_PICK_FAILED, error: 'Network error' });      
    });
  }
}
