import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import fetchGet from '../../fetch/get';
import {modalAction} from '../../modals/constants';
import ModalActions from '../../modals/actions';

export default (store) => {
  const {token} = store.getState().app.userLogged;

  store.dispatch({type: actionTypes.CHECK_AUTH, token: token});
  return fetchPost('/is-authenticated', token).then((response) => {
    if(response.ok) {
      return fetchGet('/features', token, {}, true).then((featuresResponse) => {
        if (featuresResponse.ok) {
          return featuresResponse.json().then((featuresResponse) => {
            return response.json().then((response) => {
              store.dispatch({
                type: actionTypes.AUTH_VALID, 
                hub: response.data.hub, 
                user: response.data.user,
                order: featuresResponse.data.order
              });
              return { ok: true, data: response.data };
            });
          });
        } else {
          store.dispatch({type: actionTypes.AUTH_INVALID});
          return { ok: false };
        }
      });
    } else {
      store.dispatch({type: actionTypes.AUTH_INVALID});
      return { ok: false };
    }
  });
}
