import { createSelector } from 'reselect';

const getState = (state) => {
  const data = state.app.userLogged;
  return data;
};

export default createSelector(
  [getState],
  (userLogged) => {
    const { isFetching, isValid, message, token } = userLogged;

    return {
      loginState: {
        isFetching,
        isError: (!isFetching && !isValid),
        message,
      },
      token,
    };
  },
);
