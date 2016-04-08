import {push} from 'react-router-redux';
import * as actionTypes from '../constants';
import fetch from '../../fetch/post';

export default (username, password) => {
  return (dispatch) => {
    const body = { username: username, password: password };

    dispatch({ type: actionTypes.LOGIN_START });
    fetch('/sign-in', '', body).then((response) => {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ type: actionTypes.LOGIN_SUCCESS, user: response.data.SignIn });
          dispatch(push('/container'));
        });
      } else {
        dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Bad login information' });
      }
    }).catch(() => {
        dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Cannot connect to server' });
    });
  }
}
