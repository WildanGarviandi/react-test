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
    const userID = getState().app.userLogged.user.userID || null;
    dispatch({
      type: API_ERROR,
      error: true,
      payload: {
        url,
        method,
        userID,
        body,
      },
    });
  };

  return dispatchData;
};

export { sendErrorReport };
