import * as actionTypes from '../constants';
import fetchPost from '../../fetch/post';
import fetchGet from '../../fetch/get';

export default (store) => {
  const { token } = store.getState().app.userLogged;

  store.dispatch({ type: actionTypes.CHECK_AUTH, token });
  return fetchPost('/is-authenticated', token).then((response) => {
    if (response.ok) {
      return fetchGet('/features', token, {}, true).then((featuresResponse) => {
        if (featuresResponse.ok) {
          return featuresResponse.json().then((featuresResponseJson) => {
            const result = response.json().then((responseJson) => {
              store.dispatch({
                type: actionTypes.AUTH_VALID,
                hub: responseJson.data.hub,
                user: responseJson.data.user,
                order: featuresResponseJson.data.order,
              });
              return { ok: true, data: response.data };
            });

            return result;
          });
        }
        store.dispatch({ type: actionTypes.AUTH_INVALID });
        return { ok: false };
      });
    }
    store.dispatch({ type: actionTypes.AUTH_INVALID });
    return { ok: false };
  });
};
