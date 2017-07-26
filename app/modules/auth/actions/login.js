import { push } from 'react-router-redux';

import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import endpoints from '../../../config/endpoints';

const login = (username, password) => {
  const dispatchFunc = (dispatch) => {
    const body = { username, password };

    dispatch({ type: actionTypes.LOGIN_START });
    fetchPost(endpoints.LOGIN, '', body).then((response) => {
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

  return dispatchFunc;
};

const loginGoogle = (token) => {
  const dispatchFunc = (dispatch) => {
    const body = { token };

    dispatch({ type: actionTypes.LOGIN_GOOGLE_START });
    fetchPost(endpoints.LOGIN_GOOGLE, '', body).then((response) => {
      if (response.ok) {
        response.json().then((responseJson) => {
          dispatch({
            type: actionTypes.LOGIN_GOOGLE_SUCCESS,
            payload: {
              hubs: responseJson.data.Hubs,
              signIn: responseJson.data.SignIn,
            },
          });
        });
      } else {
        dispatch({ type: actionTypes.LOGIN_GOOGLE_FAILED, error: 'Bad login information' });
      }
    }).catch(() => {
      dispatch({ type: actionTypes.LOGIN_GOOGLE_FAILED, error: 'Cannot connect to server' });
    });
  };

  return dispatchFunc;
};

const loginError = ({ message }) => {
  const dispatchData = {
    type: actionTypes.LOGIN_GOOGLE_FAILED,
    error: message,
  };

  return dispatchData;
};

export { login, loginGoogle, loginError };
