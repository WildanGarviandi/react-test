import React, { Component } from 'react';
import * as _ from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import classnaming from 'classnames';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import Countdown from 'react-cntdwn';

import * as inboundTrips from './inboundTripsService';
import * as NearbyFleets from '../nearbyFleets/nearbyFleetService';
import { DropdownTypeAhead, Input, Pagination, ButtonStandard } from '../views/base';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from '../views/base/table.css';
import StatusDropdown from '../views/base/statusDropdown';
import { TripParser } from '../modules/trips';
import { OrderParser } from '../modules/orders';
import { formatDate } from '../helper/time';
import { modalAction } from '../modules/modals/constants';
import stylesModal from '../views/base/modal.css';
import styles from '../inboundTrips/styles.css';
import BodyRow, { CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell, ButtonCell, IDCell } from '../views/base/cells';
import { CheckboxHeader, CheckboxCell } from '../views/base/tableCell';
import { FilterTop, FilterText } from '../components/form';
import config from '../config/configValues.json';
import * as UtilHelper from '../helper/utility';
import { Pagination3 } from '../components/pagination3';

let fleetList = [];
let driverList = [];
let driverVendorList = [];
let selectedDriver = null;
let selectedDriverName = null;
let selectedFleet = null;
let selectedFleetName = null;
let selectedDriverVendor = null;
let isDriverExceed = false;
let isFleetExceed = false;
let selectedVehicleID = 1;

function ProcessTrip(trip) {
  if (trip.TripID) {
    const parsedTrip = TripParser(trip);
    const fleet = trip.FleetManager && fleetList[trip.FleetManager.UserID];
    const fleetName = fleet && fleet.CompanyDetail && fleet.CompanyDetail.CompanyName;

    return {
      key: trip.TripID,
      pickup: trip.PickupAddress && trip.PickupAddress.Address1,
      pickupCity: trip.PickupAddress && trip.PickupAddress.City,
      pickupZip: trip.PickupAddress && trip.PickupAddress.ZipCode,
      webstoreNames: parsedTrip.WebstoreNames,
      quantity: trip.UserOrderRoutes.length,
      tripID: `${trip.TripID}`,
      weight: parsedTrip.Weight,
      isTrip: true,
      deadline: trip.Deadline,
      IsChecked: trip.IsChecked
    }
  } else {
    return {
      key: trip.UserOrderID,
      pickup: trip.PickupAddress && trip.PickupAddress.Address1,
      pickupCity: trip.PickupAddress && trip.PickupAddress.City,
      pickupZip: trip.PickupAddress && trip.PickupAddress.ZipCode,
      quantity: 1,
      webstoreNames: trip.User && `${trip.User.FirstName} ${trip.User.LastName}`,
      tripID: `${trip.UserOrderID}`,
      weight: trip.PackageWeight,
      isTrip: false,
      deadline: trip.Deadline,
      IsChecked: trip.IsChecked,
      orderID: `${trip.UserOrderNumber} (${trip.WebOrderID})`
    }
  }
}

class Fleet extends Component {
  render() {
    let fleetComponents = fleetList.map((fleet, idx) => {
      let vendorLoad = styles.vendorLoad;
      let availableLoad = fleet.CurrentLoad;
      let rowStyle = styles.vendorInformation;
      let capacity = fleet.FleetManager && fleet.FleetManager.CompanyDetail.OrderVolumeLimit;
      if (fleet.FleetManagerID === this.props.selectedFleet) {
        vendorLoad = styles.vendorLoadSelected;
        availableLoad = parseInt(availableLoad) + parseInt(this.props.sumOrders);
        rowStyle = styles.vendorInformationSelected;
        selectedFleetName = fleet.FleetManager && fleet.FleetManager.CompanyDetail && fleet.FleetManager.CompanyDetail.CompanyName;
        if (availableLoad > capacity) {
          vendorLoad = styles.vendorLoadSelectedExceed;
          rowStyle = styles.vendorInformationSelectedExceed;
          isFleetExceed = true;
        } else {
          isFleetExceed = false;
        }
      }
      return (
        <div
          key={idx}
          onClick={this.props.chooseFleet.bind(null, fleet.FleetManagerID)}
          className={rowStyle}
        >
          <div className={styles.maskInput}>
            <img src={fleet.FleetManagerID === this.props.selectedFleet ? '/img/icon-radio-on.png' : '/img/icon-radio-off.png'} />
          </div>
          <div className={styles.maskName}>
            <span className={styles.vendorName}>
              {fleet.FleetManager && fleet.FleetManager.CompanyDetail && fleet.FleetManager.CompanyDetail.CompanyName}
            </span>
          </div>
          <div className={styles.maskLoad}>
            <img className={styles.vendorLoadImage} src="/img/icon-grouping.png" />
            <span className={vendorLoad}>
              {availableLoad} / {capacity}
            </span>
          </div>
        </div>
      );
    });
    return <div>{fleetComponents}</div>;
  }
}

