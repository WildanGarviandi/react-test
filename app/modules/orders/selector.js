import lodash from 'lodash';

function GetOrders(state) {
  return state.app.orders.list;
}

function PickupType(type) {
  switch(type) {
    case 1: return "Same Day";
    case 2: return "Next Day";
    case 3: return "On Demand";
    case 4: return "Regular";
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
    PickupAddress: order.PickupAddress ? FullAddress(order.PickupAddress) : "",
    PickupTime: pickupTime.toLocaleString(),
    PickupType: PickupType(order.PickupType),
    RouteStatus: (order.CurrentRoute && order.CurrentRoute.OrderStatus && order.CurrentRoute.OrderStatus.OrderStatus) || "",
    User: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
    WebstoreName: (order.User && (order.User.FirstName + ' ' + order.User.LastName)) || '',
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

export default {
  GetOrders,
}
