import * as actionTypes from '../constants';
import {DriversActions} from '../constants';
import fetchPost from '../../fetch/post';
import fetchContainerDetails from '../../containers/actions/containerDetailsFetch';
import {ModalActions} from '../..';

export default (containerID, driverID) => {
  return (dispatch, getState) => {
    const {containers, userLogged} = getState().app;
    const {token} = userLogged;
    const params = {
      driverID,
    }

    const container = containers.containers[containerID];
    if(!(container && container.CurrentTrip && container.CurrentTrip.District)) {
      dispatch(ModalActions.addError('Select district first'));
      return;
    }

    dispatch({
      type: DriversActions.DRIVERS_PICK_START,
      ContainerID: containerID, driverID,
    });

    fetchPost('/container/' + containerID + '/driver', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            type: DriversActions.DRIVERS_PICK_SUCCESS, 
            ContainerID: containerID,
            trip: response,
          });

          const orders = _.map(response.CurrentTrip.UserOrderRoutes, (route) => {
            return _.assign({}, route.UserOrder, {
              Status: route.OrderStatus.OrderStatus,
            });
          });

          dispatch({
            type: actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS,
            ContainerID: containerID,
            container: response,
            trip: response.CurrentTrip,
            orders: orders,
            fillAble: false,
            reusable: false,
          })
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({
            type: DriversActions.DRIVERS_PICK_FAILED,
            ContainerID: containerID,
          });
          dispatch(ModalActions.addError(error));
        });
      }
    }).catch(() => {
        dispatch({
          type: DriversActions.DRIVERS_PICK_FAILED,
          ContainerID: containerID,
        });
        dispatch(ModalActions.addError(`Network error while setting driver ${driverID} for container ${containerID}`));
    });
  }
}
