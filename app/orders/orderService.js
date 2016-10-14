import lodash from 'lodash';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';
import moment from 'moment';
import config from '../../config.json';
import Promise from 'bluebird';
import {fetchXhr} from '../modules/fetch/getXhr';

const Constants = {
    BASE: "myorder/defaultSet/",
    SET_ORDERS: "myorder/orders/set",
    TOGGLE_SELECT_ORDER: "myorder/orders/select",
    TOGGLE_SELECT_ALL: "myorder/selectedAll/toggle",
    ADD_ORDERS: "myorder/orders/add",
    FETCH_ORDER_DETAILS: "myorder/orders/details",
    ORDER_DETAILS_SET: "myorder/orders/details/set",
    FETCHING_PAGE: "myorder/orders/fetching",
    FETCHING_PAGE_STOP: "myorder/orders/fetchingStop",
}

const initialStore = {
    currentPage: 1,
    filters: {},
    limit: 100,
    statusName: "SHOW ALL",
    orderType: "All",
    orderOwner: "All",
    assignment: "All",
    isCOD: "All",
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
                orders: action.orders
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

        case Constants.FETCHING_PAGE_STOP: {
            return lodash.assign({}, store, {
                order: {},
                isFetching: false,
                isEditing: false
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
        "orderOwner": "isTrunkeyOrder",
        "isCOD": "isCOD",
        "orderType": "orderType",
        "assignment": "assignment",
    };

    return (selectedOption) => {
        const filterName = filterNames[keyword];

        return (dispatch, getState) => {
            dispatch(StoreSetter(keyword, selectedOption.value));
            dispatch(StoreSetter("currentPage", 1));
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
        dispatch(StoreSetter("currentPage", 1));
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
        const {currentPage, limit, total, filters} = myOrders;
        const {token} = userLogged;
        let params = lodash.assign({}, filters, {
            limit: limit,
            offset: (currentPage - 1) * limit
        })

        if (filters.startCreated && filters.endCreated) {
            params.startCreated = moment(filters.startCreated).format('MM-DD-YYYY');
            params.endCreated = moment(filters.endCreated).format('MM-DD-YYYY');
        }

        if (filters.startDueTime && filters.endDueTime) {
            params.startDueTime = moment(filters.startDueTime).format('MM-DD-YYYY');
            params.endDueTime = moment(filters.endDueTime).format('MM-DD-YYYY');
        }

        if (filters.isTrunkeyOrder === 'All') {
            delete params.isTrunkeyOrder;
        }

        if (filters.isCOD === 'All') {
            delete params.isCOD;
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchGet('/order/assigned', token, params).then((response) => {
            if(!response.ok) {
                return response.json().then(({error}) => {
                    throw error;
                })
            }

            return response.json().then(({data}) => {
                if (data.count < total) {
                    dispatch(SetCurrentPage(1));
                }
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

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchPost('/order/company', token, order).then((response) => {
        if(response.ok) {
            response.json().then(function({data}) {
                dispatch({
                    type: Constants.ORDER_DETAILS_SET,
                    order: lodash.assign({}, order),
                });
                alert('Add Order Success');
                dispatch({type: modalAction.BACKDROP_HIDE});
                window.location.href='/myorders/details/' + data.UserOrderID;
            });
        } else {
            response.json().then(function({error}) {
                var message = '';
                error.message.forEach(function(m) {
                    message += m + '\n';
                });
                alert(message);
                dispatch({type: modalAction.BACKDROP_HIDE});
            });
        }
        }).catch(() => { 
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(ModalActions.addMessage('Network error'));
        });
    }
}

export function editOrder(id, order) {
    return (dispatch, getState) => {
        const {userLogged} = getState().app;
        const {token} = userLogged;

        dispatch({type: modalAction.BACKDROP_SHOW});
        FetchPost('/order/company/' + id, token, order).then((response) => {
        if(response.ok) {
            response.json().then(function({data}) {
                if (!data.UserOrderID) {
                    alert(data.message || 'Can\'t update order');
                    dispatch({type: modalAction.BACKDROP_HIDE});
                    return;
                }
                dispatch({
                    type: Constants.ORDER_DETAILS_SET,
                    order: lodash.assign({}, order),
                });                
                alert('Edit Order Success');
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch(fetchDetails(data.UserOrderID));
            });
        } else {
            response.json().then(function({error}) {
                var message = '';
                error.message.forEach(function(m) {
                    message += m + '\n';
                });
                alert(message);
                dispatch({type: modalAction.BACKDROP_HIDE});
                dispatch(fetchDetails(id));
            });
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
            window.history.back();
            const message = (e && e.message) ? e.message : "Failed to fetch order details";
            dispatch(ModalActions.addMessage(message));
            dispatch({type: modalAction.BACKDROP_HIDE});
        });
    }
}

export function resetManageOrder() {
    return (dispatch) => {
        dispatch({type: Constants.FETCHING_PAGE_STOP});
    }
}

export function ExportOrder(startDate, endDate) {
    return (dispatch, getState) => {
        const {myOrders, userLogged} = getState().app;
        const {filters, total} = myOrders;
        const {token} = userLogged;
        const acceptHeader = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        const responseType = 'arraybuffer';
        let params = lodash.assign({}, filters, {});
        let isProceed;

        if (filters.startCreated && filters.endCreated) {
            params.startCreated = moment(filters.startCreated).format('MM-DD-YYYY')
            params.endCreated = moment(filters.endCreated).format('MM-DD-YYYY')
        }

        if (filters.startDueTime && filters.endDueTime) {
            params.startDueTime = moment(filters.startDueTime).format('MM-DD-YYYY');
            params.endDueTime = moment(filters.endDueTime).format('MM-DD-YYYY');
        }

        if (filters.isTrunkeyOrder === 'All') {
            delete params.isTrunkeyOrder;
        }

        if (filters.isCOD === 'All') {
            delete params.isCOD;
        }
        
        if (Object.keys(params).length === 0) {
            isProceed = confirm('You are about to export ' + total + ' orders. Do you want to continue ?');
            if (!isProceed) {
                return;
            }
        }

        var output ='<p style="text-align: center">'+
                    '<img src="../img/loading.gif" style="width:100px; height:100px;" />'+
                    '<br />'+
                    'You can do other things, while exporting in progress'+
                    '</p>';

        var popout = window.open();
        popout.document.write(output);
        let xhr = fetchXhr('/order/export/', params, token, acceptHeader, responseType);
        xhr.onload = function (oEvent) {
            let blob = new Blob([xhr.response], {type: acceptHeader});
            let fileName = 'export_'+ moment(new Date()).format('YYYY-MM-DD HH:mm:ss') +'.xlsx';
            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                window.navigator.msSaveBlob(blob, fileName);
            } else {
                let URL = window.URL || window.webkitURL;
                let downloadUrl = window.URL.createObjectURL(blob);

                if (fileName) {
                    let a = document.createElement("a");
                    if (typeof a.download === 'undefined') {
                        popout.location.href = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = fileName;
                        a.target = '_blank';
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    popout.location.href = downloadUrl;
                }

                setTimeout(function () { 
                    window.URL.revokeObjectURL(downloadUrl); 
                    popout.close();
                }, 1000);
            }
        };

        xhr.send(null);
    }
}

export function AssignOrder(orders, driverID) {
    return (dispatch, getState) => {
        const {userLogged, myOrders} = getState().app;
        const {token} = userLogged;
        let params = {
            driverID: driverID
        };

        let promises = [];
        let assignMessage = '';

        function assignSingleOrder(token, order, params) {
            return new Promise(function(resolve, reject) {
                FetchPost('/order/' + order.UserOrderID + '/driver', token, params)
                .then(function(response) {
                    if (!response.ok) {            
                        return response.json().then(({error}) => {
                            error.order = order;
                            return resolve(error);
                        });
                    } 
                    return response.json().then(({data}) => {
                        data.order = order;
                        return resolve(data);
                    });
                });
            });
        }

        dispatch({type: modalAction.BACKDROP_SHOW});
        orders.forEach(function(order) {
            promises.push(assignSingleOrder(token, order, params));
        });

        Promise.all(promises).then(function(responses) {
            responses.forEach(function(response) {
                if (response.code === 200) {            
                    assignMessage += response.order.UserOrderNumber + ': success assigned \n';
                } else {
                    assignMessage += response.order.UserOrderNumber + ': ' + response.message + '\n';
                }
            })
            alert(assignMessage);
            dispatch({type: modalAction.BACKDROP_HIDE});
            dispatch(FetchList());
        });
    }
}