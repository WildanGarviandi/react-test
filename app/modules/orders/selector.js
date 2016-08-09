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

  return `Rp ${x}`;
}

function FullAddress(address) {
  return lodash.chain([address.Address1, address.City, address.State, address.ZipCode])
    .filter((str) => (str && str.length > 0))
    .value()
    .join(', ');
}

const currencyAttributes = ["OrderCost", "FinalCost", "VAT", "TotalValue", "DriverShare", "EtobeeShare", "LogisticShare"];

const boolAttributes = ["IncludeInsurance", "UseExtraHelper"];

export function OrderParser(order) {
  const pickupTime = new Date(order.PickupTime);
  return lodash.assign({}, order, {
    CODValue: order.IsCOD ? order.TotalValue: 0,
    DropoffAddress: order.DropoffAddress ? FullAddress(order.DropoffAddress) : "",
    ID: (order.UserOrderNumber + ' / ' + order.WebOrderID) || "",
    IsChecked: false,
    NextDestination: (order.CurrentRoute && order.CurrentRoute.DestinationHub && order.CurrentRoute.DestinationHub.Name) || "",
    OrderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || "",
    PickupAddress: order.PickupAddress ? FullAddress(order.PickupAddress) : "",
    PickupTime: pickupTime.toLocaleString(),
    PickupType: PickupType(order.PickupType),
    RouteStatus: (order.CurrentRoute && order.CurrentRoute.OrderStatus && order.CurrentRoute.OrderStatus.OrderStatus) || "",
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
