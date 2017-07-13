import { createSelector } from 'reselect'; //eslint-disable-line

const getState = (state) => {
  const data = state.app.userLogged;
  return data;
};

export default createSelector(
  [getState],
  (userLogged) => {
    const { token } = userLogged;

    return { token };
  },
);
