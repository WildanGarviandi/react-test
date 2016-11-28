import lodash from 'lodash';

function FullName(user) {
    if(!user) {
        return "";
    }

    return `${user.FirstName} ${user.LastName}`;
}

function MerchantName(route) {
    return route && route.UserOrder && route.UserOrder.User && FullName(route.UserOrder.User).trim();
}

function TripType(trip) {
    if(!trip.OriginHub) {
        return "First Leg";
    }

    if(!trip.DestinationHub && trip.District) {
        return "Last Leg";
    }

    if(trip.DestinationHub && !trip.District) {
        return "Inter Hub";
    }

    return "Not yet determined";
}

function TripParser(trip) {
    const merchantNames = lodash
        .chain(trip.UserOrderRoutes)
        .map((route) => (MerchantName(route)))
        .uniq()
        .value()
        .join(', ');

    return lodash.assign({}, trip, {
        FleetName: FullName(trip.FleetManager),
        DriverName: FullName(trip.Driver),
        NextDestination: trip.DestinationHub,
        MerchantNames: merchantNames,
        TripType: TripType(trip),
    });
}

export default TripParser;
