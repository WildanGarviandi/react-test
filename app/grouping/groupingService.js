import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {OrderParser} from '../modules/orders';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {modalAction} from '../modules/modals/constants';
import NotifActions from '../modules/notification/actions';

const Constants = {
  GROUPING_CURRENT_PAGE_SET: "grouping/currentPage/set",
  GROUPING_FETCH_END: "grouping/fetch/end",
  GROUPING_FETCH_START: "grouping/fetch/start",
  GROUPING_LIMIT_SET: "grouping/limit/set",
  GROUPING_SET: "grouping/set",
  GROUPING_CREATE_TRIP_START: "grouping/trip/create/start",
  GROUPING_CREATE_TRIP_END: "grouping/trip/create/end",
  GROUPING_TRIP_SET: "grouping/trip/set",
  GROUPING_ORDER_ADD_START: "grouping/order/add/start",
  GROUPING_ORDER_ADD_END: "grouping/order/add/end",
  GROUPING_ORDER_REMOVE: "grouping/order/remove"
}

//
// Reducers
//

const initialState = {
  currentPage: 1,
  isFetching: false,
  limit: 50,
  orders: [],
  total: 0,
  isGrouping: false,
  isGroupingPage: true,
  addedOrders: [],
  isSuccessCreating: false,
  createdTrip: {},
  duplicateOrders: [],
  isDuplicate: false
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.GROUPING_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.GROUPING_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.GROUPING_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.GROUPING_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.GROUPING_SET: {
      return lodash.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.GROUPING_CREATE_TRIP_START: {
      return lodash.assign({}, state, {isGrouping: true});
    }

    case Constants.GROUPING_CREATE_TRIP_END: {
      return lodash.assign({}, state, {
        isGrouping: false,
        addedOrders: [],
        isSuccessCreating: action.success,
        createdTrip: action.createdTrip || {}
      });
    }

    case Constants.GROUPING_TRIP_SET: {
      return lodash.assign({}, state, {trip: action.trip});
    }

    case Constants.GROUPING_ORDER_ADD_START: {
      return lodash.assign({}, state, {
        isDuplicate: false,
        duplicateOrders: []
      })
    }

    case Constants.GROUPING_ORDER_ADD_END: {
      if (!action.duplicate) {
        return lodash.assign({}, state, {addedOrders: state.addedOrders.concat([action.order])});
      } else {
        return lodash.assign({}, state, {
          duplicateOrders: action.order,
          isDuplicate: true
        });
      }

    }

    case Constants.GROUPING_ORDER_REMOVE: {
      var addedOrders = [].concat(state.addedOrders);
      addedOrders.splice(action.index, 1);
      return lodash.assign({}, state, {addedOrders: addedOrders});
    }

    default: return state;
  }
}

//
// Actions
//

export function FetchList() {
  return (dispatch, getState) => {
    const {grouping, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, filters, limit} = grouping;

    const query = lodash.assign({}, filters, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    dispatch({
      type: Constants.GROUPING_FETCH_START,
    });

    FetchGet('/order/received', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.GROUPING_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });

        dispatch({
          type: Constants.GROUPING_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.GROUPING_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch grouping orders"));
    });
  }
}

export function AddOrder (orderNumber, backElementFocusID) {
  return (dispatch, getState) => {
    const {userLogged, grouping} = getState().app;
    const {token} = userLogged;
    const {addedOrders} = grouping;

    const query = {
      userOrderNumber: orderNumber,
    };

    dispatch({
      type: modalAction.BACKDROP_SHOW,
    });

    dispatch({
      type: Constants.GROUPING_ORDER_ADD_START,
    });

    FetchGet('/order/received', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      dispatch({
        type: modalAction.BACKDROP_HIDE,
      });

      return response.json().then(({data}) => {
        if (data.count < 1) {
          throw new Error(`${orderNumber} is not found`);
        } else if (data.count > 1) {
          dispatch({
            type: Constants.GROUPING_ORDER_ADD_END,
            duplicate: true,
            order: data.rows
          });
        } else {
          const index = lodash.findIndex(addedOrders, {'UserOrderNumber': data.rows[0].UserOrderNumber});
          if (index > -1) {
            dispatch(ModalActions.addConfirmation({
              message: `Remove order ${data.rows[0].UserOrderNumber} ?`,
              action: function () {
                dispatch(RemoveOrder(index));
              },
              backElementFocusID: 'addOrder',
              yesFocus: true
            }));
          } else {
            dispatch({
              type: Constants.GROUPING_ORDER_ADD_END,
              order: data.rows[0]
            });
          }
        }
        
      });
    }).catch((e) => {
      const message = e.message || "Failed to fetch order details";

      dispatch({
        type: modalAction.BACKDROP_HIDE,
      });

      dispatch(ModalActions.addMessage(message, backElementFocusID));
    });
  }
}

export function RemoveOrder (index) {
  return (dispatch) => {
    dispatch({
      type: Constants.GROUPING_ORDER_REMOVE,
      index: index
    });
  }
}

export function SetCurrentPage (currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.GROUPING_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetLimit (limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.GROUPING_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function DoneCreateTrip () {
  return (dispatch) => {
    dispatch({
      type: Constants.GROUPING_CREATE_TRIP_END,
      success: false
    });
  }
}

export function CreateTrip () {
  return (dispatch, getState) => {
    const {grouping, userLogged} = getState().app;
    const {token} = userLogged;
    const {addedOrders} = grouping;

    const orderIDs = lodash.map(grouping.addedOrders, (order) => (order.UserOrderID));

    let arrayOfNextDestination = [];
    const checkedOrdersDestination = lodash.chain(addedOrders)
      .filter((order) => {
        return order.IsChecked;
      })
      .countBy('NextDestination')
      .value();

    for (var p in checkedOrdersDestination) {
        if (checkedOrdersDestination.hasOwnProperty(p)) {
            arrayOfNextDestination.push({NextDestination: p, Count: checkedOrdersDestination[p]});
        }
    }
    
    if (arrayOfNextDestination.length > 1) {
      var isContinue = confirm("Bro, you’re about to group " + checkedOrdersIDs.length + " orders with different destinations. Sure you wanna do that?");
      if (!isContinue){
        return;
      } 
    }

    const body = {
      OrderIDs: orderIDs,
    }

    dispatch({
      type: Constants.GROUPING_CREATE_TRIP_START,
    });

    FetchPost('/trip/outbound', token, body).then((response) => {
      if(response.ok) {
        response.json().then(({data}) => {
          dispatch({
            type: Constants.GROUPING_CREATE_TRIP_END,
            success: true,
            createdTrip: data.trip
          });
        });
      } else {
        response.json().then(({error}) => {
          dispatch({
            type: Constants.GROUPING_CREATE_TRIP_END,
            success: false
          });

          dispatch(ModalActions.addMessage("Failed to grouping orders. " + error.message[0].reason));
        });
      }
    });
  }
}