import {notifAction} from '../constants';

function reducer (state = {}, action) {
  switch (action.type) {
    case notifAction.ADD_NOTIFICATION:
      return Object.assign({}, state, {
        message: action.message,
        level: action.level,
        position: action.position
      });
    default:
      return state;
  }
}

export default reducer;