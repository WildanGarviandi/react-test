import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import Table from './tripTable';
import * as TripService from './tripService';
import driversFetch from '../modules/drivers/actions/driversFetch';
import styles from './styles.css';
import * as UtilHelper from '../helper/utility';

const TripPage = React.createClass({
    getInitialState() {
        return ({driverID: null, trips: []})
    },
    componentWillMount() {
        this.props.FetchList();
        this.props.FetchDrivers(this.props.userLogged.userID);
    },
    selectDriver(e) {
        this.setState({driverID: e.key});
    },
    assignTrip() {
        let selectedTrips = lodash.filter(this.props.trips, ['IsChecked', true]);
        if (selectedTrips.length < 1) {
            alert('Must selected one or more trips');
            return;
        }
        if (!this.state.driverID) {
            alert('Driver must be set');
            return;
        }
        var tripPage = this;
        tripPage.props.AssignTrip(selectedTrips, tripPage.state.driverID);
    },
    render() {
        const {paginationState, PaginationAction, drivers, trips} = this.props;
        const assignTripButton = {
            textBase: 'Assign Trip',
            onClick: this.assignTrip,
            styles: {
                base: styles.assignTripButton,
            }
        };
        return (
            <Page title="My Trips">
                <Pagination {...paginationState} {...PaginationAction} />
                <p>
                    <ButtonWithLoading {...assignTripButton} />
                    <Form.DropdownWithState options={drivers} handleSelect={this.selectDriver} />
                </p>
                <Table trips={trips} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToTripsPage(store) {
    const {currentPage, limit, total, trips} = store.app.myTrips;  
    const userLogged = store.app.userLogged;  
    const driversStore = store.app.driversStore;
    const driverList = driversStore.driverList;
    const fleetDrivers = driversStore.fleetDrivers;
    const drivers = lodash.chain(fleetDrivers.dict[userLogged.userID] || []).map((driverID) => {
        return {
            key: driverID,
            value: UtilHelper.UserFullName(driverList.dict[driverID]),
        }
    }).sortBy((arr) => (arr.value)).value();
    return {
        trips: trips,
        drivers: drivers,
        userLogged: userLogged,
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToTripsPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(TripService.FetchList());
        },
        FetchDrivers: (fleetID) => {
            dispatch(driversFetch(fleetID));
        },
        AssignTrip: (trips, driverID) => {
            dispatch(TripService.AssignTrip(trips, driverID));
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(TripService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(TripService.SetLimit(limit));
            },
        }
    }
}

export default connect(StoreToTripsPage, DispatchToTripsPage)(TripPage);