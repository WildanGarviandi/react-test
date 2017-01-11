import {notifAction} from '../constants';

function addNotification (message, level, position, timeout, withSound) {
  return {
    type: notifAction.ADD_NOTIFICATION,
    message,
    level,
    position,
    timeout,
    withSound
  };
}

function removeNotification () {
  return {
    type: notifAction.REMOVE_NOTIFICATION
  };
}

export default {
  addNotification,
  removeNotification
};