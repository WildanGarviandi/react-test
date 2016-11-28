import lodash from 'lodash';
import {OrderParser} from './orders';

export const TripType = {
  FIRSTLEG: "FIRSTLEG",
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
}

export function CanAssignFleet(trip) {
  if(!trip || !trip.OrderStatus) return false;

  return ['BOOKED'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function CanMarkContainer(trip, hubID) {
  if(!trip || !trip.OrderStatus || !trip.OriginHub || !trip.DestinationHub) return false;

  if(trip.DestinationHub.HubID !== hubID) return false;

  return ['BOOKED', 'ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function CanMarkOrderReceived(trip, orders) {
  if(!trip || !trip.OrderStatus || trip.OriginHub) return false;

  if(!lodash.some(orders, (order) => {
    return order.Status !== "DELIVERED";
  })) {
    return false;
  };

  return ['BOOKED', 'ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function CanMarkTripDelivered(trip, orders) {
  if(!trip || !trip.OrderStatus || trip.OriginHub) return false;

  return ['BOOKED', 'ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function GetTripType(trip, hubID) {
  if(!trip) return "FETCH";

  if(!trip.OriginHub && trip.DestinationHub && trip.DestinationHub.HubID === hubID) {
    return TripType.FIRSTLEG;
  }

  if(trip.OriginHub && trip.OriginHub.HubID === hubID) {
    return TripType.OUTBOUND;
  }

  if(trip.DestinationHub && trip.DestinationHub.HubID === hubID) {
    return TripType.INBOUND;
  }

  return "";
}

function JoinAttr(orders, attr) {
  return lodash.chain(orders)
    .map((order) => (order[attr]))
    .uniq()
    .value()
    .join(', ');
}

export function GetWebstoreNameByCount(orders) {
  var arrayOfWebstore = [];
  var WebstoreNames = lodash.countBy(orders, 'WebstoreName');
  for (var p in WebstoreNames) {
      if (WebstoreNames.hasOwnProperty(p)) {
          arrayOfWebstore.push(p + ' (' + WebstoreNames[p] + (WebstoreNames[p] > 1 ? ' orders' : ' order') + ')');
      }
  }
  return arrayOfWebstore.join(', ');
}

export function TripParser(trip, hubID) {
  function GroupToString(colls) {
    return lodash.reduce(colls, (results, val, key) => {
      return `(${val.length}): ${key}\n${results}`;
    }, "");
  }

  if(!trip) return {};

  const orders = lodash.map(trip.UserOrderRoutes, (route) => {
    return OrderParser(route.UserOrder);
  });

  const WebstoreNames = GetWebstoreNameByCount(orders);

  return lodash.assign({}, trip, {
    WebstoreNames: WebstoreNames,
  });
}
