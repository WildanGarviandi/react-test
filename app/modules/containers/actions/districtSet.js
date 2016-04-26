import {DistrictActions} from '../constants';
import ModalActions from '../../modals/actions';
import fetch from '../../fetch/post';

function districtSet(containerID, districtID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const params = {
      districtID,
    };

    dispatch({
      type: DistrictActions.DISTRICT_SET_START,
      ContainerID: containerID,
      districtID,
    });

    fetch('/container/' + containerID + '/district', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({ 
            type: DistrictActions.DISTRICT_SET_SUCCESS,
            ContainerID: containerID,
            district: response,
          });
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({ 
            type: DistrictActions.DISTRICT_SET_FAILED,
            ContainerID: containerID,
          });
          dispatch(ModalActions.addError(error));
        });
      }
    }).catch(() => {
      dispatch({
        type: DistrictActions.DISTRICT_SET_FAILED,
        ContainerID: containerID,
      });
      dispatch(ModalActions.addError('Network error while setting district ' + districtID + ' for container ' + containerID));
    });
  }
}

export default districtSet;
