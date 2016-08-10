import {combineReducers} from 'redux';
import * as actionTypes from '../constants';

const initialQuery = {
  currentPage: 1,
  filter: {},
  limit: 100,
};

function queryReducer(state = initialQuery, action) {
  switch(action.type) {
    case actionTypes.TRIPS_RESET: {
      return initialQuery;
    }

    case actionTypes.TRIPS_SET_CURRENTPAGE: {
      return _.assign({}, state, {currentPage: action.currentPage});
    }

    case actionTypes.TRIPS_SET_FILTER: {
      return _.assign({}, state, {filter: action.filter});
    }

    case actionTypes.TRIPS_SET_LIMIT: {
      return _.assign({}, state, {limit: action.limit});
    }

    case actionTypes.TRIPS_SET_QUERYTYPE: {
      return _.assign({}, state, {queryType: action.queryType});
    }

    default: return state;
  }
}

const initialState = {
  totalItem: 0,
  isFetching: false,
  shown: [],
};

function stateReducer(state = initialState, action) {
  switch(action.type) {
    case actionTypes.TRIP_FETCHDETAIL_START:
    case actionTypes.TRIPS_FETCH_START: {
      return _.assign({}, state, {isFetching: true});
    }

    case actionTypes.TRIP_FETCHDETAIL_FAILED:
    case actionTypes.TRIPS_FETCH_FAILED: {
      return _.assign({}, state, {isFetching: false});
    }

    case actionTypes.TRIP_FETCHDETAIL_SUCCESS: {
      return _.assign({}, state, {isFetching: false});
    }

    case actionTypes.TRIPS_FETCH_SUCCESS: {
      return _.assign({}, state, {
        totalItem: action.data.count,
        isFetching: false,
        shown: _.map(action.data.rows, (trip) => trip.TripID),
      });
    }

    default: return state;
  }
}

const initialList = {};

function listReducer(state = initialList, action) {
  switch(action.type) {
    case actionTypes.TRIP_FETCHDETAIL_SUCCESS: {
      return _.assign({}, state, {[action.trip.TripID]: action.trip});
    }

    case actionTypes.TRIPS_FETCH_SUCCESS: {
      return _.reduce(action.data.rows, (accumulator, trip) => {
        return _.assign(accumulator, {[trip.TripID]: trip});
      }, _.assign({}, state));
    }

    default: return state;
  }
}

export default combineReducers({
  list: listReducer,
  query: queryReducer,
  state: stateReducer,
});
