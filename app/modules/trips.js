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

export function CanMarkOrderReceived(trip, orders) {
  if(!trip || !trip.OrderStatus || trip.OriginHub) return false;

  if(!lodash.some(orders, (order) => {
    return order.Status !== "DELIVERED";
  })) {
    return false;
  };

  return ['ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function CanMarkTripDelivered(trip, orders) {
  if(!trip || !trip.OrderStatus || trip.OriginHub) return false;

  if(lodash.some(orders, (order) => {
    return order.Status !== "DELIVERED";
  })) {
    return false;
  };

  return ['ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

function GetTripType(trip) {
  if(!trip.OriginHub) {
    return TripType.FIRSTLEG;
  }

  if(trip.OriginHub && trip.OriginHub.HubID === hubID) {
    return TripType.INBOUND;
  }

  if(trip.DestinationHub && trip.DestinationHub.HubID === hubID) {
    return TripType.OUTBOUND;
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

  const WebstoreNames = JoinAttr(orders, 'WebstoreName');

  return lodash.assign({}, trip, {
    WebstoreNames: WebstoreNames,
  });
}
