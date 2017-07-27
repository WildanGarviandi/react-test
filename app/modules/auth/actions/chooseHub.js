import { push } from 'react-router-redux';

import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import endpoints from '../../../config/endpoints';
import { modalAction } from '../../modals/constants';

export default (hubID, isReload) => {
  const dispatchFunc = (dispatch, getState) => {
    const body = { hubID };
    const { token, userID, hubs } = getState().app.userLogged;

    dispatch({ type: modalAction.BACKDROP_SHOW });
    dispatch({ type: actionTypes.CHOOSE_HUB_START });
    fetchPost(endpoints.UPDATE_HUB, token, body).then((response) => {
      if (response.ok) {
        return response.json().then(() => {
          dispatch({ type: modalAction.BACKDROP_HIDE });
          dispatch({
            type: actionTypes.CHOOSE_HUB_SUCCESS,
            payload: {
              token,
              userID,
              hubs,
            },
          });
          if (isReload) {
            return window.location.reload();
          }
          return dispatch(push('/orders/pickup'));
        });
      }

      dispatch({ type: modalAction.BACKDROP_HIDE });
      return dispatch({ type: actionTypes.CHOOSE_HUB_FAILED, message: 'Failed to choose hub' });
    }).catch(() => {
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch({ type: actionTypes.CHOOSE_HUB_FAILED, message: 'Cannot connect to server' });
    });
  };

  return dispatchFunc;
};
