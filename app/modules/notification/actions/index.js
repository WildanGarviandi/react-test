import {notifAction} from '../constants';

function addNotification (message, level, position, style) {
  return {
    type: notifAction.ADD_NOTIFICATION,
    message,
    level,
    position,
    style
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