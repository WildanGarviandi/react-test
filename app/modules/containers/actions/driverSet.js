import * as actionTypes from '../constants';
import {DriversActions} from '../constants';
import fetchPost from '../../fetch/post';
import fetchContainerDetails from '../../containers/actions/containerDetailsFetch';
import {ModalActions} from '../..';
import {fetchDetails} from '../../trips/actions/details';

export default (tripID, driverID) => {
  return (dispatch, getState) => {
    const {containers, userLogged, tripDetails} = getState().app;
    const {token} = userLogged;
    const params = {
      DriverID: driverID,
    }

    dispatch({
      type: DriversActions.DRIVERS_PICK_START,
      driverID,
    });

    dispatch({
      type: "PICKDRIVERSTART",
    });

    fetchPost('/trip/' + tripID + '/driver', token, params).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({
            type: DriversActions.DRIVERS_PICK_SUCCESS, 
            trip: response,
          });

          const orders = _.map(tripDetails.trip.UserOrderRoutes, (route) => {
            return _.assign({}, route.UserOrder, {
              Status: route.OrderStatus.OrderStatus,
            });
          });

          dispatch({
            type: actionTypes.CONTAINER_DETAILS_FETCH_SUCCESS,
            container: response,
            trip: response.CurrentTrip,
            orders: orders,
            fillAble: false,
            reusable: false,
          });

          dispatch({
            type: "PICKDRIVEREND",
          });
          dispatch(fetchDetails(tripID));
        });
      } else {
        response.json().then(function(response) {
          const error = (response && response.error && response.error.message);
          dispatch({
            type: DriversActions.DRIVERS_PICK_FAILED,
          });
          dispatch({
            type: "PICKDRIVEREND",
          });
          dispatch(ModalActions.addError(error));
        });
      }
    }).catch(() => {
        dispatch({
          type: DriversActions.DRIVERS_PICK_FAILED,
        });
        dispatch({
          type: "PICKDRIVEREND",
        });
        dispatch(ModalActions.addError(`Network error while setting driver ${driverID} for container ${containerID}`));
    });
  }
}
