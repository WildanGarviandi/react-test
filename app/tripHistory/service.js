import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';

const Constants = {
    SET_CURRENTPAGE: "history/currentPage/set",
    SET_FILTER: "history/filter/set",
    SET_LIMIT: "history/limit/set",
    SET_STATUSNAME: "history/statusName/set",
    SET_TRIPS: "history/trips/set",
    SET_TRIPTYPE: "history/tripType/set",
}

const initialStore = {
    currentPage: 1,
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    total: 0,
    tripType: "Show All",
    trips: [],
}

export default function Reducer(store = initialStore, action) {
    switch(action.type) {
        case Constants.SET_CURRENTPAGE: {
            return lodash.assign({}, store, {currentPage: action.currentPage});
        }

        case Constants.SET_FILTER: {
            return lodash.assign({}, store, {filters: action.filters});
        }

        case Constants.SET_LIMIT: {
            return lodash.assign({}, store, {limit: action.limit});
        }

        case Constants.SET_STATUSNAME: {
            return lodash.assign({}, store, {statusName: action.statusName});
        }

        case Constants.SET_TRIPTYPE: {
            return lodash.assign({}, store, {tripType: action.tripType});
        }

        case Constants.SET_TRIPS: {
            return lodash.assign({}, store, {
                total: action.total,
                trips: action.trips,
            });
        }

        default: {
            return store;
        }
    }
}

export function SetFilters(filters) {
    return {type: Constants.SET_FILTER, filters: filters}
}

export function UnsetFilters(keywords) {
    return (dispatch, getState) => {
        const prevFilters = getState().app.tripsHistory.filters;
        const nextFilter = lodash.omit(prevFilters, keywords);
        dispatch(SetFilters(nextFilter));
    }
}

export function UpdateFilters(filters) {
    return (dispatch, getState) => {
        const prevFilters = getState().app.tripsHistory.filters;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFilters(nextFilter));
    }
}

export function UpdateAndFetch(filters) {
    return (dispatch, getState) => {
        dispatch(UpdateFilters(filters));
        dispatch(SetCurrentPage(1));
    }
}

export function SetStatus(status) {
    return (dispatch, getState) => {
        dispatch({type: Constants.SET_STATUSNAME, statusName: status.value});
        dispatch(UpdateFilters({statusID: status.key}));
        dispatch(SetCurrentPage(1));
    }
}

export function SetCurrentPage(currentPage) {
    return (dispatch, getState) => {
        dispatch({type: Constants.SET_CURRENTPAGE, currentPage: currentPage});
        dispatch(FetchList());
    }
}

export function SetLimit(limit) {
    return (dispatch, getState) => {
        dispatch({type: Constants.SET_LIMIT, limit: limit});
        dispatch(SetCurrentPage(1));
    }
}

export function FetchList() {
    return (dispatch, getState) => {
        const {tripsHistory, userLogged} = getState().app;
        const {currentPage, limit, filters} = tripsHistory;
        const {hubID, token} = userLogged;

        const params = lodash.assign({}, filters, {
            limit: limit,
            offset: (currentPage-1)*limit
        });

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet(`/trip/historyByHub/${hubID}`, token, params).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_TRIPS,
                    trips: data.rows,
                    total: data.count,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}

export function SetTripType(tripType) {
    return (dispatch, getState) => {
        dispatch({type: Constants.SET_TRIPTYPE, tripType: tripType.value});
        dispatch(UpdateFilters({tripType: tripType.key}));
        dispatch(SetCurrentPage(1));
    }
}
