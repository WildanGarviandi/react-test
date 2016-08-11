import lodash from 'lodash';
import Constants from '../constants';
import Hubs from '../../hubs/constants';
import fetchGet from '../../fetch/get';
import fetchPost from '../../fetch/post';
import ModalActions from '../../modals/actions';

export const fetchDetails = (id) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: Constants.TRIP_DETAILS_FETCH_START });
    fetchGet('/trip/' + id, token).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {

          var orders = _.map(data.UserOrderRoutes, (route) => {
            return _.assign({}, route.UserOrder, {
              Status: route.OrderStatus.OrderStatus,
              DeliveryFee: route.DeliveryFee,
            });
          });

          dispatch({
            type: Constants.TRIP_DETAILS_SET,
            trip: data,
          });
          dispatch({
            type: "CONTAINER_DETAILS_FETCH_SUCCESS",
            ContainerID: data.ContainerNumber,
            container: {CurrentTrip: data},
            orders: orders,
            trip: data,
            fillAble: data.OrderStatus === 1 || data.OrderStatus === 9,
            reusable: false
          });
          dispatch({ type: Constants.TRIP_DETAILS_FETCH_END });
        });
      } else {
        dispatch({ type: Constants.TRIP_DETAILS_FETCH_END });
        dispatch(ModalActions.addMessage('Failed to fetch order details'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.TRIP_DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}
