import * as _ from 'lodash';

import { OrderParser } from './orders';
import config from '../config/configValues.json';

export const TripType = {
  FIRSTLEG: "FIRSTLEG",
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
}

export function CanAssignFleet(trip) {
  if (!trip || !trip.OrderStatus) return false;

  return ['BOOKED'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function CanMarkContainer(trip, hubID) {
  if (!trip || !trip.OrderStatus || !trip.OriginHub || !trip.DestinationHub) return false;

  if (trip.DestinationHub.HubID !== hubID) return false;

  return ['BOOKED', 'ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function CanMarkOrderReceived(trip, orders) {
  if (!trip || !trip.OrderStatus || trip.OriginHub) return false;

  if (!_.some(orders, (order) => {
    return order.Status !== "DELIVERED";
  })) {
    return false;
  };

  return ['BOOKED', 'ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function CanMarkTripDelivered(trip) {
  if (!trip || !trip.OrderStatus || trip.OriginHub) return false;

  return ['BOOKED', 'ACCEPTED', 'PICKUP', 'IN-TRANSIT'].indexOf(trip.OrderStatus.OrderStatus) > -1;
}

export function GetTripType(trip, hubID, roleName) {
  if (!trip) return 'FETCH';

  if (!trip.OriginHub && trip.DestinationHub) {
    if ((config.role.DEFAULT === roleName && trip.DestinationHub.HubID === hubID) || config.role.SUPERHUB) {
      return TripType.FIRSTLEG;
    }
  }

  if (trip.OriginHub && trip.OriginHub.HubID === hubID) {
    return TripType.OUTBOUND;
  }

  if (trip.DestinationHub && trip.DestinationHub.HubID === hubID) {
    return TripType.INBOUND;
  }

  return "";
}

function JoinAttr(orders, attr) {
  return _.chain(orders)
    .map((order) => (order[attr]))
    .uniq()
    .value()
    .join(', ');
}

export function GetWebstoreNameByCount(orders) {
  let arrayOfWebstore = [];
  const WebstoreNamesCount = _.countBy(orders, 'WebstoreName');
  for (let WebstoreNameCount in WebstoreNamesCount) {
    if (WebstoreNamesCount.hasOwnProperty(WebstoreNameCount)) {
      arrayOfWebstore.push(
        `${WebstoreNameCount}
         (${WebstoreNamesCount[WebstoreNameCount]}
          ${WebstoreNamesCount[WebstoreNameCount] > 1 ? 'orders' : 'order'})`,
      );
    }
  }
  return arrayOfWebstore.join(', ');
}

export function GetWebstoreUserByCount(orders) {
  let arrayOfWebstore = [];
  const WebstoreUsersCount = _.countBy(orders, 'WebstoreUser');
  for (let WebstoreUserCount in WebstoreUsersCount) {
    if (WebstoreUsersCount.hasOwnProperty(WebstoreUserCount)) {
      arrayOfWebstore.push(
        `${WebstoreUserCount === 'null' ? 'No Child Merchant' : WebstoreUserCount}
        (${WebstoreUsersCount[WebstoreUserCount]}
         ${(WebstoreUsersCount[WebstoreUserCount] > 1 ? 'orders' : 'order')})`,
      );
    }
  }
  return arrayOfWebstore.join(', ');
}

export function GetWebstoreNameWithoutCount(orders) {
  let arrayOfWebstore = [];
  const WebstoreNamesCount = _.countBy(orders, 'WebstoreName');
  for (let WebstoreNameCount in WebstoreNamesCount) {
    if (WebstoreNamesCount.hasOwnProperty(WebstoreNameCount)) {
      arrayOfWebstore.push(WebstoreNameCount);
    }
  }
  return arrayOfWebstore.join(', ');
}

export function GetWeightTrip(orders) {
  return `${_.sumBy(orders, 'PackageWeight')}`;
}

export function GetScannedRoutes(routes) {
  let scannedOrders = 0;
  routes.forEach(function (route) {
    if (route.OrderStatus && route.OrderStatus.OrderStatus === 'DELIVERED') {
      scannedOrders++;
    }
  })
  return scannedOrders;
}

export function GetWebstoreNameWithMores(orders) {
  let arrayOfWebstore = [];
  const WebstoreNames = _.countBy(orders, 'WebstoreName');
  for (let WebstoreName in WebstoreNames) {
    if (WebstoreNames.hasOwnProperty(WebstoreName)) {
      arrayOfWebstore.push(WebstoreName);
    }
  }
  if (arrayOfWebstore.length === 1) {
    return arrayOfWebstore[0];
  } else if (arrayOfWebstore.length === 2) {
    return arrayOfWebstore[0] + ' and ' + arrayOfWebstore[1];
  } else {
    return arrayOfWebstore[0] + ' and ' + (arrayOfWebstore.length - 1) + ' merchants';
  }
}

export function getPickupTypeWithCount(orders) {
  const arrayOfPickupType = [];
  const PickupTypesCount = _.countBy(orders, 'PickupType');
  for (const PickupTypeCount in PickupTypesCount) {
    if (PickupTypesCount.hasOwnProperty(PickupTypeCount)) {
      arrayOfPickupType.push(
        `${PickupTypeCount === 'null' ? 'No Service Type' : PickupTypeCount}
        (${PickupTypesCount[PickupTypeCount]}
         ${(PickupTypesCount[PickupTypeCount] > 1 ? 'orders' : 'order')})`,
      );
    }
  }
  return arrayOfPickupType.join(', ');
}

export function TripParser(trip, hubID) {
  function GroupToString(colls) {
    return _.reduce(colls, (results, val, key) => {
      return `(${val.length}): ${key}\n${results}`;
    }, '');
  }

  if (!trip) return {};

  const routes = _.map(trip.UserOrderRoutes, (route) => {
    return route;
  });

  const orders = _.map(trip.UserOrderRoutes, (route) => {
    return OrderParser(route.UserOrder);
  });

  const uniqueOrders = _.uniqBy(orders, 'UserOrderNumber');

  const WebstoreNames = GetWebstoreNameByCount(uniqueOrders);
  const WebstoreUser = GetWebstoreUserByCount(orders);
  const Weight = GetWeightTrip(orders);
  const ScannedOrders = GetScannedRoutes(routes);
  const ListWebstore = GetWebstoreNameWithoutCount(orders);
  const ListWebstoreMores = GetWebstoreNameWithMores(orders);
  const PickupType = getPickupTypeWithCount(uniqueOrders);

  return Object.assign({}, trip, {
    WebstoreNames,
    WebstoreUser,
    Weight,
    ScannedOrders,
    ListWebstore,
    ListWebstoreMores,
    PickupType,
    orders: uniqueOrders,
  });
}
