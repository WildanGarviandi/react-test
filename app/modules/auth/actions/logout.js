import {push} from 'react-router-redux';
import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';

export default () => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;
    dispatch({ type: actionTypes.LOGOUT_START });
    fetchPost('/sign-out', token).then((response) => {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ type: actionTypes.LOGOUT_SUCCESS});
          dispatch(push('/login'));
        });
      } 
    }).catch(() => {
        dispatch({ type: actionTypes.LOGOUT_FAILED, message: 'Cannot connect to server' });
    });
  }
}
