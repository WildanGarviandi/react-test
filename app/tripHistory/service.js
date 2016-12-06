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
    RESET_FILTER: "history/resetFilter",
    SET_FILTER_ORDER: "history/setFilterOrder",
    RESET_FILTER_ORDER: "history/resetFilterOrder"
}

const initialStore = {
    currentPage: 1,
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    total: 0,
    tripType: "Show All",
    trips: [],
    filteredOrders: []
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

        case Constants.RESET_FILTER: {
            return lodash.assign({}, store, {
                filters: {}, 
                currentPage: 1,
                filterStatus: "SHOW ALL",
                limit: 100,
            });
        }

        case Constants.SET_FILTER_ORDER: {
            return lodash.assign({}, store, {filteredOrders: action.filteredOrders});
        }

        case Constants.RESET_FILTER_ORDER: {
            return lodash.assign({}, store, {filteredOrders: []});
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

        delete params.userOrderNumbers;
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

export function FilterMultipleOrder() {
    return (dispatch, getState) => {
        const {tripsHistory, userLogged} = getState().app;
        const {currentPage, limit, filters} = tripsHistory;
        const {hubID, token} = userLogged;

        const params = {};
        params.userOrderNumbers = filters.userOrderNumbers;
        params.limit = 1000000;
        params.offset = 0;

        let promises = [];
        let filterMessage = [];

        function filterSingleEDS(token, userOrderNumber, params) {
            return new Promise(function(resolve, reject) {
                delete params.userOrderNumbers;
                FetchGet(`/trip/historyByHub/${hubID}`, token, params)
                .then(function(response) {
                    return response.json().then(({data}) => {
                        data.UserOrderNumber = userOrderNumber;
                        return resolve(data);
                    });
                });
            });
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        params.userOrderNumbers.forEach(function(userOrderNumber) {
            params.userOrderNumber = userOrderNumber;
            promises.push(filterSingleEDS(token, userOrderNumber, params));
        });

        Promise.all(promises).then(function(responses) {
            responses.forEach(function(response) {
                if (response.rows.length === 0) {
                    filterMessage.push({UserOrderNumber: response.UserOrderNumber, Found: false});
                } else {
                    let tripIDs = [];
                    response.rows.forEach(function(trip) {
                        tripIDs.push(trip.TripID);
                    });
                    filterMessage.push({UserOrderNumber: response.UserOrderNumber, Found: true, TripID: tripIDs});
                }
            })
            dispatch({
                type: Constants.SET_FILTER_ORDER,
                filteredOrders: filterMessage
            })
            dispatch({type: modalAction.BACKDROP_HIDE});
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

export function ResetFilter() {
    return (dispatch) => {
        dispatch({type: Constants.RESET_FILTER});
    }
}

export function ResetFilterOrder(filters) {
    return {type: Constants.RESET_FILTER_ORDER}
}
