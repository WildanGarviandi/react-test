import * as _ from 'lodash';

import configValues from '../../config/configValues.json';
import { modalAction } from '../modals/constants';
import FetchGet from '../fetch/get';
import { formatRef } from '../../helper/utility';
import endpoints from '../../config/endpoints';
import { addNotification } from '../notification';

const RESET_WORKING_TIME = 'driverWorkingTime/reset';
const SELECT_WORKING_DAY = 'driverWorkingTime/select';
const FETCH_WORKING_TIME = 'driverWorkingTime/fetch';

const initialState = {
  DayOfWeek: [
    configValues.DAY_OF_WEEK.MONDAY,
    configValues.DAY_OF_WEEK.TUESDAY,
    configValues.DAY_OF_WEEK.WEDNESDAY,
    configValues.DAY_OF_WEEK.THURSDAY,
    configValues.DAY_OF_WEEK.FRIDAY,
    configValues.DAY_OF_WEEK.SATURDAY,
    configValues.DAY_OF_WEEK.SUNDAY
  ],
  workingTime: [
    {
      DayOfWeek: configValues.DAY_OF_WEEK.MONDAY.value,
      WorkingHour: []
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.TUESDAY.value,
      WorkingHour: []
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.WEDNESDAY.value,
      WorkingHour: []
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.THURSDAY.value,
      WorkingHour: []
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.FRIDAY.value,
      WorkingHour: []
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.SATURDAY.value,
      WorkingHour: []
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.SUNDAY.value,
      WorkingHour: []
    }
  ],
  selectedDay: {}
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case RESET_WORKING_TIME:
      return Object.assign({}, initialState);
    case FETCH_WORKING_TIME: {
      const newWorkingTime = _.cloneDeep(state.workingTime);
      action.payload.data.forEach((data, index) => {
        newWorkingTime[
          index
        ].WorkingHour = _.map(data.WorkingHour, workingHour => {
          const momentDateStart = new Date(workingHour.StartTime);
          const momentDateEnd = new Date(workingHour.EndTime);
          return {
            StartTime: {
              hour: parseInt(momentDateStart.getUTCHours(), 10),
              minute: parseInt(momentDateStart.getUTCMinutes(), 10)
            },
            EndTime: {
              hour: parseInt(momentDateEnd.getUTCHours(), 10),
              minute: parseInt(momentDateEnd.getUTCMinutes(), 10)
            }
          };
        });
      });
      
      return Object.assign({}, state, {
        workingTime: newWorkingTime
      });
    }
    case SELECT_WORKING_DAY: {
      const { selectedDay } = action.payload;
      let newWorkingTime = _.cloneDeep(state.workingTime);
      newWorkingTime = _.map(newWorkingTime, time => {
        const isEqual = _.isEqual(time.DayOfWeek, selectedDay.value);

        if (isEqual) {
          const newTime = _.cloneDeep(time);
          newTime.WorkingHour = _.isEmpty(newTime.WorkingHour)
            ? [
                {
                  StartTime: {
                    hour: 0,
                    minute: 0
                  },
                  EndTime: {
                    hour: 1,
                    minute: 0
                  }
                }
              ]
            : newTime.WorkingHour;
          return newTime;
        }

        return time;
      });

      return Object.assign({}, state, {
        selectedDay,
        workingTime: newWorkingTime
      });
    }
    default:
      return state;
  }
}

export function resetWorkingTime() {
  return {
    type: RESET_WORKING_TIME
  };
}

export function selectWorkingDay(selectedDay) {
  return {
    type: SELECT_WORKING_DAY,
    payload: {
      selectedDay
    }
  };
}

const handleErrorResponse = async response => {
  const errorValue = response.json().then(({ error }) => {
    throw error;
  });
  return errorValue;
};

export function fetchWorkingTime() {
  const dispatchFunc = async (dispatch, getState) => {
    const { myDrivers, userLogged } = getState().app;
    const { token } = userLogged;
    const { UserID } = myDrivers.driver;

    dispatch({ type: modalAction.BACKDROP_SHOW });

    try {
      const response = await FetchGet(
        `/${formatRef(endpoints.DRIVER, UserID, endpoints.WORKING_HOUR)}`,
        token,
        {}
      );
      if (response.ok) {
        const responseJson = await response.json();
        const { data } = responseJson;
        dispatch({
          type: FETCH_WORKING_TIME,
          payload: {
            data
          }
        });
      } else {
        await handleErrorResponse(response);
      }
    } catch (e) {
      const message = e && e.message ? e.message : 'Failed to fetch data';
      dispatch({
        type: RESET_WORKING_TIME
      });

      dispatch(addNotification(message, 'error', null, null, 5, true));
    } finally {
      dispatch({ type: modalAction.BACKDROP_HIDE });
    }
  };

  return dispatchFunc;
}