class AssignVendor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFleet,
    };
  }

  chooseFleet(id) {
    selectedFleet = id;
    this.setState({ selectedFleet: id });
  }

  render() {

    return (
      <div>
        <div className={styles.mainAssignBox}>
          <div>
            <div className={styles.modalDesc}>
              <div className={styles.mainLabelWebstore}>
                {this.props.trip.ListWebstoreMores}
              </div>
              <div className={styles.secondLabel}>
                {this.props.trip.PickupAddress && this.props.trip.PickupAddress.City}
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc2}>
              <div className={styles.secondLabel}>
                Total Weight
              </div>
              <div className={styles.mainLabel}>
                {this.props.trip.Weight} kg
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc3}>
              <div className={styles.secondLabel}>
                Quantity
              </div>
              <div className={styles.mainLabel}>
                {this.props.trip.UserOrderRoutes.length}
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc4}>
              <div className={styles.secondLabel}>
                Please choose a vendor that you want to assign with this trip.
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
        <div className={styles.vendorList}>
          {fleetList.length > 0 &&
            <div>
              <Fleet
                chooseFleet={this.chooseFleet}
                selectedFleet={this.state.selectedFleet}
                sumOrders={this.props.trip.UserOrderRoutes.length}
              />
            </div>
          }
          {fleetList.length === 0 &&
            <div className={styles.noTransportation}>
              No hub found for this trip
            </div>
          }
        </div>
        <div>
          {!this.state.selectedFleet &&
            <div className={styles.notesBelow}>
              Please select a hub for this trip and click on button to continue.
            </div>
          }
          {this.state.selectedFleet &&
            <div className={styles.notesBelow}>
              You have selected a hub for this trip! Please click on this button to continue.
            </div>
          }
          <div>
            <button
              disabled={!this.state.selectedFleet}
              className={styles.buttonAssign}
              onClick={this.props.assignFleet}
            >
              Assign to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class Driver extends Component {
  render() {
    let driverComponents = driverList.map(function (driver, idx) {
      let rowStyle = styles.vendorInformation;
      let driverWeightStyle = styles.driverWeight;
      let availableWeight = driver.CurrentWeight;
      let capacity = driver.Vehicle && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle
        ? config.motorcycleMaxWeight : config.vanMaxWeight;
      if (driver.UserID === this.props.selectedDriver) {
        rowStyle = styles.vendorInformationSelected;
        driverWeightStyle = styles.driverWeightSelected;
        availableWeight = parseFloat(availableWeight) + parseFloat(this.props.weight);
        selectedDriverName = driver.FirstName + ' ' + driver.LastName;
        if (availableWeight > capacity) {
          driverWeightStyle = styles.driverWeightSelectedExceed;
          rowStyle = styles.vendorInformationSelectedExceed;
          isDriverExceed = true;
        } else {
          isDriverExceed = false;
        }
      }
      return (
        <div
          key={driver.UserID}
          onClick={this.props.chooseDriver.bind(null, driver.UserID)}
          className={rowStyle}
        >
          <div className={styles.driverInput}>
            <img src={driver.UserID === this.props.selectedDriver ? '/img/icon-radio-on.png' : '/img/icon-radio-off.png'} />
          </div>
          <div className={styles.driverPicture}>
            <img
              src={driver.Vehicle &&
                driver.Vehicle.VehicleID === config.vehicleType.Motorcycle ?
                '/img/icon-vehicle-motorcycle.png' : '/img/icon-vehicle-van.png'}
            />
          </div>
          <table className={styles.driverMaskName}>
            <tr>
              <span className={styles.driverName}>{UtilHelper.trimString(`${driver.FirstName} ${driver.LastName}`, 25)}</span>
            </tr>
          </table>
          <table className={styles.driverLocation}>
            <tr>
              From Pickup Location
            </tr>
            <tr className={styles.driverMaskLoad}>
              <img className={styles.vendorLoadImage} src="/img/icon-location.png" />
              <span className={styles.vendorLoad}>{driver.DistanceToNearestPickup || 'N/A'} km</span>
            </tr>
          </table>
        </div>
      );
    }.bind(this));
    return <div>{driverComponents}</div>;
  }
}

