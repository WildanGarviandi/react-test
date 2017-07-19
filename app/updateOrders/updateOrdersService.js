import * as _ from 'lodash';
import Promise from 'bluebird';

import FetchGet from '../modules/fetch/get';
import FetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { OrderParser } from '../modules/orders';
import { modalAction } from '../modules/modals/constants';
import NotifActions from '../modules/notification/actions';
import * as DashboardService from '../dashboard/dashboardService';


const Constants = {
  ORDERS_UPDATE_CURRENT_PAGE_SET: 'update/currentPage/set',
  ORDERS_UPDATE_FETCH_END: 'update/fetch/end',
  ORDERS_UPDATE_FETCH_START: 'update/fetch/start',
  ORDERS_UPDATE_LIMIT_SET: 'update/limit/set',
  ORDERS_UPDATE_SET: 'update/set',
  ORDERS_UPDATE_START_EDIT_ORDER: 'update/order/edit/start',
  ORDERS_UPDATE_END_EDIT_ORDER: 'update/order/edit/end',
  ORDERS_UPDATE_START: 'update/order/start',
  ORDERS_UPDATE_END: 'update/order/end',
  ORDERS_UPDATE_SUCCESS_EDITING: 'update/order/success',
  ORDERS_UPDATE_REVERT_SUCCESS_EDITING: 'update/order/success/revert',
};

//
// Reducers
//

const initialState = {
  currentPage: 1,
  isFetching: true,
  limit: 25,
  orders: [],
  total: 0,
  isEditing: false,
  scannedOrder: {},
  scannedPricing: {},
  isUpdating: false,
  isSuccessEditing: false,
  isPricingByWeight: true,
  duplicateOrders: [],
  isDuplicate: false,
};

export function Reducer(state = initialState, action) {
  switch (action.type) {
    case Constants.ORDERS_UPDATE_CURRENT_PAGE_SET: {
      return Object.assign({}, state, { currentPage: action.currentPage });
    }

    case Constants.ORDERS_UPDATE_FETCH_END: {
      return Object.assign({}, state, { isFetching: false });
    }

    case Constants.ORDERS_UPDATE_FETCH_START: {
      return Object.assign({}, state, { isFetching: true });
    }

    case Constants.ORDERS_UPDATE_LIMIT_SET: {
      return Object.assign({}, state, { limit: action.limit });
    }

    case Constants.ORDERS_UPDATE_SET: {
      return Object.assign({}, state, {
        orders: action.orders,
        total: action.total,
      });
    }

    case Constants.ORDERS_UPDATE_START_EDIT_ORDER: {
      if (!action.duplicate) {
        return Object.assign({}, state, {
          isEditing: true,
          isDuplicate: false,
          scannedOrder: action.scannedOrder || state.scannedOrder,
          scannedPricing: action.pricing || 0,
          isPricingByWeight: action.isPricingByWeight,
        });
      }

      return Object.assign({}, state, {
        isEditing: true,
        duplicateOrders: action.orders,
        isDuplicate: true,
      });
    }

    case Constants.ORDERS_UPDATE_END_EDIT_ORDER: {
      return Object.assign({}, state, {
        isEditing: false,
        scannedOrder: {},
        scannedPricing: 0,
        isDuplicate: false,
        duplicateOrders: [],
      });
    }

    case Constants.ORDERS_UPDATE_START: {
      return Object.assign({}, state, { isUpdating: true });
    }

    case Constants.ORDERS_UPDATE_END: {
      return Object.assign({}, state, { isUpdating: false });
    }

    case Constants.ORDERS_UPDATE_SUCCESS_EDITING: {
      return Object.assign({}, state, { isSuccessEditing: true });
    }

    case Constants.ORDERS_UPDATE_REVERT_SUCCESS_EDITING: {
      return Object.assign({}, state, { isSuccessEditing: false });
    }

    default: return state;
  }
}

//
// Actions
//

export function FetchList() {
  return (dispatch, getState) => {
    const { updateOrders, userLogged } = getState().app;
    const { token } = userLogged;
    const { currentPage, limit } = updateOrders;

    const query = Object.assign({}, {
      limit,
      offset: (currentPage - 1) * limit,
    });

    FetchGet('/order/unscanned', token, query).then((response) => {
      if (!response.ok) {
        throw new Error();
      }

      response.json().then(({ data }) => {
        dispatch({
          type: Constants.ORDERS_UPDATE_SET,
          orders: _.map(data.rows, OrderParser),
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

      dispatch(ModalActions.addMessage('Failed to fetch update orders'));
    });
  };
}


export function SetCurrentPage(currentPage) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_UPDATE_CURRENT_PAGE_SET,
      currentPage,
    });

    dispatch(FetchList());
  };
}

export function SetLimit(limit) {
  return (dispatch) => {
    dispatch({
      type: Constants.ORDERS_UPDATE_LIMIT_SET,
      limit,
    });

    dispatch(SetCurrentPage(1));
  };
}

