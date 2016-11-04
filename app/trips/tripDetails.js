import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import * as TripService from './tripService';
import styles from './styles.css';
import configValues from '../config/configValues.json';
import DateTime from 'react-datetime';
import moment from 'moment';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';
import {Link} from 'react-router';
import Accordion from '../views/base/accordion';
import TimeFormatter from '../helper/time';
import {formatDate} from '../helper/time';

const tripAttrs = [
    'driver', 
    'container', 
    'pickupAddress', 
    'dropoffAddress', 
    'originHub', 
    'destinationHub', 
    'pickupTime', 
    'dropoffTime', 
    'step', 
    'status'
];

const tripLabel = {
    container: 'Container',
    driver: 'Driver',
    dropoffTime: 'Dropoff Time',
    pickupTime: 'Pickup Time',
    status: 'Status',
    step: 'Step',
    originHub: 'Origin Hub',
    destinationHub: 'Destination Hub',
    pickupAddress: 'Pickup Address',
    dropoffAddress: 'Dropoff Address'
};

function ProcessTrip(trip) {
    const fleetManager = trip.FleetManager;
    const fleetManagerName = fleetManager && 
        `${fleetManager.FirstName} ${fleetManager.LastName} / ${fleetManager.Email} / ${fleetManager.PhoneNumber}`;

    function getStep(trip) {
        var step = ''
        if (trip.OriginHub && trip.DestinationHub) {
            step = 'InterHub'
        } else if (trip.DestinationHub) {
            step = 'Last Leg' 
        } else if (trip.OriginHub) {
            step = 'First Leg'
        }
        return step;
    }

    return _.assign({}, trip, {
        container: trip.ContainerNumber,
        district: trip.District && trip.District.Name,
        driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
        dropoffAddress: trip.DropoffAddress && trip.DropoffAddress.Address1,
        dropoffTime: trip.DropoffTime && formatDate(trip.DropoffTime),
        fleet: fleetManagerName,
        key: trip.TripID,
        tripNumber: trip.TripNumber,
        pickupAddress: trip.PickupAddress && trip.PickupAddress.Address1,
        pickupTime: trip.PickupTime && formatDate(trip.PickupTime),
        status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
        step: getStep(trip),
        originHub: trip.OriginHub && trip.OriginHub.Name,
        destinationHub: trip.DestinationHub && trip.DestinationHub.Name,
    });
}

const TripPanel = React.createClass({
    render() {
        const trip = this.props.trip;

        const rows = _.map(tripAttrs, (attr) => {
            return (
                <span className={styles.row} key={attr}>
                    <span className={styles.label}>{tripLabel[attr]}</span>
                    <span className={styles.value}>{trip[attr]}</span>
                </span>
            );
        });

        return (
            <div className={styles.panel}>
                <h4 className={styles.title} onClick={this.props.accordionAction.toggleView}>{"Trip Detail"}</h4>
                {
                    this.props.accordionState === "expanded" &&
                    <div className={styles.body}>{rows}</div>
                }
            </div>
        );
    }
});

const routeAttrs = [
    'pickupAddress', 
    'pickupTime', 
    'dropoffAddress', 
    'dropoffTime', 
    'distance', 
    'etaDelivery', 
    'deliveryFee', 
    'netMargin', 
    'status'
];

const routeLabel = {
    deliveryFee: 'Delivery Fee',
    distance: 'Distance',
    dropoffAddress: 'Dropoff Address',
    dropoffTime: 'Dropoff Time',
    etaDelivery: 'ETA Delivery',
    fleetManager: 'Fleet Manager',
    netMargin: 'Net Margin',
    pickupAddress: 'Pickup Address',
    pickupTime: 'Pickup Time',
    status: 'Status',
};

function ProcessRoute(route) {
    const fleetManager = route.FleetManager;
    const fleetManagerName = fleetManager && 
        `${fleetManager.FirstName} ${fleetManager.LastName} / ${fleetManager.Email} / ${fleetManager.PhoneNumber}`;

    return _.assign({}, route, {
        deliveryFee: `Rp ${route.DeliveryFee}`,
        distance: `${route.Distance/1000} km`,
        dropoffAddress: route.DropoffAddress && route.DropoffAddress.Address1,
        dropoffTime: route.DropoffTime && formatDate(route.DropoffTime),
        etaDelivery: TimeFormatter(route.ETADelivery),
        fleetManager: fleetManagerName,
        netMargin: route.NetMargin,
        pickupAddress: route.PickupAddress && route.PickupAddress.Address1,
        pickupTime: route.PickupTime && formatDate(route.PickupTime),
        status: route.OrderStatus && route.OrderStatus.OrderStatus,
    });
}

const orderAttrs = [
    'userOrderNumber', 
    'webOrderID', 
    'user', 
    'webstore', 
    'pickupType', 
    'paymentType', 
    'pickup', 
    'dropoff', 
    'status', 
    'paidByParent'
];

