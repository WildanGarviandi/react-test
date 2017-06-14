import React, { Component } from 'react';
import * as _ from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import PropTypes from 'prop-types';
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

let hubList = [];
let driverList = [];
let selectedDriver = null;
let selectedDriverName = null;
let selectedHub = null;
let isDriverExceed = false;
let isFleetExceed = false;

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

/* eslint-disable */
Hub.propTypes = {
  chooseHub: PropTypes.func,
  selectedHub: PropTypes.any,
};
/* eslint-enable */

Hub.defaultProps = {
  chooseHub: () => { },
  selectedHub: {},
};

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
  trip: PropTypes.object.isRequired,
};
/* eslint-enable */

AssignHub.defaultProps = {
  hubs: [],
};

class Driver extends Component {
  render() {
    const driverComponents = driverList.map(function (driver) {
      let rowStyle = styles.vendorInformation;
      let driverWeightStyle = styles.driverWeight;
      let availableWeight = driver.CurrentWeight;
      const capacity = driver.Vehicle && driver.Vehicle.VehicleID === config.vehicleType.Motorcycle
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
          onClick={() => this.props.chooseDriver(driver.UserID)}
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
            <tbody>
              <tr>
                <td>
                  <span className={styles.driverName}>
                    {UtilHelper.trimString(`${driver.FirstName} ${driver.LastName}`, 25)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          <table className={styles.driverLocation}>
            <tbody>
              <tr>
                <td>From Pickup Location</td>
              </tr>
              <tr className={styles.driverMaskLoad}>
                <td>
                  <img className={styles.vendorLoadImage} src="/img/icon-location.png" />
                  <span className={styles.vendorLoad}>{driver.DistanceToNearestPickup || 'N/A'} km</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }.bind(this));
    return <div>{driverComponents}</div>;
  }
}

/* eslint-disable */
Driver.propTypes = {
  selectedDriver: PropTypes.any,
  weight: PropTypes.any,
  chooseDriver: PropTypes.func,
};
/* eslint-enable */

Driver.defaultProps = {
  selectedDriver: {},
  weight: {},
  chooseDriver: () => { },
};

class AssignDriver extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDriver,
    };
  }

  chooseDriver(id) {
    selectedDriver = id;
    this.setState({ selectedDriver: id });
  }

  searchDriver(e) {
    if (e.key === 'Enter') {
      this.props.refetchDrivers();
    }
  }

  enterDriverSearch(e) {
    const newFilters = { name: e.target.value };
    this.props.setFilterDriver(newFilters);
  }

  assignDriver() {
    this.props.assignDriver();
    this.chooseDriver(null);
  }

  render() {
    return (
      <div>
        <div className={styles.panelDriverSearch}>
          <input
            className={styles.inputDriverSearch}
            onChange={e => this.enterDriverSearch(e)}
            onKeyPress={e => this.searchDriver(e)}
            placeholder={'Search Driver...'}
          />
        </div>
        <div className={styles.driverList}>
          {driverList.length > 0 &&
            <Driver
              chooseDriver={id => this.chooseDriver(id)}
              selectedDriver={this.state.selectedDriver}
              weight={this.props.trip.Weight}
            />
          }
          {driverList.length === 0 &&
            <div className={styles.noTransportation}>
              No driver found for this trip
            </div>
          }
        </div>
        <Pagination3 {...this.props.paginationState} {...this.props.PaginationAction} />
        <div>
          <button
            disabled={!this.state.selectedDriver}
            className={styles.buttonAssign}
            onClick={() => this.assignDriver()}
          >
            Assign to Driver
          </button>
        </div>
      </div>
    );
  }
}

/* eslint-disable */
AssignDriver.propTypes = {
  refetchDrivers: PropTypes.func,
  setFilterDriver: PropTypes.func,
  assignDriver: PropTypes.func,
  trip: PropTypes.any,
  paginationState: PropTypes.any,
  PaginationAction: PropTypes.object,
};
/* eslint-enable */

AssignDriver.defaultProps = {
  refetchDrivers: () => { },
  setFilterDriver: () => { },
  assignDriver: () => { },
  trip: {},
  paginationState: {},
  PaginationAction: {},
};

