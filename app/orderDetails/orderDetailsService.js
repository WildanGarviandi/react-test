import lodash from 'lodash';
import fetchGet from '../modules/fetch/get';
import fetchPost from '../modules/fetch/post';
import ModalActions from '../modules/modals/actions';
import {modalAction} from '../modules/modals/constants';

const Constants = {
  DETAILS_FETCH_END: "DETAILS_FETCH_END",
  DETAILS_FETCH_START: "DETAILS_FETCH_START",
  DETAILS_SET: "DETAILS_SET",

  EDIT_ORDER_START: "EDIT_ORDER_START",
  EDIT_ORDER_END: "EDIT_ORDER_END",

  PICKUP_ORDERS_FETCH_END: "PICKUP_ORDERS_FETCH_END",
  PICKUP_ORDERS_FETCH_START: "PICKUP_ORDERS_FETCH_START",
  PICKUP_ORDERS_GROUP_END: "PICKUP_ORDERS_GROUP_END",
  PICKUP_ORDERS_GROUP_START: "PICKUP_ORDERS_GROUP_START",
  PICKUP_ORDERS_SET_FILTER: "PICKUP_ORDERS_SET_FILTER",
  PICKUP_ORDERS_SET_LIST: "PICKUP_ORDERS_SET_LIST",
  PICKUP_ORDERS_SET_SELECTED: "PICKUP_ORDERS_SET_SELECTED",
  PICKUP_ORDERS_SET_STATE: "PICKUP_ORDERS_SET_STATE",

  RECEIVED_ORDERS_FETCH_END: "PICKUP_ORDERS_FETCH_END",
  RECEIVED_ORDERS_FETCH_START: "PICKUP_ORDERS_FETCH_START",
  RECEIVED_ORDERS_GROUP_END: "PICKUP_ORDERS_GROUP_END",
  RECEIVED_ORDERS_GROUP_START: "PICKUP_ORDERS_GROUP_START",
  RECEIVED_ORDERS_SET_FILTER: "PICKUP_ORDERS_SET_FILTER",
  RECEIVED_ORDERS_SET_LIST: "PICKUP_ORDERS_SET_LIST",
  RECEIVED_ORDERS_SET_SELECTED: "PICKUP_ORDERS_SET_SELECTED",
  RECEIVED_ORDERS_SET_STATE: "PICKUP_ORDERS_SET_STATE",

  UPDATE_ORDERS_START: "UPDATE_ORDERS_START",
  UPDATE_ORDERS_END: "UPDATE_ORDERS_END",
  SUCCESS_EDITING: "SUCCESS_EDITING",
  REVERT_SUCCESS_EDITING: "REVERT_SUCCESS_EDITING",
};

function GetOrders(state) {
  return state.app.orders.list;
}

function PickupType(type) {
  switch(type) {
    case 1: return "Same Day Service";
    case 2: return "Next Day Service";
    case 3: return "On Demand Service";
    case 4: return "Regular Service";
    default: return "";
  }
}

function PickupTypeAbbr(type) {
  switch(type) {
    case 1: return "SDS";
    case 2: return "NDS";
    case 3: return "ODS";
    case 4: return "REG";
    default: return "";
  }
}

function Currency(x) {
  if(!x) {
    x = 0;
  }

  return `${x}`;
}

function FullAddress(address) {
  const Addr = address.Address1 && address.Address2 && (address.Address1.length < address.Address2.length) ? address.Address2 : address.Address1;
  return lodash.chain([Addr, address.City, address.State, address.ZipCode])
    .filter((str) => (str && str.length > 0))
    .value()
    .join(', ');
}

const currencyAttributes = ["OrderCost", "DeliveryFee", "FinalCost", "VAT", "TotalValue", "DriverShare", "EtobeeShare", "LogisticShare"];

const boolAttributes = ["IncludeInsurance", "UseExtraHelper", "IsCOD"];

