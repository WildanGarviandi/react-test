import { push } from 'react-router-redux';

import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import endpoints from '../../../config/endpoints';
import { modalAction } from '../../modals/constants';

export default (hub) => {
  const dispatchFunc = (dispatch, getState) => {
    const { hubId } = hub;
    const body = { hubId };
    const { token, userID } = getState().app.userLogged;

    dispatch({ type: modalAction.BACKDROP_SHOW });
    fetchPost(endpoints.UPDATE_HUB, token, body).then((response) => {
      if (response.ok) {
        return response.json().then((responseJson) => {
          localStorage.token = token;
          localStorage.userID = userID;
        });
      }

      return dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Bad login information' });
    }).catch(() => {
      dispatch({ type: actionTypes.LOGIN_FAILED, message: 'Cannot connect to server' });
    });
  };

  return dispatchFunc;
};
