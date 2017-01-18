import lodash from 'lodash';
import {push} from 'react-router-redux';
import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {OrderParser} from '../modules/orders';
import {modalAction} from '../modules/modals/constants';
import NotifActions from '../modules/notification/actions';
import Promise from 'bluebird';

const Constants = {
  ORDERS_UPDATE_CURRENT_PAGE_SET: "update/currentPage/set",
  ORDERS_UPDATE_FETCH_END: "update/fetch/end",
  ORDERS_UPDATE_FETCH_START: "update/fetch/start",
  ORDERS_UPDATE_LIMIT_SET: "update/limit/set",
  ORDERS_UPDATE_SET: "update/set",
  ORDERS_UPDATE_START_EDIT_ORDER: "update/order/edit/start",
  ORDERS_UPDATE_END_EDIT_ORDER: "update/order/edit/end",
  ORDERS_UPDATE_START: "update/order/start",
  ORDERS_UPDATE_END: "update/order/end",
  ORDERS_UPDATE_SUCCESS_EDITING: "update/order/success",
  ORDERS_UPDATE_REVERT_SUCCESS_EDITING: "update/order/success/revert"
}

//
// Reducers
//

const initialState = {
  currentPage: 1,
  isFetching: true,
  limit: 50,
  orders: [],
  total: 0,
  isEditing: false,
  scannedOrder: {},
  scannedPricing: {},
  isUpdating: false,
  isSuccessEditing: false,
  isPricingByWeight: true,
  duplicateOrders: [],
  isDuplicate: false
}

export function Reducer(state = initialState, action) {
  switch(action.type) {
    case Constants.ORDERS_UPDATE_CURRENT_PAGE_SET: {
      return lodash.assign({}, state, {currentPage: action.currentPage});
    }

    case Constants.ORDERS_UPDATE_FETCH_END: {
      return lodash.assign({}, state, {isFetching: false});
    }

    case Constants.ORDERS_UPDATE_FETCH_START: {
      return lodash.assign({}, state, {isFetching: true});
    }

    case Constants.ORDERS_UPDATE_LIMIT_SET: {
      return lodash.assign({}, state, {limit: action.limit});
    }

    case Constants.ORDERS_UPDATE_SET: {
      return lodash.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.ORDERS_UPDATE_START_EDIT_ORDER: {
      if (!action.duplicate) {
        return lodash.assign({}, state, {
          isEditing: true,
          isDuplicate: false,
          scannedOrder: action.scannedOrder || state.scannedOrder,
          scannedPricing: action.pricing || 0,
          isPricingByWeight: action.isPricingByWeight
        });
      } else {
        return lodash.assign({}, state, {
          isEditing: true,
          duplicateOrders: action.orders,
          isDuplicate: true
        })
      }
    }

    case Constants.ORDERS_UPDATE_END_EDIT_ORDER: {
      return lodash.assign({}, state, {
        isEditing: false,
        scannedOrder: {},
        scannedPricing: 0,
        isDuplicate: false,
        duplicateOrders: []
      });
    }

    case Constants.ORDERS_UPDATE_START: {
      return lodash.assign({}, state, {isUpdating: true});
    }

    case Constants.ORDERS_UPDATE_END: {
      return lodash.assign({}, state, {isUpdating: false});
    }

    case Constants.ORDERS_UPDATE_SUCCESS_EDITING: {
      return lodash.assign({}, state, {isSuccessEditing: true});
    }

    case Constants.ORDERS_UPDATE_REVERT_SUCCESS_EDITING: {
      return lodash.assign({}, state, {isSuccessEditing: false});
    }

    default: return state;
  }
}

//
// Actions
//

export function FetchList() {
  return (dispatch, getState) => {
    const {updateOrders, userLogged} = getState().app;
    const {token} = userLogged;
    const {currentPage, limit} = updateOrders;

    const query = lodash.assign({}, {
      limit: limit,
      offset: (currentPage-1)*limit,
    });

    FetchGet('/order/unscanned', token, query).then((response) => {
      if(!response.ok) {
        throw new Error();
      }

      response.json().then(({data}) => {
        dispatch({
          type: Constants.ORDERS_UPDATE_SET,
          orders: lodash.map(data.rows, OrderParser),
          total: data.count,
        });

        dispatch({
          type: Constants.ORDERS_UPDATE_FETCH_END,
        });
      });
    }).catch(() => {
      dispatch({
        type: Constants.ORDERS_UPDATE_FETCH_END,
      });

      dispatch(ModalActions.addMessage("Failed to fetch update orders"));
    });
  }
}


export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_UPDATE_CURRENT_PAGE_SET,
      currentPage: currentPage,
    });

    dispatch(FetchList());
  }
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_UPDATE_LIMIT_SET,
      limit: limit,
    });

    dispatch(SetCurrentPage(1));
  }
}

