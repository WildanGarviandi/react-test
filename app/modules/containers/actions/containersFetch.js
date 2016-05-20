import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';

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

export const setStatus = (status, statusName) => {
  return (dispatch) => {
    dispatch({type: actionTypes.CONTAINERS_SET_STATUS, status: status, name: statusName});
    dispatch({type: actionTypes.CONTAINERS_SET_CURRENTPAGE, currentPage: 1});
    dispatch(fetchContainers());
  };
};

export const initialLoad = () => {
  return (dispatch) => {
    dispatch({type: actionTypes.CONTAINERS_SET_STATUS, status: [0], name: 'SHOW ALL'});
    dispatch({type: actionTypes.CONTAINERS_SET_LIMIT, limit: 100});
    dispatch(fetchContainers());
  }
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
      statusID: status,
    }

    dispatch({ type: actionTypes.CONTAINERS_FETCH_START, currentPage: currentPage, limit: limit });
    fetchGet('/container/', token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function(resp) {
          const response = resp.data;
          dispatch({ type: actionTypes.CONTAINERS_FETCH_SUCCESS, total: response.count, containers: response.rows, groups: response.groups });
        });
      } else {
        dispatch({ type: actionTypes.CONTAINERS_FETCH_FAILED });        
      }
    });
  }
}
