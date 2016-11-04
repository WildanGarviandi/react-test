import React from 'react';
import {connect} from 'react-redux';
import * as UtilHelper from '../helper/utility';
import {DriversActions} from '../modules';
import {ButtonBase, ButtonWithLoading, DropdownTypeAhead} from '../views/base';
import * as TripService from './tripService';
import styles from './styles.css';

const DriverSetter = React.createClass({
  getInitialState() {
    return {
      currentDriver: {
        key: this.props.driverID,
        value: this.props.driverName
      },
      selectedDriver: {
        key: this.props.driverID,
        value: this.props.driverName
      }
    };
  },
  driverSet() {
    if (this.state.currentDriver.key)
      this.props.DriverReassign(this.props.trip.TripID, this.state.selectedDriver.key);
    else
      this.props.DriverAssign(this.props.trip.TripID, this.state.selectedDriver.key);
  },
  driverSelect(driver) {
    this.setState({
      selectedDriver: driver,
    });
  },
  render() {
    const {drivers, isFetchingDriver, fleet, isFetchingFleet, isSettingDriver, close} = this.props;
    const {selectedDriver} = this.state;

    return (
      <div>
        {
          fleet &&
          <span>
            {
              isFetchingFleet &&
              <span>Waiting for Fleet Data...</span>
            }
            {
              !isFetchingFleet && isFetchingDriver &&
              <span>Fetching Driver List...</span>
            }
            {
              !isFetchingFleet && !isFetchingDriver &&
              <span>
                <span className={styles.fillDriverWrapper}>
                  <DropdownTypeAhead options={drivers} selectVal={this.driverSelect} val={selectedDriver.value} />
                </span>
                <ButtonWithLoading textBase="Set" textLoading="Setting Driver" onClick={this.driverSet} isLoading={isSettingDriver} styles={{base: styles.normalBtn}} />
                <ButtonWithLoading textBase="Cancel" textLoading="Setting Driver" onClick={close} isLoading={isSettingDriver} styles={{base: styles.normalBtn}} />
              </span>
            }
          </span>
        }
        <span style={{clear: 'both'}} />
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const trip = ownProps.trip;
  const fleet = trip.FleetManager;

  const driversStore = state.app.driversStore;
  const fleetDrivers = driversStore.fleetDrivers;

  const fleetList = driversStore.fleetList;
  const isFetchingFleet = fleetList.isLoading;

  const driverList = driversStore.driverList;
  const isFetchingDriver = driverList.isLoading;
  const drivers = _.chain(fleetDrivers.dict[fleet && fleet.UserID] || [])
    .map((driverID) => {
      return {
        key: driverID,
        value: UtilHelper.UserFullName(driverList.dict[driverID]),
      }
    })
    .value();

  const driver = trip.Driver;
  const driverID = driver ? driver.UserID : '';
  const driverName =  driver ? UtilHelper.UserFullName(driver) : '';

  const isSettingDriver = state.app.myTrips.isSettingDriver;

  return {
    fleet, isFetchingFleet,
    driverID, driverName, drivers, isFetchingDriver, 
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    DriverAssign(tripID, driverID) {
      dispatch(TripService.AssignDriver(tripID, driverID));
    },
    DriverReassign(tripID, driverID) {
      dispatch(TripService.ReassignDriver(tripID, driverID));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(DriverSetter);