const mapPricing = (pricing) => {
  const dispatchData = (dispatch) => {
    let isPricingByWeight = true;
    let mappedPricing = [];
    let price;

    if (pricing.length > 0 && pricing[0]) {
      if (pricing[0].PickupType === 1 && !pricing[0].MaxWeight) {
        isPricingByWeight = false;
        mappedPricing = _.map(pricing, (priceData) => {
          const hasPackageDimensionData = (priceData.WebstoreUser) &&
            (priceData.WebstoreUser.PackageDimension) &&
            priceData.WebstoreUser.PackageDimension[0];

          if (hasPackageDimensionData) {
            const dimension = priceData.WebstoreUser.PackageDimension[0];
            return {
              price: priceData.Price,
              height: dimension.Height,
              length: dimension.Length,
              width: dimension.Width,
              weight: dimension.Weight,
            };
          }

          return priceData;
        });
      } else {
        price = pricing[0].Price;
      }
      dispatch({
        type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
        pricing: (isPricingByWeight) ? price : mappedPricing,
        isPricingByWeight,
      });
    } else {
      dispatch({
        type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
        pricing: 0,
        isPricingByWeight: true,
      });
    }
  };

  return dispatchData;
};

export function StartEditOrder(orderID) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const query = {
      orderID,
    };

    dispatch({ type: modalAction.BACKDROP_SHOW });

    FetchGet('/order/can-be-updated', token, query)
      .then((response) => {
        if (!response.ok) {
          return response.json().then(({ error }) => {
            throw error;
          });
        }

        return response.json();
      }).then(({ data }) => {
        if (data.rows.length > 1) {
          const requests = data.rows.map((order) => {
            const orderData = FetchGet(`/order/${order.UserOrderID}`, token)
              .then((response) => {
                const responseJson = response.json();
                return responseJson;
              }).then((responseJson) => {
                const result = responseJson.data;
                return result;
              });

            return orderData;
          });

          Promise.all(requests)
            .then((orders) => {
              dispatch({ type: modalAction.BACKDROP_HIDE });
              dispatch({
                type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
                duplicate: true,
                orders,
              });
            });
        } else if (data.rows.length === 1) {
          FetchGet(`/order/${data.rows[0].UserOrderID}`, token)
            .then((response) => {
              if (!response.ok) {
                return response.json().then(({ error }) => {
                  throw error;
                });
              }
              return response.json();
            }).then((responseJson) => {
              const result = responseJson.data;
              dispatch({
                type: Constants.ORDERS_UPDATE_START_EDIT_ORDER,
                scannedOrder: result,
              });

              const queryPricing = {
                merchantID: result.User.UserID,
                serviceTypeID: result.PickupType,
                zipcodePickup: result.PickupAddress.ZipCode,
                zipcodeDropoff: result.DropoffAddress.ZipCode,
              };

              return FetchGet('/merchant-pricing/rules', token, queryPricing, true);
            })
            .then((response) => {
              const responseJson = response.json();
              return responseJson;
            })
            .then((responseJson) => {
              const result = responseJson.data;
              dispatch({ type: modalAction.BACKDROP_HIDE });
              dispatch(mapPricing(result));
            });
        } else {
          const message = 'Order not found';
          const level = 'error';
          const position = null;
          const style = null;
          const timeout = 5;
          const withSound = true;

          dispatch(NotifActions.addNotification(message, level,
            position, style, timeout, withSound));
          dispatch({ type: modalAction.BACKDROP_HIDE });
          dispatch({ type: Constants.ORDERS_UPDATE_END_EDIT_ORDER });
        }
      }).catch((e) => {
        const message = e.message || 'Failed to fetch order details';
        dispatch({ type: Constants.ORDERS_UPDATE_END_EDIT_ORDER });
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(ModalActions.addMessage(message));
      });
  };
}

export function StopEditOrder() {
  return { type: Constants.ORDERS_UPDATE_END_EDIT_ORDER };
}

export function UpdateOrder(id, order) {
  return (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    const postBody = {
      UpdateData: order,
      scanReweight: 1,
    };

    dispatch({ type: Constants.ORDERS_UPDATE_START });
    dispatch({ type: modalAction.BACKDROP_SHOW });

    FetchPost(`/order/${id}`, token, postBody).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({ type: Constants.ORDERS_UPDATE_END });
        dispatch({ type: Constants.ORDERS_UPDATE_END_EDIT_ORDER });
        dispatch({ type: modalAction.BACKDROP_HIDE });
        dispatch(DashboardService.FetchCount());
        dispatch(NotifActions.addNotification(
          `Order ${data.result.UserOrderNumber} was successfully updated`,
          'success', null, 4));
      });
    }).catch((e) => {
      const message = e.message || 'Failed to update order';
      dispatch({ type: Constants.ORDERS_UPDATE_END_EDIT_ORDER });
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage(message));
    });
  };
}

export const RevertSuccessEditing = () => {
  const action = { type: Constants.ORDERS_UPDATE_REVERT_SUCCESS_EDITING };
  return action;
};
