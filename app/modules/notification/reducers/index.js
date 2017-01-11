import {notifAction} from '../constants';

function reducer (state = {}, action) {
  switch (action.type) {
    case notifAction.ADD_NOTIFICATION:
      return Object.assign({}, state, {
        message: action.message,
        level: action.level,
        position: action.position,
        timeout: action.timeout,
        withSound: action.withSound
      });
    case notifAction.REMOVE_NOTIFICATION:
      return Object.assign({}, state, {
        message: ''
      });
    default:
      return state;
  }
}

export default reducer;