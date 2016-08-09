import Constants from '../constants';
import fetchGet from '../../fetch/get';
import {OrderParser} from '../selector';
import ModalActions from '../../modals/actions';

export const fetchDetails = (id) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: Constants.DETAILS_FETCH_START });
    fetchGet('/order/' + id, token).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {
          console.log('data', data);
          dispatch({
            type: Constants.DETAILS_SET,
            order: OrderParser(data),
          });
          dispatch({ type: Constants.DETAILS_FETCH_END });
        });
      } else {
        dispatch({ type: Constants.DETAILS_FETCH_END });
        dispatch(ModalActions.addMessage('Failed to fetch order details'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}
