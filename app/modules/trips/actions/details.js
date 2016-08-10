import lodash from 'lodash';
import Constants from '../constants';
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
          console.log('data', data);
          dispatch({
            type: Constants.TRIP_DETAILS_SET,
            trip: data,
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
