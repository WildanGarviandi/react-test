import React, { Component } from 'react';
import * as _ from 'lodash';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import PropTypes from 'prop-types';

import * as PickupOrdersReady from './pickupOrdersReadyService';
import * as NearbyFleets from '../nearbyFleets/nearbyFleetService';
import { DropdownTypeAhead, Input, Pagination, ButtonStandard } from '../views/base';
import { TripParser } from '../modules/trips';
import { modalAction } from '../modules/modals/constants';
import stylesModal from '../views/base/modal.css';
import styles from './styles.css';
import BodyRow, { CheckBoxCell, LinkCell, TextCell, OrderIDLinkCell, ButtonCell, IDCell } from '../views/base/cells';
import { CheckboxHeader, CheckboxCell } from '../views/base/tableCell';
import { FilterTop, FilterText } from '../components/form';
import * as TripDetails from '../modules/inboundTripDetails';
import config from '../config/configValues.json';
import * as UtilHelper from '../helper/utility';
import { Pagination3 } from '../components/pagination3';

let fleetList = [];
let driverList = [];
let hubList = [];
let driverVendorList = [];
let selectedDriver = null;
let selectedDriverName = null;
let selectedFleet = null;
let selectedFleetName = null;
let selectedDriverVendor = null;
let selectedHub = null;
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

const Fleet = React.createClass({
  render: function() {
    var fleetComponents = fleetList.map(function(fleet, idx) {
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
        <div key={idx} onClick={this.props.chooseFleet.bind(null, fleet.FleetManagerID)} 
          className={rowStyle}>
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
    }.bind(this));
    return <div>{fleetComponents}</div>;
  }
});

export const AssignVendor = React.createClass({
  getInitialState() {
    return ({
      selectedFleet: selectedFleet
    });
  },
  chooseFleet(id) {
    selectedFleet = id;
    this.setState({ selectedFleet: id });
  },
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
                Please choose a vendor that you want to assign with this trip.
              </div>               
            </div>
          </div>
          <div style={{ clear: 'both' }} />
        </div>
        <div className={styles.vendorList}>
          { fleetList.length > 0 &&
            <div>
              <Fleet
                chooseFleet={this.chooseFleet}
                selectedFleet={this.state.selectedFleet}
                sumOrders={this.props.trip.UserOrderRoutes.length}
              />
            </div>
          }
          { fleetList.length === 0 &&
            <div className={styles.noTransportation}>
              No vendor found for this trip
            </div>
          }
        </div>
        <div>
          { !this.state.selectedFleet &&
            <div className={styles.notesBelow}>
              Please select a vendor for this trip and click on button to continue.
            </div>
          }
          { this.state.selectedFleet &&
            <div className={styles.notesBelow}>
              You have selected a vendor for this trip! Please click on this button to continue.
            </div>
          }
          <div>
            <button disabled={!this.state.selectedFleet} className={styles.buttonAssign} onClick={this.props.assignFleet}>Assign to Vendor</button>
          </div>
        </div>
      </div>
    );
  }
});

class Hub extends Component {
  render() {
    const hubComponents = hubList.map((hub, idx) => {
      let rowStyle = styles.vendorInformation;

      if (hub.HubID === this.props.selectedHub) {
        rowStyle = styles.vendorInformationSelected;
      }
      return (
        <div
          key={idx}
          onClick={() => this.props.chooseHub(hub.HubID)}
          className={rowStyle}
        >
          <div className={styles.maskInput}>
            <img src={hub.HubID === this.props.selectedHub ? '/img/icon-radio-on.png' : '/img/icon-radio-off.png'} />
          </div>
          <div className={styles.maskName}>
            <span className={styles.vendorName}>
              {hub.Name}
            </span>
          </div>
        </div>
      );
    });
    return <div>{hubComponents}</div>;
  }
}

class AssignHub extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedHub,
    };
  }

  chooseHub(id) {
    selectedHub = id;
    this.setState({ selectedHub: id });
  }

  searchHub(e) {
    if (e.key === 'Enter') {
      this.props.fetchHubs();
      this.chooseHub(null);
    }
  }

  enterHubSearch(e) {
    const newFilters = { name: e.target.value };
    this.props.setFilterHub(newFilters);
  }

  assignHub() {
    this.props.assignHub();
    this.chooseHub(null);
  }

  render() {
    const { trip } = this.props;

    return (
      <div>
        <div className={styles.panelDriverSearch}>
          <input
            className={styles.inputDriverSearch}
            onChange={e => this.enterHubSearch(e)}
            onKeyPress={e => this.searchHub(e)}
            placeholder={'Search Hub...'}
          />
        </div>
        <div className={styles.vendorList}>
          {hubList.length > 0 &&
            <div className={styles['hub-container']}>
              <Hub
                chooseHub={id => this.chooseHub(id)}
                selectedHub={this.state.selectedHub}
                hubs={this.props.hubs}
              />
            </div>
          }
          {hubList.length === 0 &&
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
              disabled={!this.state.selectedHub}
              className={styles.buttonAssign}
              onClick={() => this.assignHub(trip.TripID)}
            >
              Assign to Hub
            </button>
          </div>
        </div>
      </div>
    );
  }
}

