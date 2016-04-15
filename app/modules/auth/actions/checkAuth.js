import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';

export default (store) => {
  const {token} = store.getState().app.userLogged;

  store.dispatch({type: actionTypes.CHECK_AUTH, token: token});
  return fetchPost('/is-authenticated', token).then((response) => {
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
