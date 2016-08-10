import * as actionTypes from '../constants';
import fetchGet from '../../fetch/get';

export function TripsSetLimit(limit) {
  return (dispatch) => {
    dispatch({type: actionTypes.TRIPS_SET_LIMIT, limit: limit});
    dispatch({type: actionTypes.TRIPS_SET_CURRENTPAGE, currentPage: 1});
    dispatch(TripsFetch());
  };
};

export function TripsSetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({type: actionTypes.TRIPS_SET_CURRENTPAGE, currentPage: currentPage});
    dispatch(TripsFetch());
  };
};

export function TripsSetFilter(filter) {
  return (dispatch) => {
    dispatch({type: actionTypes.TRIPS_SET_FILTER, filter: filter});
    dispatch({type: actionTypes.TRIPS_SET_CURRENTPAGE, currentPage: 1});
    dispatch(TripsFetch());
  };
};

export function TripsSetQueryType(queryType) {
  return (dispatch) => {
    dispatch({type: actionTypes.TRIPS_RESET});
    dispatch({type: actionTypes.TRIPS_SET_QUERYTYPE, queryType: queryType});
  };
}

export function TripDetailsFetch(id) {
  return (dispatch, getState) => {
    const {userLogged, trips} = getState().app;
    const {token, hubID} = userLogged;

    dispatch({ type: actionTypes.TRIP_FETCHDETAIL_START, id: id });
    fetchGet('/trip/' + id, token).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.TRIP_FETCHDETAIL_SUCCESS, trip: response.data });
        });
      } else {
        dispatch({ type: actionTypes.TRIP_FETCHDETAIL_FAILED });
      }
    });
  }
}

export function TripsFetch() {
  return (dispatch, getState) => {
    const {userLogged, trips} = getState().app;
    const {token, hubID} = userLogged;
    const {currentPage, filter, limit, queryType} = trips.query;

    const query = _.assign({}, filter, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    if (queryType === '/myTrips') {
      query.fleetManagerID = userLogged.userID;
    } else if (queryType === '/tripsFromHere') {
     query.hubID = hubID; 
    }

    dispatch({ type: actionTypes.TRIPS_FETCH_START, query: query });
    fetchGet('/trip/', token, query).then(function(response) {
      if(response.ok) {
        response.json().then(function(response) {
          dispatch({ type: actionTypes.TRIPS_FETCH_SUCCESS, data: response.data });
        });
      } else {
        dispatch({ type: actionTypes.TRIPS_FETCH_FAILED });
      }
    });
  }
}
