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
import Collapse, { Panel } from 'rc-collapse';

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

const DetailPage = React.createClass({
    componentWillMount() {
        this.props.GetDetails();
    },
    render() {
        const {trip, isFetching} = this.props;
        const Title = "Trip " + trip.ContainerNumber;

        if (isFetching) {
            return (
                <Page title={Title}>
                    <div>
                        Loading
                    </div>
                </Page>
            );
        } else {
            return (
                <Page title={Title}>
                    <div className={styles.tripDetailsHeader}>
                        Trip Information
                    </div>
                    <div className={styles.tripDetailsInformation}>
                        <div className={styles.labelDetails}>
                            Container Number
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.ContainerNumber}
                        </div>
                        <div className={styles.labelDetails}>
                            Driver
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.Driver && trip.Driver.FirstName} {trip.Driver && trip.Driver.LastName}
                        </div>
                        <div className={styles.labelDetails}>
                            Status
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.OrderStatus && trip.OrderStatus.OrderStatus}
                        </div>
                        <div className={styles.labelDetails}>
                            Pickup Address 
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.PickupAddress && trip.PickupAddress.Address1}
                        </div>                       
                        <div className={styles.labelDetails}>
                            Dropoff Address 
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.DropoffAddress && trip.DropoffAddress.Address1}
                        </div>
                        <div className={styles.labelDetails}>
                            Origin Hub 
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.OriginHub && trip.OriginHub.Name}
                        </div>
                        <div className={styles.labelDetails}>
                            Destination Hub 
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.DestinationHub && trip.DestinationHub.Name}
                        </div>
                        <div className={styles.labelDetails}>
                            Step
                        </div>
                        <div className={styles.infoDetails}>
                            {getStep(trip)}
                        </div>
                        <div className={styles.labelDetails}>
                            Pickup Time
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.PickupTime}
                        </div>
                        <div className={styles.labelDetails}>
                            Dropoff Time 
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.DropoffTime}
                        </div>
                        <div className={styles.labelDetails}>
                            Created Time
                        </div>
                        <div className={styles.infoDetails}>
                            {trip.CreatedDate}
                        </div>
                    </div>
                    <div className={styles.tripDetailsHeader}>
                        Order List
                    </div>
                    <div className={styles.tripDetailsInformation}>
                    
                    </div>
                </Page>
            );
        }
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

export default connect(StoreToTripsPage, mapDispatchToTrips)(DetailPage);
