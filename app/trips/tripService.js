import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
    BASE: "mytrip/defaultSet/",
    SET_TRIPS: "mytrip/orders/set",
}

const initialStore = {
    currentPage: 1,
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    total: 0,
    trips: [],
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if(parsedActionType.length > 2 && parsedActionType[0] === "mytrip" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
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

export function StoreSetter(keyword, value) {
    return {type: Constants.BASE + keyword, [keyword]: value};
}

export function SetFilters(filters) {
    return StoreSetter("filters", filters);
}

export function UpdateFilters(filters) {
    return (dispatch, getState) => {
        const prevFilters = getState().app.myTrips.filters;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFilters(nextFilter));
    }
}

export function SetDropDownFilter(keyword) {
    const filterNames = {
        "statusName": "status",
    };

    return (selectedOption) => {
        const filterName = filterNames[keyword];

        return (dispatch, getState) => {
            dispatch(StoreSetter(keyword, selectedOption.value));
            dispatch(UpdateFilters({[filterName]: selectedOption.key}));
            dispatch(FetchList());
        }
    }
}

export function SetCurrentPage(currentPage) {
    return (dispatch, getState) => {
        dispatch(StoreSetter("currentPage", currentPage));
        dispatch(FetchList());
    }
}

export function SetLimit(limit) {
    return (dispatch, getState) => {
        dispatch(StoreSetter("limit", limit));
        dispatch(SetCurrentPage(1));
    }
}

 export function UpdateAndFetch(filters) {
     return (dispatch) => {
         dispatch(UpdateFilters(filters));
         dispatch(FetchList());
     }
}

export function FetchList() {
    return (dispatch, getState) => {
        const {myTrips, userLogged} = getState().app;
        const {currentPage, limit, filters} = myTrips;
        const {token} = userLogged;
        const params = lodash.assign({}, filters, {
            limit: limit,
            offset: (currentPage - 1) * limit
        });

        if (filters.status) {
            params.statusIDs = JSON.stringify([filters.status]);
        }

        if (filters.startCreated && filters.endCreated) {
             params.startCreated = moment(filters.startCreated).format('MM-DD-YYYY')
             params.endCreated = moment(filters.endCreated).format('MM-DD-YYYY')
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/trip/assigned', token, params).then((response) => {
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