function TripDetails({ trip }) {
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

/* eslint-disable */
TripDetails.propTypes = {
  trip: PropTypes.any,
};
/* eslint-enable */

TripDetails.defaultProps = {
  trip: {},
};

class InboundTripsModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showHub: false,
      showDriver: true,
    };
  }

  activateHub() {
    this.setState({ showHub: true });
    this.setState({ showDriver: false });
    selectedHub = null;
    selectedDriver = null;
  }

  activateDriver() {
    this.setState({ showHub: false });
    this.setState({ showDriver: true });
    selectedHub = null;
    selectedDriver = null;
  }

  closeModal() {
    this.props.HideModal();
  }

  assignDriver() {
    if (!selectedDriver) {
      alert('Please select driver first');
      return;
    }
    if (isDriverExceed) {
      if (confirm(`Are you sure you want to assign to ${selectedDriverName} ?`)) {
        this.props.AssignDriver(this.props.currentTrip.TripID, selectedDriver);
      }
    } else {
      this.props.AssignDriver(this.props.currentTrip.TripID, selectedDriver);
    }
  }

  assignHub() {
    if (!selectedHub) {
      alert('Please select hub first');
      return;
    }
    if (isFleetExceed) {
      if (confirm('Are you sure you want to assign ?')) {
        this.props.AssignHub(this.props.currentTrip.TripID, selectedHub);
      }
    } else {
      this.props.AssignHub(this.props.currentTrip.TripID, selectedHub);
    }
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
                  <div
                    role="button"
                    onClick={() => this.closeModal()}
                    className={styles.modalClose}
                  >
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
                      onClick={() => this.activateHub()}
                      className={this.state.showHub ?
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
                      trip={trip}
                      assignDriver={() => this.assignDriver()}
                      setFilterDriver={this.props.SetFilterDriver}
                      refetchDrivers={this.props.ReFetchDrivers}
                    />
                  }
                  {
                    this.state.showHub &&
                    <AssignHub
                      trip={trip}
                      hubs={hubList}
                      assignHub={() => this.assignHub()}
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
}

function StateToProps(state) {
  const { inboundTrips } = state.app;
  const {
    tripActive,
    currentTrip,
    showReAssignModal,
    drivers,
    currentPageDrivers,
    limitDrivers,
    totalDrivers,
    hubs,
  } = inboundTrips;

  hubList = hubs;
  driverList = drivers;

  const trip = TripParser(tripActive);

  return {
    currentTrip,
    trip,
    paginationStateDrivers: {
      currentPage: currentPageDrivers,
      limit: limitDrivers,
      total: totalDrivers,
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
    AssignDriver(tripID, driverID) {
      dispatch(inboundTrips.AssignDriver(tripID, driverID));
    },
    FleetSet(tripID, fleetID) {
      dispatch(inboundTrips.AssignFleet(tripID, fleetID));
    },
    PaginationActionDrivers: {
      setCurrentPage: (currentPage) => {
        dispatch(inboundTrips.SetCurrentPageDrivers(currentPage));
      },
      setLimit: (limit) => {
        dispatch(inboundTrips.SetLimitDrivers(limit));
      },
    },
    ReFetchDrivers() {
      dispatch(inboundTrips.SetCurrentPageDrivers(1));
    },
    SetFilterDriver(filters) {
      dispatch(inboundTrips.SetFilterDriver(filters));
    },
    HideModal() {
      dispatch(inboundTrips.HideReAssignModal());
      dispatch(inboundTrips.eraseFilter());
    },
    FetchHubs() {
      dispatch(inboundTrips.FetchHubs());
    },
    SetFilterHub(filters) {
      dispatch(inboundTrips.SetFilterHub(filters));
    },
    AssignHub(tripID, hubID) {
      dispatch(inboundTrips.AssignHub(tripID, hubID));
    },
  };
}

/* eslint-disable */
InboundTripsModal.propTypes = {
  HideModal: PropTypes.func,
  AssignDriver: PropTypes.func,
  currentTrip: PropTypes.any,
  AssignHub: PropTypes.func,
  showReAssignModal: PropTypes.any,
  paginationStateDrivers: PropTypes.any,
  PaginationActionDrivers: PropTypes.any,
  SetFilterDriver: PropTypes.func,
  ReFetchDrivers: PropTypes.func,
  SetFilterHub: PropTypes.func,
  FetchHubs: PropTypes.func,
};
/* eslint-enable */

InboundTripsModal.defaultProps = {
  HideModal: () => { },
  AssignDriver: () => { },
  currentTrip: {},
  AssignHub: () => { },
  showReAssignModal: {},
  paginationStateDrivers: {},
  PaginationActionDrivers: {},
  SetFilterDriver: () => { },
  ReFetchDrivers: () => { },
  SetFilterHub: () => { },
  FetchHubs: () => { },
};

export default connect(StateToProps, DispatchToProps)(InboundTripsModal);
