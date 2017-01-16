import {notifAction} from '../constants';

function addNotification (message, level, position, style, timeout, withSound) {
  return {
    type: notifAction.ADD_NOTIFICATION,
    message,
    level,
    position,
    style,
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