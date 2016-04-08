import * as actionTypes from '../constants';
import fetch from '../../fetch/get';

export default () => {
  return (dispatch, getState) => {
    const {userLogged, containers} = getState().app;
    const {token} = userLogged;
    const {statusList} = containers;

    if(statusList.length > 0) return;

    dispatch({ type: actionTypes.CONTAINERS_STATUS_FETCH });
    fetch('/container/status', token).then(function(response) {
      if(response.ok) {
        response.json().then((response) => {
          dispatch({ 
            type: actionTypes.CONTAINERS_STATUS_SUCCESS, 
            statusList: _.assign({}, response.list, {'SHOW ALL': 0}), 
            statusCategory: response.category });
        });
      } else {
        dispatch({ type: actionTypes.CONTAINERS_STATUS_FAILED });        
      }
    });
  }
}
