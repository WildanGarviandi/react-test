import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import {modalAction} from '../../modals/constants';

export default (store) => {
  const {token} = store.getState().app.userLogged;

  store.dispatch({type: actionTypes.CHECK_AUTH, token: token});
  store.dispatch({type: modalAction.BACKDROP_SHOW});
  return fetchPost('/is-authenticated', token).then((response) => {
    if(response.ok) {
      return response.json().then((response) => {
        store.dispatch({type: actionTypes.AUTH_VALID, hub: response.data.hub, user: response.data.user});
        store.dispatch({type: modalAction.BACKDROP_HIDE});
        return { ok: true, data: response.data };
      });
    } else {
      store.dispatch({type: actionTypes.AUTH_INVALID});
      store.dispatch({type: modalAction.BACKDROP_HIDE});
      return { ok: false }
    }
  });
}