const orderLabel = {
    dropoff: 'Dropoff',
    paidByParent: 'Paid By Parent',
    paymentType: 'Payment Type',
    pickup: 'Pickup',
    pickupType: 'Pickup Type',
    status: 'Status',
    user: 'User',
    userOrderNumber: 'User Order Number',
    webOrderID: 'Web Order ID',
    webstore: 'Webstore',
};

function ProcessOrder(order) {
    const user = order.User;
    const webstoreUser = order.WebstoreUser;
    const PickupType = ['-', 'Now', 'Later', 'On Demand'];

    return _.assign({}, order, {
        dropoff: order.DropoffAddress && order.DropoffAddress.Address1,
        paidByParent: order.PaidByParent ? order.User && 
            `Yes (by ${order.User.FirstName} ${order.User.LastName})` : order.WebstoreUser && 
            `No (by ${order.WebstoreUser.FirstName} ${order.WebstoreUser.LastName})`,
        paymentType: order.PaymentType === 2 ? 'Wallet' : 'Cash',
        pickup: order.PickupAddress && order.PickupAddress.Address1,
        pickupType: PickupType[order.PickupType] || '-',
        status: order.OrderStatus && order.OrderStatus.OrderStatus,
        user: order.User && `${order.User.FirstName} ${order.User.LastName} / ${order.User.Email} / ${order.User.PhoneNumber}`,
        userOrderNumber: order.UserOrderNumber,
        webOrderID: order.WebOrderID,
        webstore: order.WebstoreUser && 
            `${order.WebstoreUser.FirstName} ${order.WebstoreUser.LastName} / ${order.WebstoreUser.Email} / ${order.WebstoreUser.PhoneNumber}`,
    });
}

const Route = React.createClass({
    render() {
        const {idx, route} = this.props;
        const order = ProcessOrder(route.UserOrder);

        const routeTitle = `Order ${idx + 1}: ${order.UserOrderNumber} / ${order.WebOrderID}`;
        const routeDetails = _.map(routeAttrs, (attr) => {
            return (
                <span className={styles.row} key={attr}>
                  <span className={styles.label}>{routeLabel[attr]}</span>
                  <span className={styles.value}>{route[attr]}</span>
                </span>
            );
        });

        const orderDetails = _.map(orderAttrs, (attr) => {
            return (
                <span className={styles.row} key={attr}>
                  <span className={styles.label}>{orderLabel[attr]}</span>
                  <span className={styles.value}>{order[attr]}</span>
                </span>
            );
        });

        return (
            <div className={styles.panel}>
                <h4 className={styles.title} onClick={this.props.accordionAction.toggleView}>{routeTitle}</h4>
                {
                this.props.accordionState === 'expanded' &&
                <div>
                    <div style={{width: "48%", float: 'left', marginLeft: 10}}>
                        <h5 className={styles.subtitle}>Route Details</h5>
                        <div className={styles.detail}>{routeDetails}</div>
                    </div>
                    <div style={{width: "48%", float: 'right', marginRight: 10}}>
                        <h5 className={styles.subtitle}>Order Details</h5>
                        <div className={styles.detail}>{orderDetails}</div>
                    </div>
                </div>
                }
            </div>
        );
    }
})

const RoutePanel = React.createClass({
    render() {
    const routes = _.map(this.props.routes, (route, idx) => {
      return (
        <Accordion key={route.UserOrderRouteID} initialState={'collapsed'}>
          <Route idx={idx} route={route} />
        </Accordion>
      );
    });

    return (
      <div>
        <h4>{"Trip Orders"}</h4>
        {routes}
      </div>
    );
  }
})

const DetailPage = React.createClass({
    render() {
        return (
            <Page title={"Trip History"}>
            {
                this.props.isFetching &&
                <h4>Fetching Details...</h4>
            }
            {
                !this.props.isFetching &&
                <div>
                    <Accordion initialState={'expanded'}>
                        <TripPanel trip={this.props.trip} />
                    </Accordion>
                    <RoutePanel routes={this.props.routes} />
                </div>
            }
            </Page>
        );
    }
});

const DetailPageStateful = React.createClass({
    componentWillMount() {
        this.props.GetDetails();
    },
    render() {
        const {isFetching, trip} = this.props;

        const DetailPageParams = {
            isFetching: isFetching,
            routes: _.map(trip.UserOrderRoutes, ProcessRoute),
            trip: ProcessTrip(trip),
        }

        return (<DetailPage {...DetailPageParams} />);
    }
});

function StoreToTripsPage(store) {
    const {trip, isFetching} = store.app.myTrips;
    return {
        trip,
        isFetching
    }
}

function mapDispatchToTrips(dispatch, ownProps) {
  return {
    GetDetails: () => {
      dispatch(TripService.fetchDetails(ownProps.params.tripID));
    }
  }
}

export default connect(StoreToTripsPage, mapDispatchToTrips)(DetailPageStateful);
