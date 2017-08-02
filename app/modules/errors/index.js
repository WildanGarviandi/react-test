const API_ERROR = 'errors/API_ERROR';

export default function reducer(state = {}, action = {}) {
  switch (action.type) {
    case API_ERROR:
      throw new Error();
    default:
      return state;
  }
}

const sendErrorReport = (url = '', method = '', body = {}) => {
  const dispatchData = (dispatch, getState) => {
    const { user } = getState().app.userLogged;
    const userGuID = user.UserGuID || null;
    const userEmail = user.Email || null;
    dispatch({
      type: API_ERROR,
      error: true,
      payload: {
        url,
        method,
        userGuID,
        userEmail,
        body,
      },
    });
  };

  return dispatchData;
};

export { sendErrorReport };