export function OrderParser(order) {
  const dropoffTime = new Date(order.DropoffTime);
  const pickupTime = new Date(order.PickupTime);
  order.DeliveryFee = order.OrderCost;
  return lodash.assign({}, order, {
    CODValue: order.IsCOD ? order.TotalValue: 0,
    DropoffAddress: order.DropoffAddress ? FullAddress(order.DropoffAddress) : "",
    DropoffTime: dropoffTime.toLocaleString(),
    ID: (order.UserOrderNumber + ' / ' + order.WebOrderID) || "",
    IsChecked: false,
    NextDestination: (order.CurrentRoute && order.CurrentRoute.DestinationHub && order.CurrentRoute.DestinationHub.Name) || "",
    OrderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || "",
    Pickup: order.PickupAddress,
    PickupAddress: order.PickupAddress ? FullAddress(order.PickupAddress) : "",
    PickupTime: pickupTime.toLocaleString(),
    PickupType: PickupType(order.PickupType),
    PickupTypeAbbr: PickupTypeAbbr(order.PickupType),
    RouteStatus: (order.CurrentRoute && order.CurrentRoute.OrderStatus && order.CurrentRoute.OrderStatus.OrderStatus) || "",
    User: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
    WebstoreName: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
    Dropoff: order.DropoffAddress,
    ZipCode: order.DropoffAddress && order.DropoffAddress.ZipCode,
  }, lodash.reduce(currencyAttributes, (acc, attr) => {
    return lodash.assign(acc, {[attr]: Currency(order[attr])});
  }, {}), lodash.reduce(boolAttributes, (acc, attr) => {
    let result = "";
    if(attr in order) {
      result = order[attr] ? "Yes" : "No";
    }

    return lodash.assign(acc, {[attr]: result});
  }, {}));
}

export const startEditing = () => {
  return {type: Constants.EDIT_ORDER_START};
}

export const endEditing = () => {
  return {type: Constants.EDIT_ORDER_END};
}

export const revertSuccessEditing = () => {
  return {type: Constants.REVERT_SUCCESS_EDITING};
}

export const editOrder = (id, order, fromInbound) => {
  return (dispatch, getState) => {
    const {userLogged, orderDetails} = getState().app;
    const {token} = userLogged;

    const postBody = {
      UpdateData: order,
    }

    dispatch({ type: Constants.UPDATE_ORDERS_START });
    dispatch({ type: modalAction.BACKDROP_SHOW });
    fetchPost('/order/' + id, token, postBody).then((response) => {
      if(response.ok) {
        response.json().then(function({data}) {
          dispatch({
            type: Constants.DETAILS_SET,
            order: lodash.assign({}, orderDetails.order, order),
          });
          dispatch({ type: Constants.UPDATE_ORDERS_END });
          dispatch({ type: Constants.EDIT_ORDER_END });
          dispatch({ type: modalAction.BACKDROP_HIDE });
        });
        if (fromInbound) {
          dispatch({ type: Constants.SUCCESS_EDITING });
        }
      } else {
        dispatch({ type: Constants.UPDATE_ORDERS_END });
        dispatch({ type: modalAction.BACKDROP_HIDE });
        response.json().then(({error}) => {
          dispatch(ModalActions.addMessage('Failed to edit order details. ' + error.message));
        });
      }
    }).catch(() => { 
      dispatch({ type: Constants.UPDATE_ORDERS_END });
      dispatch({ type: modalAction.BACKDROP_HIDE });
      dispatch(ModalActions.addMessage('Network error'));
    });
  }
}

export const fetchDetails = (id) => {
  return (dispatch, getState) => {
    const {userLogged} = getState().app;
    const {token} = userLogged;

    dispatch({ type: Constants.DETAILS_FETCH_START });
    fetchGet('/order/' + id, token).then(function(response) {
      if(!response.ok) {
        return response.json().then(({error}) => {
          throw error;
        });
      }

      response.json().then(function({data}) {
        dispatch({
          type: Constants.DETAILS_SET,
          order: OrderParser(data),
        });
        dispatch({ type: Constants.DETAILS_FETCH_END });
      });
    }).catch((e) => {
      const message = (e && e.message) ? e.message : "Failed to fetch order details";
      dispatch({ type: Constants.DETAILS_FETCH_END });
      dispatch(ModalActions.addMessage(message));
    });
  }
}

export default {
  GetOrders,
}