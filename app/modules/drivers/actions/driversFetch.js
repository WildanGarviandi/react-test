import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';
import ModalActions from '../../modals/actions';

function FetchDrivers(fleetID) {
  return (dispatch, getState) => {
    const {driversStore, userLogged} = getState().app;
    const {token} = userLogged;

    if(driversStore.fleetDrivers.dict[fleetID] && driversStore.fleetDrivers.dict[fleetID].length > 0) {
      return;
    }

    dispatch({ type: actionTypes.DRIVERS_FETCH_START, fleetID });
    fetchGet(`/fleet/${fleetID}/drivers`, token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            fleetID,
            type: actionTypes.DRIVERS_FETCH_RECEIVED,
            list: response
          });
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED, fleetID });
          dispatch(ModalActions.addError(error));
        });
      }
    }).catch(() => {
        dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED, fleetID });
        dispatch(ModalActions.addError('Network error while fetching drivers list'));
    });
  }
}

export default FetchDrivers;
