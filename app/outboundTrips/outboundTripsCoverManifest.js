import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import tripManifestStyle from './outboundTripsManifest.css';
import * as OutboundTrips from './outboundTripsService';
import QRCode from 'qrcode.react';
import {formatDate} from '../helper/time';

const CoverTripManifestPage = React.createClass({
  componentWillMount() {
    this.props.detailsFetch(this.props.params.tripID);
  },
  componentWillReceiveProps(nextProps) {
    if(this.props.params.tripID !== nextProps.params.tripID) {
      this.props.detailsFetch(nextProps.params.tripID);
    }
  },
  componentDidUpdate(prevProps) {
    if (this.props.trip !== prevProps.trip) {
      // when page is rendered with trip & order details, print
      document.title = "#TRIP-" + this.props.trip.TripID;
      window.print();
    }
  },
  generateAddressMarkup(address) {
    let addressDetail = [address.City, address.State, address.ZipCode].filter((obj) => {
      return obj !== null;
    });
    addressDetail = addressDetail.length > 0 ? addressDetail.join(', ') : null;
    return (
      <div>
        <div>{address.Address1}</div>
        {
          addressDetail !== null &&
          <div>{addressDetail}</div>
        }
        {
          address.Country !== null &&
          <div>{address.Country}</div>
        }
      </div>
    );
  },
  render() {

    const { isFetching, orders, trip } = this.props;

    let tripType, nextDestination, assignedTo;
    if (trip) {
      if (trip.FleetManager) {
        assignedTo = trip.FleetManager.CompanyDetail.CompanyName;
      } else if (trip.ExternalTrip) {
        assignedTo = trip.ExternalTrip.Transportation + ' - ' + trip.ExternalTrip.AwbNumber;
      } else {
        assignedTo = '-';
      }
      if (trip.DestinationHub && trip.OriginHub) {
        tripType = 'Interhub';
        nextDestination = `Hub ${trip.DestinationHub.Name} (${assignedTo})`;
      } else if (!trip.OriginHub && trip.DestinationHub) {
        tripType = 'First Leg';
        nextDestination = `Hub ${trip.DestinationHub.Name} (${assignedTo})`;
      } else if (trip.Driver || trip.FleetManager || trip.ExternalTrip) {
        tripType = 'Last Mile';
        nextDestination = `${assignedTo}`;
      } else {
  
        tripType = 'No Destination Yet'
      }
    }

    return (
      <div>
        {
          // fetching data
          isFetching &&
          <h3>Fetching Trip Details...</h3>
        }
        {
          // trip & orders data is ready to be rendered
          !isFetching && trip !== null &&
          <div className={tripManifestStyle.container}>
            <div className={tripManifestStyle.logo}>
              <img src="/img/app-icon.png" alt="Etobee Icon" />
              <p>etobee</p>
            </div>
            <div className={tripManifestStyle.currentDate}>{moment().format('LL')}</div>
            <div className={tripManifestStyle.contentCover}>
              <h1 className={tripManifestStyle.contentTitle}>Trip Manifest</h1>
              <div className={tripManifestStyle.mainInfoCover}>
                <div>
                  <QRCode
                    value={'TRIP-' + trip.TripID + ''}
                    size={60}
                    className={tripManifestStyle.qrcode}
                  />
                  </div>
                <h2>#TRIP-{trip.TripID}</h2>  
                <h5>Total: {trip.UserOrderRoutes.length} orders</h5>
                <h6>Pickup Time: {formatDate(trip.PickupTime)}</h6>
              </div>
              <div className={tripManifestStyle.addressCardContainer}>
                <div className={tripManifestStyle.addressCard}>
                  <p>From</p>
                  {
                    trip.PickupAddress &&
                    this.generateAddressMarkup(trip.PickupAddress)
                  }
                </div>
                <div className={tripManifestStyle.addressCard}>
                  <p>To</p>
                  {tripType + ' - ' + nextDestination}
                </div>
              </div>
              <div className={tripManifestStyle.acknowledgementContainer}>
                <div className={tripManifestStyle.acknowledgement}>
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    );
  }
});

function StateToProps(store) {
  const {outboundTripsService} = store.app;
  const {isFetching, orders, trip} = outboundTripsService;

  return {
    isFetching,
    orders,
    trip
  }
}

function DispatchToProps(dispatch) {
  return {
    detailsFetch: function(id) {
      dispatch(OutboundTrips.FetchDetails(id));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(CoverTripManifestPage);
