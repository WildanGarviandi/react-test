import { createSelector } from 'reselect';

const getState = (state) => {
  const { tripDetails } = state.app;

  return tripDetails;
};

export default createSelector(
  [getState],
  (tripDetails) => {
    const { isChangingRemarks, isTripEditing } = tripDetails;

    return { isChangingRemarks, isTripEditing };
  },
);
