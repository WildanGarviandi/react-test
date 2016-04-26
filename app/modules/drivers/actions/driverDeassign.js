import * as actionTypes from '../constants';
import fetchDelete from '../../fetch/delete';
import fetchContainerDetails from '../../containers/actions/containerDetailsFetch';
import ModalsActions from '../../modals/actions';

export default (containerID) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: actionTypes.DRIVER_DEASSIGN_START, containerID: containerID});
    fetchDelete('/container/' + containerID + '/driver', token).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            type: actionTypes.DRIVER_DEASSIGN_SUCCESS,
          });
          dispatch(fetchContainerDetails(containerID));
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({ type: actionTypes.DRIVER_DEASSIGN_FAILED });
          dispatch(ModalsActions.addError(error));
        });
      }
    }).catch(() => {
        dispatch({ type: actionTypes.DRIVER_DEASSIGN_FAILED });      
        dispatch(ModalsActions.addError('Network error while cancelling assignment'));
    });
  }
}
