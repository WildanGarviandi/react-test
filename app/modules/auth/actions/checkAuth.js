import * as actionTypes from '../constants';
import fetch from '../../fetch/post';

export default (store) => {
  const {token} = store.getState().app.userLogged;

  store.dispatch({type: actionTypes.CHECK_AUTH, token: token});
  return fetch('/is-authenticated', token).then((response) => {
    if(response.ok) {
      return response.json().then((response) => {
        store.dispatch({type: actionTypes.AUTH_VALID, hub: response.data.hub});
        return { ok: true, data: response.data };
      });
    } else {
      store.dispatch({type: actionTypes.AUTH_INVALID});
      return { ok: false }
    }
  });
}
