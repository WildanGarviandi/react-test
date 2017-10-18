import * as _ from 'lodash';

import configValues from '../../config/configValues.json';
import { modalAction } from '../modals/constants';
import ModalService from '../modals/actions';
import FetchGet from '../fetch/get';
import FetchPost from '../fetch/post';
import { formatRef, getTimeFormat } from '../../helper/utility';
import endpoints from '../../config/endpoints';
import { addNotification } from '../notification';

const RESET_WORKING_TIME = 'driverWorkingTime/reset';
const SELECT_WORKING_DAY = 'driverWorkingTime/select';
const FETCH_WORKING_TIME = 'driverWorkingTime/fetch';
const SAVE_WORKING_TIME = 'driverWorkingTime/save';
const ADD_WORKING_HOUR = 'driverWorkingTime/hour/add';
const SET_WORKING_HOUR = 'driverWorkingTime/hour/set';
const DELETE_WORKING_HOUR = 'driverWorkingTime/hour/delete';

const initialState = {
  DayOfWeek: [
    configValues.DAY_OF_WEEK.MONDAY,
    configValues.DAY_OF_WEEK.TUESDAY,
    configValues.DAY_OF_WEEK.WEDNESDAY,
    configValues.DAY_OF_WEEK.THURSDAY,
    configValues.DAY_OF_WEEK.FRIDAY,
    configValues.DAY_OF_WEEK.SATURDAY,
    configValues.DAY_OF_WEEK.SUNDAY,
  ],
  workingTime: [
    {
      DayOfWeek: configValues.DAY_OF_WEEK.SUNDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.MONDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.TUESDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.WEDNESDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.THURSDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.FRIDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.SATURDAY.value,
      WorkingHour: [],
    },
  ],
  checkWorkingTime: [
    {
      DayOfWeek: configValues.DAY_OF_WEEK.SUNDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.MONDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.TUESDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.WEDNESDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.THURSDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.FRIDAY.value,
      WorkingHour: [],
    },
    {
      DayOfWeek: configValues.DAY_OF_WEEK.SATURDAY.value,
      WorkingHour: [],
    },
  ],
  selectedDay: {},
  isError: false,
};

const isValidInterval = newTime => {
  const sortedWorkingHours = _.sortBy(newTime.WorkingHour, workingHour => {
    const sortCriteria = workingHour.StartTime.hour;
    return sortCriteria;
  });

  let isValid = true;

  for (
    let indexHour = 0;
    indexHour < sortedWorkingHours.length && isValid;
    indexHour += 1
  ) {
    isValid =
      isValid &&
      sortedWorkingHours[indexHour].StartTime.hour <
        sortedWorkingHours[indexHour].EndTime.hour;
    if (indexHour > 0) {
      isValid =
        isValid &&
        sortedWorkingHours[indexHour - 1].EndTime.hour <
          sortedWorkingHours[indexHour].StartTime.hour;
    }
  }

  return isValid;
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case RESET_WORKING_TIME:
      return Object.assign({}, initialState);
    case FETCH_WORKING_TIME: {
      const newWorkingTime = _.cloneDeep(state.workingTime);
      action.payload.data.forEach(data => {
        newWorkingTime[
          parseInt(data.DayOfWeek, 10) - 1
        ].WorkingHour = _.map(data.WorkingHour, workingHour => {
          const momentDateStart = new Date(workingHour.StartTime);
          const momentDateEnd = new Date(workingHour.EndTime);
          return {
            key: _.uniqueId(),
            StartTime: {
              hour: parseInt(momentDateStart.getUTCHours(), 10),
              minute: parseInt(momentDateStart.getUTCMinutes(), 10),
            },
            EndTime: {
              hour: parseInt(momentDateEnd.getUTCHours(), 10),
              minute: parseInt(momentDateEnd.getUTCMinutes(), 10),
            },
          };
        });
      });

      return Object.assign({}, state, {
        workingTime: newWorkingTime,
        checkWorkingTime: newWorkingTime,
      });
    }
    case SELECT_WORKING_DAY: {
      const { selectedDay } = action.payload;

      return Object.assign({}, state, {
        selectedDay,
      });
    }
    case ADD_WORKING_HOUR: {
      let newWorkingTime = _.cloneDeep(state.workingTime);
      newWorkingTime = _.map(newWorkingTime, time => {
        const isEqual = _.isEqual(time.DayOfWeek, state.selectedDay.value);

        if (isEqual) {
          const newTime = _.cloneDeep(time);
          const lastWorkingHour = _.last(newTime.WorkingHour);
          newTime.WorkingHour.push({
            key: _.uniqueId(),
            StartTime: (lastWorkingHour && lastWorkingHour.EndTime) || {
              hour: 0,
              minute: 0,
            },
            EndTime: (lastWorkingHour && lastWorkingHour.EndTime) || {
              hour: 0,
              minute: 0,
            },
          });

          return newTime;
        }

        return time;
      });

      return Object.assign({}, state, {
        workingTime: newWorkingTime,
      });
    }
    case SET_WORKING_HOUR: {
      const { dateFrom, dateTo, key } = action.payload;

      let newTime = {};
      let newWorkingTime = _.cloneDeep(state.workingTime);
      newWorkingTime = _.map(newWorkingTime, time => {
        const isEqual = _.isEqual(time.DayOfWeek, state.selectedDay.value);

        if (isEqual) {
          newTime = _.cloneDeep(time);
          const index = _.findIndex(newTime.WorkingHour, ['key', key]);
          const dateFromArr = dateFrom.split(':');
          const dateToArr = dateTo.split(':');
          newTime.WorkingHour[index] = {
            key: newTime.WorkingHour[index].key,
            StartTime: {
              hour: parseInt(dateFromArr[0], 10),
              minute: parseInt(dateFromArr[1], 10),
            },
            EndTime: {
              hour: parseInt(dateToArr[0], 10),
              minute: parseInt(dateToArr[1], 10),
            },
          };

          return newTime;
        }

        return time;
      });

      return Object.assign({}, state, {
        workingTime: newWorkingTime,
        isError: !isValidInterval(newTime),
      });
    }
    case DELETE_WORKING_HOUR: {
      const { key } = action.payload;

      let newTime = {};
      let newWorkingTime = _.cloneDeep(state.workingTime);
      newWorkingTime = _.map(newWorkingTime, time => {
        const isEqual = _.isEqual(time.DayOfWeek, state.selectedDay.value);

        if (isEqual) {
          newTime = _.cloneDeep(time);
          const index = _.findIndex(newTime.WorkingHour, ['key', key]);
          newTime.WorkingHour.splice(index, 1);
          return newTime;
        }

        return time;
      });

      return Object.assign({}, state, {
        workingTime: newWorkingTime,
        isError: !isValidInterval(newTime),
      });
    }
    case SAVE_WORKING_TIME:
      return Object.assign({}, state);
    default:
      return state;
  }
}

