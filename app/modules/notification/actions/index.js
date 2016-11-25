import {notifAction} from '../constants';

function addNotification (message, level, position) {
  return {
    type: notifAction.ADD_NOTIFICATION,
    message,
    level,
    position
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