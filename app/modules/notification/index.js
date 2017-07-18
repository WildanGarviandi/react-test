const ADD_NOTIFICATION = 'components/notification/ADD_NOTIFICATION';
const REMOVE_NOTIFICATION = 'components/notification/REMOVE_NOTIFICATION';

const initialState = {
  message: '',
  level: null,
  position: null,
  style: null,
  timeout: null,
  withSound: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return Object.assign({}, state, {
        message: action.payload.message,
        level: action.payload.level,
        position: action.payload.position,
        style: action.payload.style,
        timeout: action.payload.timeout,
        withSound: action.payload.withSound,
      });
    case REMOVE_NOTIFICATION:
      return Object.assign({}, initialState);
    default:
      return state;
  }
}

export const addNotification = (message, level, position, style, timeout, withSound) => {
  const dispatchData = {
    type: ADD_NOTIFICATION,
    payload: {
      message,
      level,
      position,
      style,
      timeout,
      withSound,
    },
  };
  return dispatchData;
};

export const removeNotification = () => {
  const dispatchData = {
    type: REMOVE_NOTIFICATION,
  };
  return dispatchData;
};