export function resetWorkingTime() {
  return {
    type: RESET_WORKING_TIME,
  };
}

export function selectWorkingDay(selectedDay) {
  return {
    type: SELECT_WORKING_DAY,
    payload: {
      selectedDay,
    },
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
      dispatch({ type: modalAction.BACKDROP_SHOW });

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
            data,
          },
        });
      } else {
        await handleErrorResponse(response);
      }
    } catch (e) {
      const message = e && e.message ? e.message : 'Failed to fetch data';
      dispatch({
        type: RESET_WORKING_TIME,
      });

      dispatch(addNotification(message, 'error', null, null, 5, true));
    } finally {
      dispatch({ type: modalAction.BACKDROP_HIDE });
    }
  };

  return dispatchFunc;
}

export function addWorkingHour() {
  return {
    type: ADD_WORKING_HOUR,
  };
}

export function setWorkingHour(dateFrom, dateTo, key) {
  return {
    type: SET_WORKING_HOUR,
    payload: {
      dateFrom,
      dateTo,
      key,
    },
  };
}

export function deleteWorkingHour(key) {
  return {
    type: DELETE_WORKING_HOUR,
    payload: {
      key,
    },
  };
}

export function saveWorkingTime() {
  const dispatchFunc = async (dispatch, getState) => {
    const { driverWorkingTime, userLogged, myDrivers } = getState().app;
    const { token } = userLogged;
    const { UserID } = myDrivers.driver;
    const { workingTime, checkWorkingTime } = driverWorkingTime;

    const query = [];

    workingTime.forEach((time, index) => {
      if (!_.isEqual(time.WorkingHour, checkWorkingTime[index].WorkingHour)) {
        const newTime = _.cloneDeep(time);
        newTime.DayOfWeek =
          configValues.DAY_OF_WEEK[newTime.DayOfWeek.toUpperCase()].key;
        newTime.WorkingHour = _.map(newTime.WorkingHour, workingHour => {
          const formattedData = {
            StartTime: `1970-01-01T${getTimeFormat(
              workingHour.StartTime.hour,
              workingHour.StartTime.minute
            )}:00.000Z`,
            EndTime: `1970-01-01T${getTimeFormat(
              workingHour.EndTime.hour,
              workingHour.EndTime.minute
            )}:00.000Z`,
          };

          return formattedData;
        });

        query.push(newTime);
      }
    });

    dispatch({ type: modalAction.BACKDROP_SHOW });

    try {
      const response = await FetchPost(
        `/${formatRef(endpoints.DRIVER, UserID, endpoints.WORKING_HOUR)}`,
        token,
        {
          WorkingHours: query,
        }
      );
      if (response.ok) {
        const responseJson = await response.json();
        const { data } = responseJson;
        let messageShow = '';
        data.forEach(messageData => {
          messageShow += `${messageData.result}\n`;
        });
        dispatch(ModalService.addMessage(messageShow));
      } else {
        await handleErrorResponse(response);
      }
    } catch (e) {
      const message =
        e && e.message ? e.message : 'Failed to submit driver working hours';

      dispatch(addNotification(message, 'error', null, null, 5, true));
    } finally {
      dispatch({ type: modalAction.BACKDROP_HIDE });
    }
  };

  return dispatchFunc;
}
