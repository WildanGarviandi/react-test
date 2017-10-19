import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';
import ModalActions from '../../modals/actions';
import { formatRef } from '../../../helper/utility';
import endpoints from '../../../config/endpoints';

function FetchDrivers(fleetID, isWeighting) {
  return (dispatch, getState) => {
    const { driversStore, userLogged } = getState().app;
    const { token } = userLogged;

    if (
      driversStore.fleetDrivers.dict[fleetID] &&
      driversStore.fleetDrivers.dict[fleetID].length > 0
    ) {
      return;
    }

    const params = {
      limit: 'all',
      isWeighting,
    };

    dispatch({ type: actionTypes.DRIVERS_FETCH_START, fleetID });
    fetchGet(`/fleet/${fleetID}/drivers`, token, params)
      .then(response => {
        if (response.ok) {
          return response.json().then(resp => {
            const { rows } = resp.data;
            dispatch({
              fleetID,
              type: actionTypes.DRIVERS_FETCH_RECEIVED,
              list: rows,
            });
          });
        }
        return response.json().then(res => {
          const error = res && res.error && res.error.message;
          dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED, fleetID });
          dispatch(ModalActions.addError(error));
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED, fleetID });
        dispatch(
          ModalActions.addError('Network error while fetching drivers list')
        );
      });
  };
}

function TMSFetchDrivers() {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const params = {
      limit: 'all',
    };

    dispatch({ type: actionTypes.DRIVERS_FETCH_START });
    fetchGet('/driver', token, params)
      .then(response => {
        if (response.ok) {
          return response.json().then(resp => {
            const { rows } = resp.data;
            dispatch({
              type: actionTypes.DRIVERS_FETCH_RECEIVED,
              list: rows,
            });
          });
        }
        return response.json().then(res => {
          const error = res && res.error && res.error.message;
          dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED });
          dispatch(ModalActions.addError(error));
        });
      })
      .catch(() => {
        dispatch({ type: actionTypes.DRIVERS_FETCH_FAILED });
        dispatch(
          ModalActions.addError('Network error while fetching drivers list')
        );
      });
  };
}

const fetchDriversLocation = () => {
  const dispatchFunc = async (dispatch, getState) => {
    const { token } = getState().app.userLogged;
    const url = `/${formatRef(
      endpoints.DRIVER,
      endpoints.BULK_CURRENT_LOCATION
    )}`;

    try {
      let response = await fetchGet(url, token);

      if (!response.ok) {
        throw new Error('Failed to get drivers location.');
      }

      response = await response.json();

      dispatch({
        type: actionTypes.DRIVERS_LOCATION_SET,
        payload: { driversLocation: response.data },
      });
    } catch (e) {
      dispatch(
        ModalActions.addError((e && e.message) || 'Something went wrong')
      );
    }
  };

  return dispatchFunc;
};

export { FetchDrivers, TMSFetchDrivers, fetchDriversLocation };