/* eslint-disable */
AssignHub.propTypes = {
  fetchHubs: PropTypes.func.isRequired,
  setFilterHub: PropTypes.func.isRequired,
  assignHub: PropTypes.func.isRequired,
  hubs: PropTypes.array,
};
/* eslint-enable */

AssignHub.defaultProps = {
  hubs: [],
};

const Driver = React.createClass({
  render: function() {
    var driverComponents = driverList.map(function(driver, idx) {
      let rowStyle = styles.vendorInformation;
      let driverWeightStyle = styles.driverWeight;
      let availableWeight = driver.CurrentWeight;
      let capacity = driver.Vehicle && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle
        ? config.motorcycleMaxWeight : config.vanMaxWeight;
      if (driver.UserID === this.props.selectedDriver) {
        rowStyle = styles.vendorInformationSelected;
        driverWeightStyle = styles.driverWeightSelected;
        availableWeight = parseFloat(availableWeight) + parseFloat(this.props.weight);
        selectedDriverName = `${driver.FirstName} ${driver.LastName}`;
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
          role="button"
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
  },
});

export const AssignDriver = React.createClass({
  getInitialState() {
    return ({
      selectedVehicle: 'Motorcycle',
      allowNoSeparate: false,
      selectedDriver,
    });
  },
  chooseVehicle(vehicle) {
    this.setState({ selectedVehicle: vehicle.value });
    selectedVehicleID = vehicle.key;
  },
  noSeparate() {
    this.setState({ allowNoSeparate: true });
  },
  chooseDriver(id) {
    selectedDriver = id;
    this.setState({ selectedDriver: id });
  },
  searchDriver(e) {
    if (e.key === 'Enter') {
      const newFilters = { ['name']: e.target.value };
      this.props.updateAndFetchDrivers(newFilters);
      this.props.fetchDrivers();
    }
  },
  enterDriverSearch(e) {
    const newFilters = { ['name']: e.target.value };
    this.props.updateFiltersDrivers(newFilters);
  },
  render() {
    const vehicleList = config.vehicle;

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
                Vehicle
              </div>
              <div className={styles.secondLabelVehicle}>
                <DropdownTypeAhead
                  options={vehicleList}
                  selectVal={this.chooseVehicle}
                  val={this.state.selectedVehicle}
                />
              </div>
            </div>
          </div>
          <div style={{ clear: 'both' }} />
          { this.props.trip.Weight > config.motorcycleMaxWeight && this.state.selectedVehicle === 'Motorcycle' 
            && !this.state.allowNoSeparate &&
              <div className={styles.modalDescBottom}>
                This trip is too big. Take {config.motorcycleMaxWeight} kg only and separate the rest?
                <div style={{ clear: 'both' }} />
                <button className={styles.buttonSplitNo} onClick={this.noSeparate}>No</button>
                <button className={styles.buttonSplitYes} onClick={this.props.splitTrip}>Yes</button>
              </div>
          }
          { this.props.trip.Weight > config.vanMaxWeight && this.state.selectedVehicle === 'Van' 
            && !this.state.allowNoSeparate &&
              <div className={styles.modalDescBottom}>
                This trip is too big. Take {config.vanMaxWeight} kg only and separate the rest?
                <div style={{ clear: 'both' }} />
                <button className={styles.buttonSplitNo} onClick={this.noSeparate}>
                  No
                </button>
                <button className={styles.buttonSplitYes} onClick={this.props.splitTrip}>
                  Yes
                </button>
              </div>
          }
          <div style={{ clear: 'both' }} />
        </div>
        <div className={styles.panelDriverSearch}>
          <input className={styles.inputDriverSearch} onChange={this.enterDriverSearch} onKeyPress={this.searchDriver} placeholder={'Search Driver...'} />
        </div>
        <div className={styles.driverList}>
          { this.props.isFetchingDriver &&
            <div className={styles.searchingDriver}>
              <img className={styles.searchingIcon} src="/img/icon-search-color.png" />
              <br />
              <span className={styles.searchingSpan}>
                Searching....
              </span>
              <br />
              <div className={styles.searchingNotes}>
                We will search for the best driver suitable for
                 the job, based on their location to the pickup location
              </div>
            </div>
          }
          { !this.props.isFetchingDriver && driverList.length > 0 &&
            <Driver
              selectedVehicle={this.state.selectedVehicle}
              noSplit={this.state.allowNoSeparate}
              chooseDriver={this.chooseDriver}
              selectedDriver={this.state.selectedDriver}
              weight={this.props.trip.Weight}
            />
          }
          { !this.props.isFetchingDriver && driverList.length === 0 &&
            <div className={styles.noTransportation}>
              No driver found for this trip
            </div>
          }
        </div>
        <Pagination3 {...this.props.paginationState} {...this.props.PaginationAction} />
        <div>
          { this.props.trip.Weight > config.motorcycleMaxWeight && this.state.selectedVehicle === 'Motorcycle'
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
  },
});

const DriverVendor = React.createClass({
  render: function() {
    var driverComponents = driverVendorList.map(function(driver, idx) {
      let rowStyle = styles.vendorInformation;
      let driverWeightStyle = styles.driverWeight;
      if (driver.UserID === this.props.selectedDriver) {
        rowStyle = styles.vendorInformationSelected;
        driverWeightStyle = styles.driverWeightSelected;
      }
      return (
        <div
          role="button"
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
  },
});

export const AssignDriverVendor = React.createClass({
  getInitialState() {
    return ({
      selectedDriverVendor,
    });
  },
  chooseDriver(id) {
    selectedDriverVendor = id;
    this.setState({ selectedDriverVendor: id });
  },
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
          <DriverVendor chooseDriver={this.chooseDriver} selectedDriver={this.state.selectedDriverVendor} />
        </div>
        <div>
          <div>
            <button disabled={!this.state.selectedDriverVendor} className={styles.buttonAssign} onClick={this.props.assignDriver}>Assign to Driver</button>
          </div>
        </div>
      </div>
    );
  }
});

const PickupOrdersModal = React.createClass({
  getInitialState() {
    return ({
      showDriver: true,
      showVendor: false,
      showHub: false,
    });
  },
  activateVendor() {
    this.setState({
      showVendor: true,
      showDriver: false,
      showHub: false,
    });
    selectedFleet = null;
    selectedDriver = null;
    selectedHub = null;
  },
  activateDriver() {
    this.setState({
      showVendor: false,
      showDriver: true,
      showHub: false,
    });
    selectedFleet = null;
    selectedDriver = null;
    selectedHub = null;
  },
  activateHub() {
    this.setState({
      showVendor: false,
      showDriver: false,
      showHub: true,
    });
    selectedFleet = null;
    selectedDriver = null;
    selectedHub = null;
  },
  closeModal() {
    this.props.CloseModal();
    this.activateDriver();
  },
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
  },
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
  },
  assignDriverVendor() {
    if (!selectedDriverVendor) {
      alert('Please select driver first');
      return;
    }
    this.props.DriverSet(this.props.trip.TripID, selectedDriverVendor);
  },
  assignHub() {
    if (!selectedHub) {
      alert('Please select hub first');
      return;
    }
    if (isFleetExceed) {
      if (confirm('Are you sure you want to assign ?')) {
        this.props.AssignHub(this.props.trip.TripID, selectedHub);
      }
    } else {
      this.props.AssignHub(this.props.trip.TripID, selectedHub);
    }
  },
  splitTrip() {
    this.props.SplitTrip(this.props.trip.TripID, selectedVehicleID);
  },
  componentWillMount() {
    if (this.props.trip.FleetManager) {
      this.props.FetchDriverVendorList(this.props.trip.FleetManager.UserID);
    }
  },
  render() {
    const trips = _.map(this.props.trips, ProcessTrip);
    console.log(this.props, 'props');
    return (
      <div>
        {
          this.props.showModal &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div>
                  <div className={styles.modalTitle}>
                    Assign Trip
                  </div>
                  <div onClick={this.closeModal} className={styles.modalClose}>
                    &times;
                  </div> 
                  <div className={styles.toggleAssignMain}>
                    <div
                      role="button"
                      onClick={this.activateDriver}
                      className={this.state.showDriver ?
                        styles.toggleAssignActive : styles.toggleAssign}
                    >
                      Assign to Driver
                    </div>
                    <div className={styles.arbitToggleAssign}> | </div>
                    <div
                      role="button"
                      onClick={this.activateVendor}
                      className={this.state.showVendor ?
                        styles.toggleAssignActive : styles.toggleAssign}
                    >
                      Assign to Vendor
                    </div>
                    <div className={styles.arbitToggleAssign}> | </div>
                    <div
                      role="button"
                      onClick={this.activateHub}
                      className={this.state.showHub
                        ? styles.toggleAssignActive : styles.toggleAssign}
                    >
                      Assign to Hub
                    </div>
                  </div>
                  { this.state.showDriver &&
                    <AssignDriver
                      paginationState={this.props.paginationStateDrivers}
                      PaginationAction={this.props.PaginationActionDrivers}
                      trip={this.props.trip} assignDriver={this.assignDriver}
                      splitTrip={this.splitTrip}
                      isFetchingDriver={this.props.isFetchingDriver}
                      updateAndFetchDrivers={this.props.UpdateAndFetchDrivers}
                      updateFiltersDrivers={this.props.UpdateFiltersDrivers}
                      fetchDrivers={this.props.FetchDrivers}
                    />
                  }
                  {
                    this.state.showVendor && driverVendorList.length === 0 &&
                    <AssignVendor trip={this.props.trip} assignFleet={this.assignFleet} />
                  }
                  {
                    this.state.showVendor && driverVendorList.length > 0 &&
                    <AssignDriverVendor
                      trip={this.props.trip}
                      assignDriver={this.assignDriverVendor}
                    />
                  }
                  {
                    this.state.showHub &&
                    <AssignHub
                      trip={this.props.trip}
                      assignHub={this.assignHub}
                      hubs={hubList}
                      setFilterHub={this.props.SetFilterHub}
                      fetchHubs={this.props.FetchHubs}
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
});

function StateToProps(state) {
  const { pickupOrdersReady, driversStore } = state.app;
  const {
    tripActive,
    showModal,
    splitTrip,
    drivers,
    isFetchingDriver,
    currentPageDrivers,
    limitDrivers,
    totalDrivers,
    hubs,
  } = pickupOrdersReady;

  const { fleets, driversVendors } = state.app.nearbyFleets;
  fleetList = fleets;

  driverList = drivers;
  driverVendorList = driversVendors;
  hubList = hubs;

  const trip = TripParser(tripActive);

  return { 
    trip,
    showModal,
    isFetchingDriver,
    hubs,
    paginationStateDrivers: {
      currentPage: currentPageDrivers,
      limit: limitDrivers,
      total: totalDrivers,
    },
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    CloseModal() {
      dispatch(PickupOrdersReady.HideAssignModal());
      dispatch(PickupOrdersReady.HideDetails());
      dispatch(NearbyFleets.ResetVendorList());
    },
    DriverSet(tripID, driverID) {
      dispatch(PickupOrdersReady.AssignDriver(tripID, driverID));
    },
    FleetSet(tripID, fleetID) {
      dispatch(PickupOrdersReady.AssignFleet(tripID, fleetID));
    },
    SplitTrip(id, vehicleID) {
      dispatch(PickupOrdersReady.SplitTrip(id, vehicleID));
    },
    FetchDriverVendorList: function(fleetID) {
      dispatch(NearbyFleets.FetchDriverFleet(fleetID));
    },
    PaginationActionDrivers: {
      setCurrentPage: (currentPage) => {
          dispatch(PickupOrdersReady.SetCurrentPageDrivers(currentPage));
      },
      setLimit: (limit) => {
          dispatch(PickupOrdersReady.SetLimitDrivers(limit));
      },
    },
    FetchDrivers() {
      dispatch(PickupOrdersReady.FetchDrivers());
    },
    FetchHubs() {
      dispatch(PickupOrdersReady.FetchHubs());
    },
    SetFilterHub(newFilter) {
      dispatch(PickupOrdersReady.SetFilterHub(newFilter));
    },
    UpdateFiltersDrivers(filters) {
      dispatch(PickupOrdersReady.UpdateFiltersDrivers(filters));
    },
    UpdateAndFetchDrivers(filters) {
      dispatch(PickupOrdersReady.UpdateAndFetchDrivers(filters));
    },
    AssignHub(tripID, hubID) {
      dispatch(PickupOrdersReady.AssignHub(tripID, hubID));
    },
  };
}

export default connect(StateToProps, DispatchToProps)(PickupOrdersModal);
