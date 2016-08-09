import {push} from 'react-router-redux';
import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';

export default (username, password) => {
  return (dispatch) => {
    const body = { username: username, password: password };

    dispatch({ type: actionTypes.LOGIN_START });
    fetchPost('/sign-in', '', body).then((response) => {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ type: actionTypes.LOGIN_SUCCESS, user: response.data.SignIn });
          dispatch(push('/pickupOrders'));
        });
      } else {
        dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Bad login information' });
      }
    }).catch(() => {
        dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Cannot connect to server' });
    });
  }
}
