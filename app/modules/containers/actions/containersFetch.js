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

export const fetchContainers = () => {
  return (dispatch, getState) => {
    const {userLogged, containers} = getState().app;
    const {token, hubID} = userLogged;
    const {currentPage, limit} = containers;

    const query = {
      hubID: hubID,
      limit: limit,
      offset: (currentPage-1)*limit
    }

    dispatch({ type: actionTypes.CONTAINERS_FETCH_START, currentPage: currentPage, limit: limit });
    fetch('/container/', token, query).then(function(response) {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ type: actionTypes.CONTAINERS_FETCH_SUCCESS, total: response.count, containers: response.rows });
        });
      } else {
        dispatch({ type: actionTypes.CONTAINERS_FETCH_FAILED });        
      }
    });
  }
}
