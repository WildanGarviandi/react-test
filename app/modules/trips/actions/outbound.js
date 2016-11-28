import lodash from 'lodash';
import Constants from '../constants';
import fetchGet from '../../fetch/get';
import fetchPost from '../../fetch/post';
import ModalActions from '../../modals/actions';
import {push} from 'react-router-redux';

export const setLimit = (limit) => {
  return (dispatch) => {
    dispatch({
      type: Constants.OUTBOUND_TRIPS_SET_STATE,
      updatedState: {
        limit: limit,
        currentPage: 1,
      }
    });
    dispatch(fetchList());
  };
};

export const setCurrentPage = (currentPage) => {
  return (dispatch) => {
    dispatch({
      type: Constants.OUTBOUND_TRIPS_SET_STATE,
      updatedState: {
        currentPage: currentPage,
      }
    });
    dispatch(fetchList());
  };
};

export const setFilter = (filter) => {
  return (dispatch) => {
    dispatch({
      type: Constants.OUTBOUND_TRIPS_SET_FILTER,
      filter: filter,
    });
    dispatch(fetchList());
  };
};

export const fetchList = (isInbound) => {
  return (dispatch, getState) => {
    const {userLogged, outboundTrips} = getState().app;
    const {token, hubID} = userLogged;
    const {currentPage, limit, filter} = outboundTrips;

    const query = lodash.assign({}, filter, {
      hubID: hubID,
      limit: limit,
      offset: (currentPage-1)*limit,
      nonDelivered: true,
      statusIDs: JSON.stringify([1,4,5]),
    });

    dispatch({ type: Constants.OUTBOUND_TRIPS_FETCH_START, query: query });
    fetchGet(`/trip/${isInbound ? 'inbound': 'outbound'}`, token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function({data}) {
          dispatch({
            type: Constants.OUTBOUND_TRIPS_SET_LIST,
            total: data.count,
            list: data.rows,
          });
          dispatch({ type: Constants.OUTBOUND_TRIPS_FETCH_END });
        });
      } else {
        dispatch({ type: Constants.OUTBOUND_TRIPS_FETCH_END });
        dispatch(ModalActions.addMessage('Failed to fetch outbound trips'));
      }
    }).catch(() => { 
      dispatch({ type: Constants.OUTBOUND_TRIPS_FETCH_END });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}
