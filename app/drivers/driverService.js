import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
    BASE: "mydriver/defaultSet/",
    SET_DRIVERS: "mydriver/drivers/set",
    TOGGLE_SELECT_DRIVER: "mydriver/drivers/select",
    TOGGLE_SELECT_ALL: "mydriver/selectedAll/toggle",
    SET_DRIVERS_ORDERS: "mydriver/drivers/orders"
}

const initialStore = {
    currentPage: 1,
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    total: 0,
    drivers: [],
    selectedAll: false,
    driver: {},
    isEditing: false,
    isFetching: false,
    orders: [],
    driverOrdersIDActive: 0,
    currentPageOrders: 1,
    totalOrders: 0,
    statusNameOrders: "SHOW ALL",
    orderOwner: "ALL",
    limitOrders: 100,
    filtersOrders: {}
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "mydriver" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.SET_DRIVERS: {
            return lodash.assign({}, store, {
                total: action.total,
                drivers: action.drivers,
            });
        }

        case Constants.TOGGLE_SELECT_DRIVER: {
            const newDrivers = lodash.map(store.drivers, (driver) => {
                if(driver.UserID !== action.driverID) {
                    return driver;
                }

                return lodash.assign({}, driver, {IsChecked: !driver.IsChecked});
            });

            return lodash.assign({}, store, {
                drivers: newDrivers,
            });
        }

        case Constants.TOGGLE_SELECT_ALL: {
            const {drivers, selectedAll} = store;
            const newDrivers = lodash.map(drivers, (driver) => {
                return lodash.assign({}, driver, {IsChecked: !selectedAll});
            });

            return lodash.assign({}, store, {
                selectedAll: !selectedAll,
                drivers: newDrivers,
            })
        }

        case Constants.SET_DRIVERS_ORDERS: {
            return lodash.assign({}, store, {
                totalOrders: action.total,
                orders: action.orders,
                driverOrdersIDActive: action.driverID
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
        const prevFilters = getState().app.myDrivers.filters;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFilters(nextFilter));
    }
}

export function SetDropDownFilter(keyword) {
    const filterNames = {
        "statusName": "status"
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

export function ToggleChecked(driverID) {
    return {
        type: Constants.TOGGLE_SELECT_DRIVER,
        driverID: driverID
    }
}

export function ToggleCheckedAll() {
    return { type: Constants.TOGGLE_SELECT_ALL };
}


export function FetchList() {
    return (dispatch, getState) => {
        const {myDrivers, userLogged} = getState().app;
        const {currentPage, limit, filters} = myDrivers;
        const {token} = userLogged;
        let params = lodash.assign({}, filters, {
            limit: limit,
            offset: (currentPage - 1) * limit
        })

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/driver', token, params).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_DRIVERS,
                    drivers: data.rows,
                    total: data.count,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}

export function StoreSetterOrders(keyword, value) {
    return {type: Constants.BASE + keyword, [keyword]: value};
}

export function SetFiltersOrders(filters) {
    return StoreSetterOrders("filtersOrders", filters);
}

export function UpdateFiltersOrders(filters) {
    return (dispatch, getState) => {
        const prevFilters = getState().app.myDrivers.filtersOrders;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFiltersOrders(nextFilter));
    }
}

export function SetDropDownFilterOrders(keyword) {
    const filterNames = {
        "statusName": "status",
        "orderOwner": "isTrunkeyOrder",
    };

    return (selectedOption) => {
        const filterName = filterNames[keyword];

        return (dispatch, getState) => {
            dispatch(StoreSetterOrders(keyword, selectedOption.value));
            dispatch(UpdateFiltersOrders({[filterName]: selectedOption.key}));
            dispatch(FetchListOrders());
        }
    }
}

export function UpdateAndFetchOrders(filters) {
    return (dispatch) => {
        dispatch(UpdateFiltersOrders(filters));
        dispatch(FetchListOrders());
    }
}

export function SetCurrentPageOrders(currentPage) {
    return (dispatch, getState) => {
        dispatch(StoreSetterOrders("currentPageOrders", currentPage));
        dispatch(FetchListOrders());
    }
}

export function SetLimitOrders(limit) {
    return (dispatch, getState) => {
        dispatch(StoreSetterOrders("limitOrders", limit));
        dispatch(SetCurrentPageOrders(1));
    }
}

export function FetchListOrders(id) {
    return (dispatch, getState) => {
        const {myDrivers, userLogged} = getState().app;
        const {currentPageOrders, limitOrders, filtersOrders, driverOrdersIDActive} = myDrivers;
        const {token} = userLogged;
        let params = lodash.assign({}, filtersOrders, {
            limit: limitOrders,
            offset: (currentPageOrders - 1) * limitOrders
        });

        if (params.status === 0) {
            delete params.status;
        }

        if (filtersOrders.startPickup && filtersOrders.endPickup) {
            params.startPickup = moment(filtersOrders.startPickup).format('MM-DD-YYYY');
            params.endPickup = moment(filtersOrders.endPickup).format('MM-DD-YYYY');
        }

        if (params.isTrunkeyOrder === 'All') {
            delete params.isTrunkeyOrder;
        }

        let driverID = parseInt(id) || parseInt(driverOrdersIDActive);
        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/driver/' + driverID + '/orders', token, params).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_DRIVERS_ORDERS,
                    driverID: driverID,
                    orders: data.rows,
                    total: data.count,
                })
            });
        }).catch((e) => {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage(e.message));
        });
    }
}