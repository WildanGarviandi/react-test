import * as _ from 'lodash';

import fetchGet from '../modules/fetch/get';
import fetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import { modalAction } from '../modules/modals/constants';
import * as DashboardService from '../dashboard/dashboardService';
import configValues from '../config/configValues.json';

const Constants = {
  DETAILS_FETCH_END: 'DETAILS_FETCH_END',
  DETAILS_FETCH_START: 'DETAILS_FETCH_START',
  DETAILS_SET: 'DETAILS_SET',

  EDIT_ORDER_START: 'EDIT_ORDER_START',
  EDIT_ORDER_END: 'EDIT_ORDER_END',

  PICKUP_ORDERS_FETCH_END: 'PICKUP_ORDERS_FETCH_END',
  PICKUP_ORDERS_FETCH_START: 'PICKUP_ORDERS_FETCH_START',
  PICKUP_ORDERS_GROUP_END: 'PICKUP_ORDERS_GROUP_END',
  PICKUP_ORDERS_GROUP_START: 'PICKUP_ORDERS_GROUP_START',
  PICKUP_ORDERS_SET_FILTER: 'PICKUP_ORDERS_SET_FILTER',
  PICKUP_ORDERS_SET_LIST: 'PICKUP_ORDERS_SET_LIST',
  PICKUP_ORDERS_SET_SELECTED: 'PICKUP_ORDERS_SET_SELECTED',
  PICKUP_ORDERS_SET_STATE: 'PICKUP_ORDERS_SET_STATE',

  RECEIVED_ORDERS_FETCH_END: 'PICKUP_ORDERS_FETCH_END',
  RECEIVED_ORDERS_FETCH_START: 'PICKUP_ORDERS_FETCH_START',
  RECEIVED_ORDERS_GROUP_END: 'PICKUP_ORDERS_GROUP_END',
  RECEIVED_ORDERS_GROUP_START: 'PICKUP_ORDERS_GROUP_START',
  RECEIVED_ORDERS_SET_FILTER: 'PICKUP_ORDERS_SET_FILTER',
  RECEIVED_ORDERS_SET_LIST: 'PICKUP_ORDERS_SET_LIST',
  RECEIVED_ORDERS_SET_SELECTED: 'PICKUP_ORDERS_SET_SELECTED',
  RECEIVED_ORDERS_SET_STATE: 'PICKUP_ORDERS_SET_STATE',

  UPDATE_ORDERS_START: 'UPDATE_ORDERS_START',
  UPDATE_ORDERS_END: 'UPDATE_ORDERS_END',
  SUCCESS_EDITING: 'SUCCESS_EDITING',
  REVERT_SUCCESS_EDITING: 'REVERT_SUCCESS_EDITING',
};

function GetOrders(state) {
  return state.app.orders.list;
}

function PickupType(type) {
  switch (type) {
    case 1: return configValues.PICKUP_TYPE[0].label;
    case 2: return configValues.PICKUP_TYPE[1].label;
    case 3: return configValues.PICKUP_TYPE[2].label;
    case 4: return configValues.PICKUP_TYPE[3].label;
    default: return '';
  }
}

function PickupTypeAbbr(type) {
  switch (type) {
    case 1: return configValues.PICKUP_TYPE[0].value;
    case 2: return configValues.PICKUP_TYPE[1].value;
    case 3: return configValues.PICKUP_TYPE[2].value;
    case 4: return configValues.PICKUP_TYPE[3].value;
    default: return '';
  }
}

function currency(value) {
  return `${value || 0}`;
}

function FullAddress(address) {
  const Addr = address.Address1 && address.Address2 &&
    (address.Address1.length < address.Address2.length) ? address.Address2 : address.Address1;
  return _.chain([Addr, address.City, address.State, address.ZipCode])
    .filter(str => (str && str.length > 0))
    .value()
    .join(', ');
}

const currencyAttributes = ['OrderCost', 'DeliveryFee', 'FinalCost', 'VAT', 'TotalValue', 'DriverShare', 'EtobeeShare', 'LogisticShare'];

const boolAttributes = ['IncludeInsurance', 'UseExtraHelper', 'IsCOD'];

