import React from 'react';
import {connect} from 'react-redux';

import {DriversActions} from '../../modules';

import {ButtonWithLoading, DropdownTypeAhead} from '../base';
import styles from './styles.css';

function camelize(str) {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

function DriverFullName(driver) {
  return camelize(`${driver.FirstName} ${driver.LastName} (${driver.CountryCode}${driver.PhoneNumber})`);
};

function FindByFullName(drivers, driverFullName) {
  return _.find(drivers, (driver) => (DriverFullName(driver.Driver) == driverFullName));
}

const DriverSetter = React.createClass({
  getInitialState() {
    return {
      selectedDriver: '',
    };
  },
  driverSet() {
    const {drivers} = this.props;
    const driver = FindByFullName(drivers, this.state.selectedDriver);
    this.props.driverSet(driver.Driver.UserID);
    this.props.validate();
  },
  driverSelect(val) {
    this.setState({
      selectedDriver: val,
    });
  },
  render() {
    const {driver, driversName, hasOrder, isSettingDriver} = this.props;
    const {selectedDriver} = this.state;

    return (
      <div>
        {
          driver &&
          <span>Current Driver: {DriverFullName(driver)}</span>
        }
        {
          !driver &&
          <span>
            <span>Drivers : </span>
            <span className={styles.fillDriverWrapper}>
              <DropdownTypeAhead options={driversName} selectVal={this.driverSelect} val={selectedDriver} />
            </span>
            <ButtonWithLoading textBase="Set Driver" textLoading="Setting Driver" onClick={this.driverSet} isLoading={isSettingDriver} styles={{base: styles.normalBtn}} />
          </span>
        }
      </div>
    );
  }
})

function StateToProps(state, ownProps) {
  const container = state.app.containers.containers[ownProps.containerID];
  const {drivers}= state.app.drivers;
  const driversName = _.chain(drivers)
    .map((driver) => (DriverFullName(driver.Driver)))
    .sortBy((driver) => (driver)).value();

  const driver = container && container.CurrentTrip && container.CurrentTrip.Driver;
  const {isSettingDriver} = container;

  return {
    driver, drivers, driversName,
    isSettingDriver,
  }
}

function DispatchToProps(dispatch, ownProps) {
  return {
    driverSet: function(driverID) {
      dispatch(DriversActions.driverSet(ownProps.containerID, driverID));
    },
  }
}

export default connect(StateToProps, DispatchToProps)(DriverSetter);
