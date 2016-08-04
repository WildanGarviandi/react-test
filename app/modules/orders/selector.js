import lodash from 'lodash';

function GetOrders(state) {
  return state.app.orders.list;
}

function FullAddress(address) {
  return lodash.chain([address.Address1, address.City, address.State, address.ZipCode])
    .filter((str) => (str && str.length > 0))
    .value()
    .join(', ');
}

export function OrderParser(order) {
  return {
    CODValue: order.IsCOD ? order.TotalValue: 0,
    DropoffAddress: order.DropoffAddress ? FullAddress(order.DropoffAddress) : "",
    ID: order.UserOrderNumber + ' / ' + order.WebOrderID,
    IsChecked: false,
    OrderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || "",
    PickupAddress: order.PickupAddress ? FullAddress(order.PickupAddress) : "",
    PickupTime: order.PickupTime,
  }
}

export default {
  GetOrders,
}
