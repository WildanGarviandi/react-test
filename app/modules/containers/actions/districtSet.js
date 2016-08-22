import {DistrictActions} from '../constants';
import ModalActions from '../../modals/actions';
import {modalAction} from '../../modals/constants';
import fetch from '../../fetch/post';
import {SetTrip} from '../../inboundTripDetails';

function districtSet(tripID, districtID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const params = {
      DistrictID: districtID,
    };

    dispatch({
      type: DistrictActions.DISTRICT_SET_START,
      districtID,
    });

    dispatch({
      type: modalAction.BACKDROP_SHOW
    });

    fetch('/trip/' + tripID + '/setdestination', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            type: DistrictActions.DISTRICT_SET_SUCCESS,
            districtID,
          });
          dispatch({
            type: modalAction.BACKDROP_HIDE
          });
          window.location.reload(false);
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({
            type: DistrictActions.DISTRICT_SET_FAILED,
          });
          dispatch({
            type: modalAction.BACKDROP_HIDE
          });
          dispatch(ModalActions.addError(error));
        });
      }
    }).catch(() => {
      dispatch({
        type: DistrictActions.DISTRICT_SET_FAILED,
      });
      dispatch({
        type: modalAction.BACKDROP_HIDE
      });
      dispatch(ModalActions.addError('Network error while setting district '));
    });
  }
}

export default districtSet;
