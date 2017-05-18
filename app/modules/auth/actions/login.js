import { push } from 'react-router-redux'; //eslint-disable-line

import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';

export default function (username, password) {
  return (dispatch) => {
    const body = { username, password };

    dispatch({ type: actionTypes.LOGIN_START });
    fetchPost('/sign-in', '', body).then((response) => {
      if (response.ok) {
        response.json().then((responseJson) => {
          dispatch({ type: actionTypes.LOGIN_SUCCESS, user: responseJson.data.SignIn });
          dispatch(push('/orders/pickup'));
        });
      } else {
        dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Bad login information' });
      }
    }).catch(() => {
      dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Cannot connect to server' });
    });
  };
}
