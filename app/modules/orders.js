import lodash from 'lodash'; // eslint-disable-line

function GetOrders(state) {
  return state.app.orders.list;
}

export function PickupType(type) {
  switch (type) {
    case 1: return 'Same Day';
    case 2: return 'Next Day';
    case 3: return 'On Demand';
    case 4: return 'Regular';
    default: return '';
  }
}

function Currency(x) {
  if (!x) {
    x = 0;
  }

  return `${x}`;
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
  return lodash.assign({}, order, {
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
    PickupType: PickupType(order.PickupType),
    RouteStatus: (order.CurrentRoute && order.CurrentRoute.OrderStatus && order.CurrentRoute.OrderStatus.OrderStatus) || '',
    User: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
    WebstoreName: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
    Weight: (order.PackageWeight && (order.PackageWeight + ' kg')) || '',
    ZipCode: order.DropoffAddress && order.DropoffAddress.ZipCode,
    SuggestedVendors: (order.LastMileFleetSuggestion) ? order.LastMileFleetSuggestion.map((val) => {
      return val.CompanyDetail.CompanyName + ' (' + val.OrderCapacity + '/' + 
        val.CompanyDetail.OrderVolumeLimit + ')';
    }) : [],
  }, lodash.reduce(currencyAttributes, (acc, attr) => {
    return lodash.assign(acc, { [attr]: Currency(order[attr]) });
  }, {}), lodash.reduce(boolAttributes, (acc, attr) => {
    let result = '';
    if (attr in order) {
      result = order[attr] ? 'Yes' : 'No';
    }

    return lodash.assign(acc, { [attr]: result });
  }, {}));
}

export default {
  GetOrders,
};
