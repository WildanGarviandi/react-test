import fleetSet from './fleetSet';
import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';
import ModalActions from '../../modals/actions';

function FetchFleets() {
  return (dispatch, getState) => {
    const {driversStore, userLogged} = getState().app;
    const {token} = userLogged;

    if(driversStore.fleetList.shown.length > 0) {
      dispatch(fleetSet(driversStore.fleetDrivers.active));
      return;
    }

    dispatch({ type: actionTypes.FLEETS_FETCH_START});
    fetchGet('/fleet/', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            type: actionTypes.FLEETS_FETCH_RECEIVED, 
            list: response
          });
          dispatch(fleetSet(userLogged.userID));
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({ type: actionTypes.FLEETS_FETCH_FAILED });
          dispatch(ModalActions.addError(error));
        });
      }
    }).catch(() => {
        dispatch({ type: actionTypes.FLEETS_FETCH_FAILED });
        dispatch(ModalActions.addError('Network error while fetching fleets list'));
    });
  }
}

export default FetchFleets;
