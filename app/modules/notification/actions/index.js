import {notifAction} from '../constants';

function addNotification (message, level, position) {
  return {
    type: notifAction.ADD_NOTIFICATION,
    message,
    level,
    position
  };
}

export default {
  addNotification
};