import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';

import * as UtilHelper from '../../helper/utility';
import {DriversActions} from '../../modules';
import FleetSet from '../../modules/drivers/actions/fleetSet';
import FleetsFetch from '../../modules/drivers/actions/fleetsFetch';
import * as TripDetails from '../../modules/inboundTripDetails';
import {CanAssignFleet} from '../../modules/trips';

import {ButtonBase, ButtonWithLoading, DropdownTypeAhead} from '../base';
import styles from './styles.css';

const DriverSetter = React.createClass({
  componentWillMount() {
    this.props.FleetsFetch();
  },
  // componentWillReceiveProps(nextProps) {
  //   this.setState({
  //     selectedFleet: {value: nextProps.fleetName},
  //   });
  // },
  getInitialState() {
    return {
      selectedDriver: {value: ''},
      changingFleet: false,
      selectedFleet: {value: this.props.fleetName},
      showDriverSelect: false
    };
  },
  driverSet() {
    this.props.DriverSet(this.props.trip.TripID, this.state.selectedDriver.key);
  },
  driverSelect(driver) {
    this.setState({
      selectedDriver: driver,
    });
  },
  fleetSelect(fleet) {
    this.setState({
      selectedFleet: fleet,
    });
  },
  fleetSet() {
    this.props.FleetSet(this.props.trip.TripID, this.state.selectedFleet.key);
  },
  fleetChangeEnd() {
    this.props.FleetChangeEnd();
  },
  fleetChangeStart() {
    this.setState({
      selectedFleet: {},
    });
    this.props.FleetChangeStart();
  },
  render() {
    const {canPickFleet, driverName, drivers, driversFleetName, fleetName, fleets, suggestion, isFetchingDriver, isFetchingFleet, isSettingDriver} = this.props;
    const {selectedDriver, showDriverSelect} = this.state;

    const {assignedFleet, canAssignFleet, fleet, isChangingFleet, isSetFleet, isInbound} = this.props;

    let reorderedFleets = [].concat(fleets);

    if (suggestion && suggestion.length > 0 && fleets.length > 0) {
      suggestion.forEach(function (val) {
        let index = _.findIndex(reorderedFleets, { key: val.fleetID });
        if (index !== -1) {
          let data = reorderedFleets[index];
          data.value = val.companyName + ' (' + val.capacity +
                                            '/' + val.ovl + ')';
          reorderedFleets.splice(index, 1);
          reorderedFleets.unshift(data);
        }
      });
    }

    return (
      <div>
        <span className={styles.line}>
          <span>Fleets : </span>
          {
            isFetchingFleet &&
            <span>Fetching Fleet List...</span>
          }
          {
            !isFetchingFleet &&
            <span>
            {
              !isChangingFleet &&
              <span>
                <span>{fleetName}</span>
                {
                  canAssignFleet &&
                  <ButtonBase onClick={this.fleetChangeStart} styles={styles.driverBtn}>Change Fleet</ButtonBase>
                }
              </span>
            }
            {
              isChangingFleet &&
              <span>
                <span className={styles.fillDriverWrapper}>
                <DropdownTypeAhead options={(isInbound) ? fleets : reorderedFleets} selectVal={this.fleetSelect} val={this.state.selectedFleet.value} />
                </span>
                <ButtonWithLoading textBase="Set Fleet" textLoading="Setting Fleet" onClick={this.fleetSet} isLoading={isSetFleet} styles={{base: styles.normalBtn}} />
                {
                  fleetName &&
                  <ButtonBase onClick={this.fleetChangeEnd} styles={styles.driverBtn}>Cancel</ButtonBase>
                }
                <div className={styles.noteText}>
                  <strong>Notes:&nbsp;</strong>
                  <span>
                    The number shows OVL. 90/100 meaning the vendor can accept 90 more orders out of his 100 capacity.
                  </span>
                </div>
              </span>
            }
            </span>
          }
        </span>
        {
          fleet && showDriverSelect &&
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
              <span>{driverName} {driversFleetName}</span>
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
        }
        <span style={{clear: 'both'}} />
      </div>
    );
  }
});

function StateToProps(state, ownProps) {
  const {inboundTripDetails, tripDetails} = state.app;
  const container = {CurrentTrip: inboundTripDetails.trip};
  const trip = ownProps.trip;

  const canAssignFleet = CanAssignFleet(trip);
  const assignedFleet = inboundTripDetails.fleet;
  const {fleet, isChangingFleet, isSetFleet} = inboundTripDetails;

  const driversStore = state.app.driversStore;
  const fleetDrivers = driversStore.fleetDrivers;

  const fleetList = driversStore.fleetList;
  const isFetchingFleet = fleetList.isLoading;
  let fleets = _.chain(fleetList.shown)
    .map((fleetID) => {
      return {
        key: fleetID,
        value: UtilHelper.FleetName(fleetList.dict[fleetID]),
      }
    })
    .value();

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

  const driver = inboundTripDetails.driver;
  const driverName =  UtilHelper.UserFullName(driver);
  // const fleet = fleetList.dict[fleetDrivers.active];
  // const fleetName = UtilHelper.FleetName(fleet);
  let fleetName = UtilHelper.FleetName(inboundTripDetails.fleet);
  if(inboundTripDetails.fleet) {
    fleetName = UtilHelper.FleetName(fleetList.dict[inboundTripDetails.fleet.UserID]);
  }

  const driversFleetName = "";
  const {isSettingDriver} = container;

  const canPickFleet = state.app.userLogged.isCentralHub;

  return {
    canPickFleet,
    driverName, drivers, driversFleetName, fleetName, fleets,
    isFetchingDriver, isFetchingFleet,
    isSettingDriver: inboundTripDetails.isSetDriver,

    assignedFleet, canAssignFleet, isSetFleet,
    isChangingFleet: isChangingFleet || !inboundTripDetails.fleet,
    fleet: inboundTripDetails.fleet,
    trip: inboundTripDetails.trip,
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    DriverSet(tripID, driverID) {
      dispatch(TripDetails.AssignDriver(tripID, driverID));
    },
    FleetSet(tripID, fleetID) {
      dispatch(TripDetails.AssignFleet(tripID, fleetID));
    },
    FleetsFetch() {
      dispatch(FleetsFetch());
    },
    FleetChangeEnd() {
      dispatch(TripDetails.ChangeFleetEnd());
    },
    FleetChangeStart() {
      console.log('change!!');
      dispatch(TripDetails.ChangeFleetStart());
    },
  }
}

export default connect(StateToProps, DispatchToProps)(DriverSetter);