class AssignDriver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedVehicle: 'Motorcycle',
      allowNoSeparate: false,
      selectedDriver,
    };
  }

  chooseVehicle(vehicle) {
    this.setState({ selectedVehicle: vehicle.value });
    selectedVehicleID = vehicle.key;
  }

  noSeparate() {
    this.setState({ allowNoSeparate: true });
  }

  chooseDriver(id) {
    selectedDriver = id;
    this.setState({ selectedDriver: id });
  }

  searchDriver(e) {
    if (e.key === 'Enter') {
      const newFilters = { ['name']: e.target.value };
      this.props.updateAndFetchDrivers(newFilters);
      this.props.fetchDrivers();
    }
  }

  enterDriverSearch(e) {
    const newFilters = { ['name']: e.target.value };
    this.props.updateFiltersDrivers(newFilters);
  }

  render() {
    const vehicleList = config.vehicle;

    return (
      <div>
        <div className={styles.panelDriverSearch}>
          <input
            className={styles.inputDriverSearch}
            onChange={this.enterDriverSearch}
            onKeyPress={this.searchDriver}
            placeholder={'Search Driver...'}
          />
        </div>
        <div className={styles.driverList}>
          {this.props.isFetchingDriver &&
            <div className={styles.searchingDriver}>
              <img className={styles.searchingIcon} src="/img/icon-search-color.png" />
              <br />
              <span className={styles.searchingSpan}>
                Searching....
              </span>
              <br />
              <div className={styles.searchingNotes}>
                We will search for the best driver suitable for the job,
                 based on their location to the pickup location
              </div>
            </div>
          }
          {!this.props.isFetchingDriver && driverList.length > 0 &&
            <Driver
              selectedVehicle={this.state.selectedVehicle}
              noSplit={this.state.allowNoSeparate}
              chooseDriver={this.chooseDriver}
              selectedDriver={this.state.selectedDriver}
              weight={this.props.trip.Weight}
            />
          }
          {!this.props.isFetchingDriver && driverList.length === 0 &&
            <div className={styles.noTransportation}>
              No driver found for this trip
            </div>
          }
        </div>
        <Pagination3 {...this.props.paginationState} {...this.props.PaginationAction} />
        <div>
          {this.props.trip.Weight > config.motorcycleMaxWeight && this.state.selectedVehicle === 'Motorcycle'
            && !this.state.allowNoSeparate &&
            <div className={styles.notesBelow}>
              Please choose if you want to divide this trip or not before you can continue
            </div>
          }
          <div>
            <button
              disabled={!this.state.selectedDriver}
              className={styles.buttonAssign}
              onClick={this.props.assignDriver}
            >
              Assign to Driver
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class DriverVendor extends Component {
  render() {
    var driverComponents = driverVendorList.map(function (driver, idx) {
      let rowStyle = styles.vendorInformation;
      let driverWeightStyle = styles.driverWeight;
      if (driver.UserID === this.props.selectedDriver) {
        rowStyle = styles.vendorInformationSelected;
        driverWeightStyle = styles.driverWeightSelected;
      }
      return (
        <div
          key={driver.UserID}
          onClick={this.props.chooseDriver.bind(null, driver.UserID)}
          className={rowStyle}
        >
          <div className={styles.driverInput}>
            <img src={driver.UserID === this.props.selectedDriver ? '/img/icon-radio-on.png' : '/img/icon-radio-off.png'} />
          </div>
          <div className={styles.driverPicture}>
            <img
              src={driver.Vehicle && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle ?
                '/img/icon-vehicle-motorcycle.png' : '/img/icon-vehicle-van.png'}
            />
          </div>
          <table className={styles.driverMaskName}>
            <tr>
              <span className={styles.driverName}>{driver.FirstName} {driver.LastName}</span>
            </tr>
          </table>
        </div>
      );
    }.bind(this));
    return <div>{driverComponents}</div>;
  }
}

class AssignDriverVendor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDriverVendor,
    };
  }

  chooseDriver(id) {
    selectedDriverVendor = id;
    this.setState({ selectedDriverVendor: id });
  }

  render() {
    return (
      <div>
        <div className={styles.mainAssignBox}>
          <div>
            <div className={styles.modalDesc}>
              <div className={styles.mainLabelWebstore}>
                {this.props.trip.ListWebstoreMores}
              </div>
              <div className={styles.secondLabel}>
                {this.props.trip.PickupAddress && this.props.trip.PickupAddress.City}
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc2}>
              <div className={styles.secondLabel}>
                Total Weight
              </div>
              <div className={styles.mainLabel}>
                {this.props.trip.Weight} kg
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc3}>
              <div className={styles.secondLabel}>
                Quantity
              </div>
              <div className={styles.mainLabel}>
                {this.props.trip.UserOrderRoutes && this.props.trip.UserOrderRoutes.length}
              </div>
            </div>
            <div className={styles.borderDesc} />
            <div className={styles.modalDesc4}>
              <div className={styles.secondLabel}>
                Please choose the drivers vendor
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
        <div className={styles.driverList}>
          <DriverVendor
            hooseDriver={this.chooseDriver}
            selectedDriver={this.state.selectedDriverVendor}
          />
        </div>
        <div>
          <div>
            <button
              disabled={!this.state.selectedDriverVendor}
              className={styles.buttonAssign}
              onClick={this.props.assignDriver}
            >
              Assign to Driver
            </button>
          </div>
        </div>
      </div>
    );
  }
}