export function StartEditOrder (orderID) {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    const query = {
      orderID: orderID
    };

    dispatch({type: modalAction.BACKDROP_SHOW});

    FetchGet('/order/can-be-updated', token, query)
    .then(function (response) {
      return response.json();
    }).then(function ({data}) {
      if (data.rows.length > 1) {
        let requests = data.rows.map((order) => {
          return FetchGet('/order/' + order.UserOrderID, token)
          .then((response) => {
            return response.json()
          }).then(({data}) => {
            return data
          })
        })

        Promise.all(requests)
        .then((orders) => {
          dispatch({type: modalAction.BACKDROP_HIDE})
          dispatch({
            type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
            duplicate: true,
            orders: orders
          })
        })
      } else {
        FetchGet('/order/' + data.rows[0].UserOrderID, token)
        .then(function (response) {
          return response.json();
        }).then(function ({data}) {
          dispatch({
            type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
            scannedOrder: data
          });

          const queryPricing = {
            merchantID: data.User.UserID,
            serviceTypeID: data.PickupType,
            zipcodePickup: data.PickupAddress.ZipCode,
            zipcodeDropoff: data.DropoffAddress.ZipCode
          }
          return FetchGet('/merchant-pricing/rules', token, queryPricing, true);
        }).then(function (response) {
          return response.json();
        }).then(function ({data}) {
          dispatch({type: modalAction.BACKDROP_HIDE});
          dispatch(mapPricing(data));
        });
      }
    }).catch((e) => { 
      const message = e.message || "Failed to fetch order details";
      dispatch({ type: Constants.ORDERS_UPDATE_END_EDIT_ORDER });
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export function StopEditOrder() {
  return {type: Constants.ORDERS_UPDATE_END_EDIT_ORDER};
}

export function UpdateOrder (id, order) {
  return (dispatch, getState) => {
    const {userLogged, orderDetails} = getState().app;
    const {token} = userLogged;

    const postBody = {
      UpdateData: order,
    }

    dispatch({ type: Constants.ORDERS_UPDATE_START });
    dispatch({ type: modalAction.BACKDROP_SHOW });

    FetchPost('/order/' + id, token, postBody).then((response) => {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(function({data}) {
        dispatch({ type: Constants.ORDERS_UPDATE_END });
        dispatch({ type: Constants.ORDERS_UPDATE_END_EDIT_ORDER });
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(NotifActions.addNotification(`Order ${data.result.UserOrderNumber} was successfully updated`, 'success', null, 4));
      });
    }).catch((e) => { 
      const message = e.message || "Failed to update order";
      dispatch({ type: Constants.ORDERS_UPDATE_END_EDIT_ORDER });
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export const RevertSuccessEditing = () => {
  return {type: Constants.ORDERS_UPDATE_REVERT_SUCCESS_EDITING};
}

function mapPricing (pricing) {
  return (dispatch, getState) => {
    let isPricingByWeight = true;
    let mappedPricing = [];
    let price;

    if (pricing.length > 0) {
      if (pricing[0] && !pricing[0].MaxWeight) {
        isPricingByWeight = false;
        mappedPricing = lodash.map(pricing, (price) => {
          const hasPackageDimensionData = (price.WebstoreUser) && 
                (price.WebstoreUser.PackageDimension) && 
                price.WebstoreUser.PackageDimension[0];
          
          if (hasPackageDimensionData) {
            const dimension = price.WebstoreUser.PackageDimension[0];
            return {
              price: price.Price,
              height: dimension.Height,
              length: dimension.Length,
              width: dimension.Width,
              weight: dimension.Weight
            }
          }
        });
      } else {
        let price = pricing[0].Price;
      }
      dispatch({
        type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
        pricing: (isPricingByWeight) ? price : mappedPricing,
        isPricingByWeight
      });
    } else {
      dispatch({
        type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
        pricing: 0,
        isPricingByWeight: true
      });
    }
  }
}