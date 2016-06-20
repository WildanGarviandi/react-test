import React from 'react';
import {connect} from 'react-redux';

import * as UtilHelper from '../../helper/utility';
import {DriversActions} from '../../modules';
import FleetSet from '../../modules/drivers/actions/fleetSet';
import FleetsFetch from '../../modules/drivers/actions/fleetsFetch';

import {ButtonWithLoading, DropdownTypeAhead} from '../base';
import styles from './styles.css';

const DriverSetter = React.createClass({
  componentWillMount() {
    this.props.FleetsFetch();
  },
  getInitialState() {
    return {
      selectedDriver: {value: ''},
    };
  },
  driverSet() {
    this.props.DriverSet(this.state.selectedDriver.key);
    this.props.validate();
  },
  driverSelect(driver) {
    this.setState({
      selectedDriver: driver,
    });
  },
  fleetSelect(fleet) {
    this.props.FleetSet(fleet.key);
    this.setState({
      selectedDriver: {value: ''},
    });
  },
  render() {
    const {canPickFleet, driverName, drivers, driversFleetName, fleetName, fleets, isFetchingDriver, isFetchingFleet, isSettingDriver} = this.props;
    const {selectedDriver} = this.state;

    return (
      <div>
        {
          !driverName && canPickFleet &&
          <span className={styles.line}>
            <span>Fleets : </span>
            <span className={styles.fillDriverWrapper}>
              {
                isFetchingFleet &&
                <span>Fetching Fleet List...</span>
              }
              {
                !isFetchingFleet &&
                <DropdownTypeAhead options={fleets} selectVal={this.fleetSelect} val={fleetName} />
              }
            </span>
          </span>
        }
        <span>
          <span>Driver : </span>
          {
            isFetchingFleet &&
            <span>Waiting for Fleet Data...</span>
          }
          {
            !isFetchingFleet && isFetchingDriver &&
            <span>Fetching Driver List...</span>
          }
          {
            !isFetchingFleet && !isFetchingDriver && driverName &&
            <span>{driverName} / {driversFleetName}</span>
          }
          {
            !isFetchingFleet && !isFetchingDriver && !driverName &&
            <span>
              <span className={styles.fillDriverWrapper}>
                <DropdownTypeAhead options={drivers} selectVal={this.driverSelect} val={selectedDriver.value} />
              </span>
              <ButtonWithLoading textBase="Set Driver" textLoading="Setting Driver" onClick={this.driverSet} isLoading={isSettingDriver} styles={{base: styles.normalBtn}} />
            </span>
          }
        </span>
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const container = state.app.containers.containers[ownProps.containerID];
  const driversStore = state.app.driversStore;
  const fleetDrivers = driversStore.fleetDrivers;

  const fleetList = driversStore.fleetList;
  const isFetchingFleet = fleetList.isLoading;
  const fleets = _.chain(fleetList.shown)
    .map((fleetID) => {
      return {
        key: fleetID,
        value: UtilHelper.FleetName(fleetList.dict[fleetID]),
      }
    })
    .value();

  const driverList = driversStore.driverList;
  const isFetchingDriver = driverList.isLoading;
  const drivers = _.chain(fleetDrivers.dict[fleetDrivers.active] || [])
    .map((driverID) => {
      return {
        key: driverID,
        value: UtilHelper.UserFullName(driverList.dict[driverID].Driver),
      }
    })
    .value();

  const driver = container && container.CurrentTrip && container.CurrentTrip.Driver;
  const driverName =  UtilHelper.UserFullName(driver);
  const fleet = fleetList.dict[fleetDrivers.active];
  const fleetName = UtilHelper.FleetName(fleet);
  const driversFleetName = container.CurrentTrip.Driver && container.CurrentTrip.Driver.Driver.FleetManager.CompanyDetail.CompanyName;
  const {isSettingDriver} = container;

  const canPickFleet = state.app.userLogged.isCentralHub;

  return {
    canPickFleet,
    driverName, drivers, driversFleetName, fleetName, fleets,
    isFetchingDriver, isFetchingFleet,
    isSettingDriver,
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    DriverSet(driverID) {
      dispatch(DriversActions.driverSet(ownProps.containerID, driverID));
    },
    FleetSet(fleetID) {
      dispatch(FleetSet(fleetID));
    },
    FleetsFetch() {
      dispatch(FleetsFetch());
    },
  }
}

export default connect(StateToProps, DispatchToProps)(DriverSetter);
