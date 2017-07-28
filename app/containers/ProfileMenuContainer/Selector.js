import { createSelector } from 'reselect';

const getState = (state) => {
  const data = state.app.userLogged;
  return data;
};

export default createSelector(
  [getState],
  (userLogged) => {
    const { token, hubs, hubID } = userLogged;
    return { token, hubs, hubID };
  },
);
