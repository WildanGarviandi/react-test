import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';

const Constants = {
    BASE: "myorder/defaultSet/",
    SET_ORDERS: "myorder/orders/set",
    TOGGLE_SELECT_ORDER: "myorder/orders/select",
    TOGGLE_SELECT_ALL: "myorder/selectedAll/toggle",
    ADD_ORDERS: "myorder/orders/add",
    FETCH_ORDER_DETAILS: "myorder/orders/details",
    ORDER_DETAILS_SET: "myorder/orders/details/set",
    FETCHING_PAGE: "myorder/orders/fetching"
}

const initialStore = {
    currentPage: 1,
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    orderType: "ALL",
    orderOwner: "ALL",
    assignment: "ALL",
    total: 0,
    orders: [],
    selectedAll: false,
    order: {},
    isEditing: false,
    isFetching: false
}

export default function Reducer(store = initialStore, action) {
    const parsedActionType = action.type.split('/');
    if (parsedActionType.length > 2 && parsedActionType[0] === "myorder" && parsedActionType[1] === "defaultSet") {
        const fieldName = parsedActionType[2];
        return lodash.assign({}, store, {[fieldName]: action[fieldName]});
    }

    switch(action.type) {
        case Constants.SET_ORDERS: {
            return lodash.assign({}, store, {
                total: action.total,
                orders: action.orders,
            });
        }

        case Constants.TOGGLE_SELECT_ORDER: {
            const newOrders = lodash.map(store.orders, (order) => {
                if(order.UserOrderID !== action.orderID) {
                    return order;
                }

                return lodash.assign({}, order, {IsChecked: !order.IsChecked});
            });

            return lodash.assign({}, store, {
                orders: newOrders,
            });
        }

        case Constants.TOGGLE_SELECT_ALL: {
            const {orders, selectedAll} = store;
            const newOrders = lodash.map(orders, (order) => {
                return lodash.assign({}, order, {IsChecked: !selectedAll});
            });

            return lodash.assign({}, store, {
                selectedAll: !selectedAll,
                orders: newOrders,
            })
        }

        case Constants.FETCHING_PAGE: {
            return lodash.assign({}, store, {
                isFetching: true
            });
        }

        case Constants.ORDER_DETAILS_SET: {
            return lodash.assign({}, store, {
                order: action.order,
                isEditing: true,
                isFetching: false
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
        const prevFilters = getState().app.myOrders.filters;
        const nextFilter = lodash.assign({}, prevFilters, filters);
        dispatch(SetFilters(nextFilter));
    }
}

export function SetDropDownFilter(keyword) {
    const filterNames = {
        "statusName": "status",
        "orderOwner": "owner",
        "orderType": "orderType",
        "assignment": "assignment",
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

export function SetCreatedDate(date) {
    return (dispatch, getState) => {
        dispatch(UpdateFilters({createdDate: date.toLocaleString()}));
        dispatch(FetchList());
        dispatch({type: modalAction.BACKDROP_SHOW});
    }
}

export function UpdateAndFetch(filters) {
    return (dispatch) => {
        dispatch(UpdateFilters(filters));
        dispatch(FetchList());
    }
}
export function ToggleChecked(orderID) {
    return {
        type: Constants.TOGGLE_SELECT_ORDER,
        orderID: orderID
    }
}

export function ToggleCheckedAll() {
    return { type: Constants.TOGGLE_SELECT_ALL };
}


export function FetchList() {
    return (dispatch, getState) => {
        const {myOrders, userLogged} = getState().app;
        const {currentPage, limit, filters} = myOrders;
        const {token} = userLogged;
        let params = lodash.assign({}, filters, {
            limit: limit,
            offset: (currentPage - 1) * limit
        })

        if (filters.startCreated && filters.endCreated) {
            params.startCreated = moment(filters.startCreated).format('MM-DD-YYYY')
            params.endCreated = moment(filters.endCreated).format('MM-DD-YYYY')
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/order/assigned', token, params).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch({
                    type: Constants.SET_ORDERS,
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

export function addOrder(order) {
    return (dispatch, getState) => {
        const {userLogged} = getState().app;
        const {token} = userLogged;

        const postBody = {
            UpdateData: order,
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchPost('/order/add', token, postBody).then((response) => {
        if(response.ok) {
            response.json().then(function({data}) {
                dispatch({
                    type: Constants.ORDER_DETAILS_SET,
                    order: lodash.assign({}, orderDetails.order, order),
                });
            });
            dispatch({type: modalAction.BACKDROP_HIDE});
        } else {
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Failed to edit order details'));
        }
        }).catch(() => { 
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Network error'));
        });
    }
}

export function fetchDetails(id) {
    return (dispatch, getState) => {
        const {userLogged} = getState().app;
        const {token} = userLogged;

        dispatch({type: modalAction.BACKDROP_SHOW});
        dispatch({type: Constants.FETCHING_PAGE});
        FetchGet('/order/' + id, token).then(function(response) {
            if(!response.ok) {
                return response.json().then(({error}) => {
                throw error;
                });
            }

            response.json().then(function({data}) {
                dispatch({
                    type: Constants.ORDER_DETAILS_SET,
                    order: data,
                });
                dispatch({type: modalAction.BACKDROP_HIDE});
            });
        }).catch((e) => {
            const message = (e && e.message) ? e.message : "Failed to fetch order details";
            dispatch(ModalActions.addMessage(message));
            dispatch({type: modalAction.BACKDROP_HIDE});
        });
    }
}