export function OrderParser(order) {
  const dropoffTime = new Date(order.DropoffTime);
  const pickupTime = new Date(order.PickupTime);
  order.DeliveryFee = order.OrderCost;
  return Object.assign({}, order, {
    CODValue: order.IsCOD ? order.TotalValue : 0,
    DropoffAddress: order.DropoffAddress ? FullAddress(order.DropoffAddress) : '',
    DropoffTime: dropoffTime.toLocaleString(),
    ID: (`${order.UserOrderNumber} / ${order.WebOrderID}`) || '',
    IsChecked: false,
    NextDestination: (order.CurrentRoute && order.CurrentRoute.DestinationHub && order.CurrentRoute.DestinationHub.Name) || '',
    OrderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
    Pickup: order.PickupAddress,
    PickupAddress: order.PickupAddress ? FullAddress(order.PickupAddress) : '',
    PickupTime: pickupTime.toLocaleString(),
    PickupType: PickupType(order.PickupType),
    PickupTypeAbbr: PickupTypeAbbr(order.PickupType),
    RouteStatus: (order.CurrentRoute && order.CurrentRoute.OrderStatus && order.CurrentRoute.OrderStatus.OrderStatus) || '',
    User: (order.User && (`${order.User.FirstName} ${order.User.LastName}`)) || '',
    WebstoreName: (order.User && (`${order.User.FirstName} ${order.User.LastName}`)) || '',
    Dropoff: order.DropoffAddress,
    ZipCode: order.DropoffAddress && order.DropoffAddress.ZipCode,
  }, _.reduce(currencyAttributes, (acc, attr) => {
    const data = Object.assign(acc, { [attr]: currency(order[attr]) });
    return data;
  }, {}), _.reduce(boolAttributes, (acc, attr) => {
    let result = '';
    if (attr in order) {
      result = order[attr] ? 'Yes' : 'No';
    }

    return Object.assign(acc, { [attr]: result });
  }, {}));
}

export const startEditing = () => {
  const data = { type: Constants.EDIT_ORDER_START };
  return data;
};

export const endEditing = () => {
  const data = { type: Constants.EDIT_ORDER_END };
  return data;
};

export const revertSuccessEditing = () => {
  const data = { type: Constants.REVERT_SUCCESS_EDITING };
  return data;
};

export const editOrder = (id, order, fromInbound) => {
  const dispatchData = (dispatch, getState) => {
    const { userLogged, orderDetails } = getState().app;
    const { token } = userLogged;

    const postBody = {
      UpdateData: order,
    };

    dispatch({ type: Constants.UPDATE_ORDERS_START });
    dispatch({ type: modalAction.BACKDROP_SHOW });
    fetchPost(`/order/${id}`, token, postBody).then((response) => {
      if (response.ok) {
        response.json().then(() => {
          dispatch({
            type: Constants.DETAILS_SET,
            order: Object.assign({}, orderDetails.order, order),
          });
          dispatch({ type: Constants.UPDATE_ORDERS_END });
          dispatch({ type: Constants.EDIT_ORDER_END });
          dispatch({ type: modalAction.BACKDROP_HIDE });
        });
        if (fromInbound) {
          dispatch({ type: Constants.SUCCESS_EDITING });
        }
        dispatch(DashboardService.FetchCount());
      } else {
        dispatch({ type: Constants.UPDATE_ORDERS_END });
        dispatch({ type: modalAction.BACKDROP_HIDE });
        response.json().then(({ error }) => {
          dispatch(ModalActions.addMessage(
            `Failed to edit order details. ${error.message}`,
          ));
        });
      }
    }).catch(() => {
      dispatch({ type: Constants.UPDATE_ORDERS_END });
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage('Network error'));
    });
  };

  return dispatchData;
};

export const fetchDetails = (id) => {
  const dispatchData = (dispatch, getState) => {
    const { userLogged } = getState().app;
    const { token } = userLogged;

    dispatch({ type: Constants.DETAILS_FETCH_START });
    fetchGet(`/order/${id}`, token).then((response) => {
      if (!response.ok) {
        return response.json().then(({ error }) => {
          throw error;
        });
      }

      return response.json().then(({ data }) => {
        dispatch({
          type: Constants.DETAILS_SET,
          order: OrderParser(data),
        });
        dispatch({ type: Constants.DETAILS_FETCH_END });
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : 'Failed to fetch order details';
      dispatch({ type: Constants.DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage(message));
    });
  };

  return dispatchData;
};

export default { GetOrders };
