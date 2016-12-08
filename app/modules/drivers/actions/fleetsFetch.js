import fleetSet from './fleetSet';
import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';
import ModalActions from '../../modals/actions';

let x = 0;

function FetchFleets() {
  return (dispatch, getState) => {
    const {driversStore, userLogged} = getState().app;
    const {token} = userLogged;

    // if(driversStore.fleetList.shown.length > 0) {
    //   dispatch(fleetSet(driversStore.fleetDrivers.active));
    //   return;
    // }
    
    const params = {
      includeCapacity: 1
    }

    dispatch({ type: actionTypes.FLEETS_FETCH_START});

    fetchGet('/fleet/', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            type: actionTypes.FLEETS_FETCH_RECEIVED,
            list: response
          });
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
