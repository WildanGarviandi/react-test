import * as actionTypes from '../constants';
import fetch from '../../fetch/get';

export const setLimit = (limit) => {
  return (dispatch) => {
    dispatch({type: actionTypes.CONTAINERS_SET_LIMIT, limit: limit});
    dispatch({type: actionTypes.CONTAINERS_SET_CURRENTPAGE, currentPage: 1});
    dispatch(fetchContainers());
  };
};

export const setCurrentPage = (currentPage) => {
  return (dispatch) => {
    dispatch({type: actionTypes.CONTAINERS_SET_CURRENTPAGE, currentPage: currentPage});
    dispatch(fetchContainers());
  };
};

export const setStatus = (status) => {
  return (dispatch) => {
    dispatch({type: actionTypes.CONTAINERS_SET_STATUS, status: status});
    dispatch({type: actionTypes.CONTAINERS_SET_CURRENTPAGE, currentPage: 1});
    dispatch(fetchContainers());
  };
};

const ProcessContainerWithTrip = (containersWithTrip) => {
  return _.map(containersWithTrip, (containerWithTrip) => {
    return _.assign({}, containerWithTrip.container, {trip: containerWithTrip.trip});
  });
}

export const fetchContainers = () => {
  return (dispatch, getState) => {
    const {userLogged, containers} = getState().app;
    const {token, hubID} = userLogged;
    const {currentPage, limit, status} = containers;

    const query = {
      hubID: hubID,
      limit: limit,
      offset: (currentPage-1)*limit,
      statusID: status
    }

    dispatch({ type: actionTypes.CONTAINERS_FETCH_START, currentPage: currentPage, limit: limit });
    fetch('/container/', token, query).then(function(response) {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ type: actionTypes.CONTAINERS_FETCH_SUCCESS, total: response.count, containers: ProcessContainerWithTrip(response.rows), groups: response.groups });
        });
      } else {
        dispatch({ type: actionTypes.CONTAINERS_FETCH_FAILED });        
      }
    });
  }
}