function TripDetails ({ trip }) {
  return (
    <div className={styles['trip-details-container']}>
      <div className={styles.row}>
        <div className={styles.section}>
          <div className={styles.label}>Order ID</div>
          <div className={styles.value}>
            {`TRIP-${trip.TripID}`}
          </div>
        </div>
        <div className={styles.separator} />
        <div className={styles.section}>
          <div className={styles.label}>Total Weight</div>
          <div className={styles.value}>
            {`${trip.Weight} kg`}
          </div>
        </div>
        <div className={styles.separator} />
        <div className={styles.section}>
          <div className={styles.label}>Quantity</div>
          <div className={styles.value}>
            {trip.UserOrderRoutes && trip.UserOrderRoutes.length}
          </div>
        </div>
        <div className={styles.separator} />
        <div className={styles.section}>
          <div className={styles.label}>Origin</div>
          <div className={styles.value}>
            {trip.WebstoreNames}
          </div>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.section}>
          <div className={styles.label}>Child Merchant</div>
          <div className={styles.value}>
            {trip.WebstoreUser}
          </div>
        </div>
        <div className={styles.separator} />
        <div className={styles.section}>
          <div className={styles.label}>
            {trip.PickupAddress && trip.PickupAddress.Address1}
          </div>
        </div>
      </div>
    </div>
  );
}

class InboundTripsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showVendor: false,
      showDriver: false,
    };
  }

  componentWillMount() {
    if (this.props.trip.FleetManager) {
      this.props.FetchDriverVendorList(this.props.trip.FleetManager.UserID)
    }
  }

  activateVendor() {
    this.setState({ showVendor: true });
    this.setState({ showDriver: false });
    selectedFleet = null;
    selectedDriver = null;
  }

  activateDriver() {
    this.setState({ showVendor: false });
    this.setState({ showDriver: true });
    selectedFleet = null;
    selectedDriver = null;
  }

  closeModal() {
    this.props.HideModal();
    // this.activateDriver();
  }

  assignDriver() {
    if (!selectedDriver) {
      alert('Please select driver first');
      return;
    }
    if (isDriverExceed) {
      if (confirm('Are you sure you want to assign ' + this.props.trip.Weight + ' kg to ' + selectedDriverName + '?')) {
        this.props.DriverSet(this.props.trip.TripID, selectedDriver);
      }
    } else {
      this.props.DriverSet(this.props.trip.TripID, selectedDriver);
    }
  }

  assignFleet() {
    if (!selectedFleet) {
      alert('Please select fleet first');
      return;
    }
    if (isFleetExceed) {
      if (confirm('Are you sure you want to assign ' + this.props.trip.Weight + ' kg to ' + selectedFleetName + '?')) {
        this.props.FleetSet(this.props.trip.TripID, selectedFleet);
      }
    } else {
      this.props.FleetSet(this.props.trip.TripID, selectedFleet);
    }
  }

  assignDriverVendor() {
    if (!selectedDriverVendor) {
      alert('Please select driver first');
      return;
    }
    this.props.DriverSet(this.props.trip.TripID, selectedDriverVendor);
  }

  render() {
    const trip = this.props.currentTrip;

    return (
      <div>
        {
          this.props.showReAssignModal &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div>
                  <div className={styles.modalTitle}>
                    Re-Assign Orders
                  </div>
                  <div role="button" onClick={() => this.closeModal()} className={styles.modalClose}>
                    &times;
                  </div>
                  <TripDetails trip={trip} />
                  <div className={styles.toggleAssignMain}>
                    <div
                      role="button"
                      onClick={() => this.activateDriver()}
                      className={this.state.showDriver ?
                      styles.toggleAssignActive :
                      styles.toggleAssign}
                    >
                      Re-Assign To My Driver
                    </div>
                    <div className={styles.arbitToggleAssign}> | </div>
                    <div
                      role="button"
                      onClick={() => this.activateVendor()}
                      className={this.state.showVendor ?
                      styles.toggleAssignActive :
                      styles.toggleAssign}
                    >
                      Re-Assign To Hub
                    </div>
                  </div>
                  {this.state.showDriver &&
                    <AssignDriver
                      paginationState={this.props.paginationStateDrivers}
                      PaginationAction={this.props.PaginationActionDrivers}
                      trip={this.props.trip}
                      assignDriver={this.assignDriver}
                      isFetchingDriver={this.props.isFetchingDriver}
                      updateAndFetchDrivers={this.props.UpdateAndFetchDrivers}
                      updateFiltersDrivers={this.props.UpdateFiltersDrivers}
                      fetchDrivers={this.props.FetchDrivers}
                    />
                  }
                  {
                    this.state.showVendor && driverVendorList.length === 0 &&
                    <AssignVendor trip={trip} assignFleet={this.assignFleet} />
                  }
                  {
                    this.state.showVendor && driverVendorList.length > 0 &&
                    <AssignDriverVendor
                      trip={trip}
                      assignDriver={this.assignDriverVendor}
                    />
                  }
                </div>
              </div>
            </ModalDialog>
          </ModalContainer>
        }
      </div>
    );
  }
}

function StateToProps(state) {
  const { inboundTrips, driversStore } = state.app;
  const {
    tripActive,
    currentTrip,
    showReAssignModal,
    drivers,
    isFetchingDriver,
    currentPageDrivers,
    limitDrivers,
    totalDrivers
  } = inboundTrips;
  
  const { fleets, driversVendors } = state.app.nearbyFleets;
  fleetList = fleets;
  console.log(drivers,'drivers');
  driverList = drivers;
  driverVendorList = driversVendors;

  const trip = TripParser(tripActive)

  return {
    currentTrip,
    trip,
    isFetchingDriver,
    paginationStateDrivers: {
      currentPage: currentPageDrivers,
      limit: limitDrivers,
      total: totalDrivers
    },
    showReAssignModal,
  };
}

function DispatchToProps(dispatch) {
  return {
    CloseModal() {
      dispatch(inboundTrips.HideAssignModal());
      dispatch(inboundTrips.HideDetails());
      dispatch(NearbyFleets.ResetVendorList());
    },
    DriverSet(tripID, driverID) {
      dispatch(inboundTrips.AssignDriver(tripID, driverID));
    },
    FleetSet(tripID, fleetID) {
      dispatch(inboundTrips.AssignFleet(tripID, fleetID));
    },
    FetchDriverVendorList: function (fleetID) {
      dispatch(NearbyFleets.FetchDriverFleet(fleetID));
    },
    PaginationActionDrivers: {
      setCurrentPage: (currentPage) => {
        dispatch(inboundTrips.SetCurrentPageDrivers(currentPage));
      },
      setLimit: (limit) => {
        dispatch(inboundTrips.SetLimitDrivers(limit));
      },
    },
    FetchDrivers() {
      dispatch(inboundTrips.FetchDrivers());
    },
    UpdateFiltersDrivers(filters) {
      dispatch(inboundTrips.UpdateFiltersDrivers(filters));
    },
    UpdateAndFetchDrivers(filters) {
      dispatch(inboundTrips.UpdateAndFetchDrivers(filters));
    },
    HideModal() {
      dispatch(inboundTrips.HideReAssignModal());
    },
  };
}

export default connect(StateToProps, DispatchToProps)(InboundTripsModal);
