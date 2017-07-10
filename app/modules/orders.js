import * as _ from 'lodash';
import config from '../config/configValues.json';

function GetOrders(state) {
  return state.app.orders.list;
}

export function pickupType(type) {
  switch (type) {
    case 1: return config.PICKUP_TYPE[0].label;
    case 2: return config.PICKUP_TYPE[1].label;
    case 3: return config.PICKUP_TYPE[2].label;
    case 4: return config.PICKUP_TYPE[3].label;
    default: return '';
  }
}

function currency(value) {
  return `${value || 0}`;
}

function FullAddress(address) {
  const Addr = address.Address1 && address.Address2 && (address.Address1.length < address.Address2.length) ? address.Address2 : address.Address1;
  return Addr;
}

const currencyAttributes = ['OrderCost', 'FinalCost', 'VAT', 'TotalValue', 'DriverShare', 'EtobeeShare', 'LogisticShare'];

const boolAttributes = ['IncludeInsurance', 'UseExtraHelper'];

export function OrderParser(order) {
  const dropoffTime = new Date(order.DropoffTime);
  const pickupTime = new Date(order.PickupTime);
  return Object.assign({}, order, {
    CODValue: order.IsCOD ? order.TotalValue: 0,
    DropoffAddress: order.DropoffAddress ? FullAddress(order.DropoffAddress) : '',
    DropoffCity: order.DropoffAddress ? order.DropoffAddress.City : '',
    DropoffState: order.DropoffAddress ? order.DropoffAddress.State : '',
    DropoffTime: dropoffTime.toLocaleString(),
    ID: (order.UserOrderNumber + ' / ' + order.WebOrderID) || '',
    IsChecked: false,
    OrderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
    PickupAddress: order.PickupAddress ? FullAddress(order.PickupAddress) : '',
    PickupFullAddress: order.PickupAddress && order.PickupAddress.FullAddress || '',
    PickupCity: order.PickupAddress ? order.PickupAddress.City : '',
    PickupZip: order.PickupAddress ? order.PickupAddress.ZipCode : '',
    PickupState: order.PickupAddress ? order.PickupAddress.State : '',
    PickupTime: pickupTime.toLocaleString(),
    PickupType: pickupType(order.PickupType),
    RouteStatus: (order.CurrentRoute && order.CurrentRoute.OrderStatus && order.CurrentRoute.OrderStatus.OrderStatus) || '',
    User: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
    WebstoreName: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
    WebstoreUser: order.WebstoreUser ? `${order.WebstoreUser.FirstName} ${order.WebstoreUser.LastName}` : null,
    Weight: (order.PackageWeight && (order.PackageWeight + ' kg')) || '',
    ZipCode: order.DropoffAddress && order.DropoffAddress.ZipCode,
    SuggestedVendors: (order.LastMileFleetSuggestion) ? order.LastMileFleetSuggestion.map((val) => {
      return val.CompanyDetail.CompanyName + ' (' + val.OrderCapacity + '/' + 
        val.CompanyDetail.OrderVolumeLimit + ')';
    }) : [],
  }, _.reduce(currencyAttributes, (acc, attr) => {
    return _.assign(acc, { [attr]: currency(order[attr]) });
  }, {}), _.reduce(boolAttributes, (acc, attr) => {
    let result = '';
    if (attr in order) {
      result = order[attr] ? config.OPTION.YES : config.OPTION.NO;
    }

    return _.assign(acc, { [attr]: result });
  }, {}));
}

export default {
  GetOrders,
};
