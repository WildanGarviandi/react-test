import { createSelector } from 'reselect';

const getState = state => {
  const data = state.app.driversStore;
  return data;
};

export default createSelector([getState], state => {
  const { driversLocation } = state.fleetDrivers;
  return { driversLocation };
});
