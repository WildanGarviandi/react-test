import * as _ from 'lodash';
import ClassName from 'classnames';
import moment from 'moment';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';
import * as InboundTrips from './inboundTripsService';
import classnaming from 'classnames';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import { DropdownTypeAhead, Input, Pagination } from '../views/base';
import DateRangePicker from '../views/base/dateRangePicker';
import tableStyles from '../views/base/table.css';
import StatusDropdown from '../views/base/statusDropdown';
import { TripParser } from '../modules/trips';
import { formatDate } from '../helper/time';
import { modalAction } from '../modules/modals/constants';
import ModalActions from '../modules/modals/actions';
import stylesModal from '../views/base/modal.css';
import styles from './styles.css';
import { CanMarkContainer, CanMarkOrderReceived, CanMarkTripDelivered } from '../modules/trips';
import { OrderParser } from '../modules/orders';
import { FilterTop, FilterText } from '../components/form';
import * as config from '../config/configValues.json';

const ColumnsOrder = ['tripID', 'origin', 'tripType', 'weight', 'driver', 'driverPhone', 'status', 'verifiedOrders'];

const ColumnsTitle = {
  containerNumber: 'Container',
  district: 'District',
  driver: 'Assigned To',
  driverPhone: 'Phone',
  dropoff: 'Next Destination',
  dropoffTime: 'Dropoff Time',
  fleetName: 'Fleet',
  pickup: 'Pickup Address',
  pickupCity: 'City',
  pickupState: 'State',
  pickupTime: 'Pickup Time',
  status: 'Status',
  tripNumber: 'Trip Number',
  webstoreNames: 'Merchant',
  numberPackages: 'Number of Packages',
  remarks: 'Remarks',
  tripID: 'Trip ID',
  weight: 'Total Weight',
  scannedOrders: 'Scanned Orders',
  verifiedOrders: 'Verified Orders',
  tripType: 'Trip Type',
  origin: 'Origin'
};

let fleetList = {};

const Table = React.createClass({
  render() {
    const Headers = _.map(ColumnsOrder, (columnKey) => {
      return <th key={columnKey}>{ColumnsTitle[columnKey]}</th>;
    });

    const Body = _.map(this.props.items, (item) => {
      const cells = _.map(ColumnsOrder, (columnKey) => {
        if (columnKey === 'tripID') {
          return <td className={tableStyles.td + ' ' + styles.tripIDColumn} key={columnKey}>
            <Link to={`/trips/${item.key}`} className={styles.link}>{item[columnKey]}</Link>
          </td>;
        }
        if (columnKey === 'verifiedOrders') {
          return <td className={tableStyles.td + ' ' + styles.verifiedColumn} key={columnKey} onClick={this.props.showModals.bind(null, item['key'])}>
            <span>
              {item[columnKey]}
            </span>
            <img className={styles.imageNext} src="/img/icon-next.png" />
          </td>;
        }
        if (columnKey === 'driver') {
          return <td className={tableStyles.td + ' ' + styles.driverColumn} key={columnKey}>
            <span className={styles.inlineVehicle}>
              {item.driverVehicleID &&
                (item.driverVehicleID === 1 ?
                  <img className={styles.imageVehicle} src="/img/icon-vehicle-motorcycle.png" /> :
                  <img className={styles.imageVehicle} src="/img/icon-vehicle-van.png" />
                )
              }
              <span className={styles.valueVehicle}>
                {item.assignedTo}
              </span>
            </span>
          </td>;
        }
        return <td className={tableStyles.td} key={columnKey}>{item[columnKey]}</td>;
      });

      return <tr className={tableStyles.tr + ' ' + styles.rowInbound} key={item.key}>{cells}</tr>;
    });

    if (this.props.isFetching) {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 20 }}>
            Fetching data....
          </div>
        </div>
      );
    } else {
      if (this.props.items.length === 0) {
        return (
          <table className={tableStyles.table}>
            <thead><tr>{Headers}</tr></thead>
            <tbody className={styles.noInbound}>
              <tr>
                <td colSpan={ColumnsOrder.length}>
                  <div className={styles.noInboundDesc}>
                    <img src="/img/image-inbound-trip-done.png" />
                    <div style={{ fontSize: 20 }}>
                      Awesome work guys!
                    </div>
                    <div style={{ fontSize: 12, marginTop: 20 }}>
                      All trip orders are verified,
                       you have scanned and verified all of the inbound orders.
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        );
      } else {
        return (
          <table className={tableStyles.table}>
            <thead><tr>{Headers}</tr></thead>
            <tbody>{Body}</tbody>
          </table>
        );
      }
    }
  },
});

function FullAddress(address) {
  const Addr = address.Address1 && address.Address2 && (address.Address1.length < address.Address2.length) ? address.Address2 : address.Address1;
  return _.chain([Addr, address.City, address.State, address.ZipCode])
    .filter((str) => (str && str.length > 0))
    .value()
    .join(', ');
}

function TripDropOff(trip) {
  const destinationHub = trip.DestinationHub && ('Hub ' + trip.DestinationHub.Name + ' -- ' + FullAddress(trip.DestinationHub));
  const dropoffAddress = trip.DropoffAddress && FullAddress(trip.DropoffAddress);

  return destinationHub || dropoffAddress || '';
}

export function GetTripType(trip) {
  if (!trip) return '-';

  if (!trip.OriginHub) {
    return 'First Leg';
  }

  if (trip.OriginHub) {
    return 'Interhub';
  }

  return '';
}


function ProcessTrip(trip) {
  const parsedTrip = TripParser(trip);
  const fleet = trip.FleetManager;
  const fleetName = fleet && fleet.CompanyDetail && fleet.CompanyDetail.CompanyName;
  const driverName = trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`;
  const transportation = trip.ExternalTrip ? `${trip.ExternalTrip.Transportation} (${trip.ExternalTrip.AwbNumber})` : fleetName;
  const assignedTo = transportation ? (driverName ? `${transportation} - ${driverName}` : `${transportation}`) : '-';

  return {
    containerNumber: trip.ContainerNumber,
    district: trip.District && trip.District.Name,
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
    driverVehicleID: trip.Driver && trip.Driver.Vehicle && trip.Driver.Vehicle.VehicleID,
    driverPhone: trip.Driver && `${trip.Driver.CountryCode}${trip.Driver.PhoneNumber}` || '-',
    dropoff: TripDropOff(trip),
    dropoffTime: formatDate(trip.DropoffTime),
    key: trip.TripID,
    tripNumber: trip.TripNumber,
    pickup: trip.PickupAddress && trip.PickupAddress.Address1,
    pickupCity: trip.PickupAddress && trip.PickupAddress.City,
    pickupState: trip.PickupAddress && trip.PickupAddress.State,
    pickupTime: formatDate(trip.PickupTime),
    status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
    webstoreNames: parsedTrip.WebstoreNames,
    fleetName: fleetName || '',
    numberPackages: trip.UserOrderRoutes.length,
    remarks: trip.Notes,
    tripID: `Trip-${trip.TripID}`,
    weight: `${parseFloat(trip.Weight).toFixed(2)} kg`,
    scannedOrders: trip.ScannedOrders,
    verifiedOrders: `${trip.ScannedOrders}/${trip.UserOrderRoutes.length} order(s) are verified`,
    assignedTo,
    tripType: GetTripType(trip),
    origin: trip.OriginHub ? `Hub ${trip.OriginHub.Name}` : parsedTrip.WebstoreNames
  };
}

const VerifiedOrder = React.createClass({
  render: function () {
    const orderComponents = this.props.routes.map(function (route, idx) {
      return (
        <div
          key={idx}
          className={route.OrderStatus && route.OrderStatus.OrderStatus === 'DELIVERED' ?
            styles.modalOrderMain : styles.modalOrderMainNotVerified}
        >
          <table>
            <tr>
              <td className={styles.modalOrderID}>
                {route.UserOrder.UserOrderNumber}
              </td>
              <td rowSpan={2}>
                <div className={route.OrderStatus && route.OrderStatus.OrderStatus === 'DELIVERED' ?
                  styles.modalOrderVerified : styles.modalOrderNotVerified}>
                  <span className={styles.verifiedStatus}>
                    {route.OrderStatus && route.OrderStatus.OrderStatus === 'DELIVERED' ?
                      <img className={styles.iconVerified} src="/img/icon-ready.png" /> :
                      <span className={styles.iconNotVerified}>X</span>
                    }
                    <span className={styles.verifiedValue}>
                      {route.OrderStatus && route.OrderStatus.OrderStatus === 'DELIVERED' ? 'VERIFIED' : 'NOT VERIFIED'}
                    </span>
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td className={styles.modalOrderWeight}>
                Weight: {route.UserOrder.PackageWeight} kg
              </td>
            </tr>
          </table>
        </div>
      );
    });
    return <div>{orderComponents}</div>;
  },
});

function dropdownStateToProps(keyword, title) {
  return (store) => {
    const value = store.app.inboundTrips[keyword].value || 'All';
    let options = [{
      key: 0, value: 'All',
    }];

    if (keyword === 'tripProblem') {
      const optionsTemplate = store.app.tripProblems.problems;

      options = options.concat(optionsTemplate
        .map((option) => ({
          key: option.TripProblemMasterID,
          value: option.Problem,
        })));
    }

    return { value, options, title };
  };
}

function dropdownDispatchToProps(keyword) {
  return (dispatch) => {
    return {
      handleSelect: (option) => {
        dispatch(InboundTrips.setDropdownFilter(keyword, option));
        dispatch(InboundTrips.FetchList());
      },
    };
  };
}

const TripProblemDropdown = connect(
  dropdownStateToProps('tripProblem', 'Filter by Trip Problem'),
  dropdownDispatchToProps('tripProblem'),
)(FilterTop);

export class Filter extends Component {
  render() {
    return (
      <div>
        <TripProblemDropdown />
      </div>
    );
  }
}

const TableStateful = React.createClass({
  getInitialState() {
    return { trip: this.props.trip, filters: this.props.filters };
  },
  closeModal() {
    this.props.closeModal();
  },
  componentWillReceiveProps(nextProps) {
    if (nextProps['trip']) {
      this.setState({
        trip: nextProps['trip']
      });
    }
  },
  completeTrip(tripID) {
    if (this.props.canMarkTripDelivered) {
      if (this.props.trip.ScannedOrders < _.size(this.props.orders)) {
        let mark = confirm('You have scanned only ' + this.props.trip.ScannedOrders + ' from ' + _.size(this.props.orders) +
          ' orders. Continue to mark this trip as delivered?');
        if (mark) {
          this.props.deliverTrip(this.props.trip.TripID);
        }
      } else {
        this.props.deliverTrip(this.props.trip.TripID);
      }
    } else {
      this.props.askReuse({
        message: 'Do you want to reuse the container?',
        action: this.props.reuse.bind(null, this.props.trip.TripID),
        cancel: this.props.deliverTrip.bind(null, this.props.trip.TripID),
      });
    }
  },
  render() {
    const {
      filters,
      paginationAction,
      paginationState,
      statusParams,
      tripDetails,
      tripsIsFetching
    } = this.props;

    const paginationProps = _.assign({}, paginationAction, paginationState);

    const statusProps = {
      pickStatus: this.pickStatus,
      statusList: this.props.statusList,
      statusName: this.state.statusName,
    };

    const filteringAction = {
      changeFilter: this.changeFilter,
      changeFilterAndFetch: this.changeFilterAndFetch,
      fetchTrips: this.fetchTrips,
    };

    const trips = _.map(this.props.trips, ProcessTrip);
    const tableProps = {
      items: trips,
      toDetails: tripDetails,
      filteringAction, statusProps,
      filters: this.state,
      isFetching: tripsIsFetching,
      showModals: this.props.showModals
    };

    return (
      <div>
        <div style={{ opacity: tripsIsFetching ? 0.5 : 1 }}>
          <Table {...tableProps} />
          <Pagination {...paginationProps} />
        </div>
        {
          this.props.showDetails &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div className={styles.modalTitle}>
                  TRIP-{this.state.trip.TripID}
                </div>
                <div onClick={this.closeModal} className={styles.modalClose}>
                  X
                </div>
                <div className={styles.topDesc}>
                  <div className={styles.modalDesc}>
                    <p className={styles.mainLabel}>
                      From {this.state.trip.ListWebstore}
                    </p>
                    <p className={styles.secondLabel}>
                      {this.state.trip.UserOrderRoutes.length} items
                    </p>
                  </div>
                  <div className={styles.modalDesc2}>
                    <p className={styles.secondLabel}>
                      Total Weight
                    </p>
                    <p className={styles.weightLabel}>
                      {this.state.trip.Weight}
                      <span className={styles.unitWeightLabel}> kg</span>
                    </p>
                  </div>
                  <div style={{ clear: 'both' }} />
                </div>
                <div className={styles.orderList}>
                  <VerifiedOrder routes={this.state.trip.UserOrderRoutes} />
                </div>
                {this.state.trip.UserOrderRoutes.length - this.state.trip.ScannedOrders !== 0 &&
                  <div className={styles.bottomNotes}>
                    <span className={styles.completeNotes}>
                      {`${this.state.trip.UserOrderRoutes.length - this.state.trip.ScannedOrders} `}
                      orders are still not verified yet!
                       Click “Complete Orders” button if you wish complete this trip.
                    </span>
                    <button
                      className={styles.completeButton}
                      onClick={this.completeTrip.bind(null, this.state.trip.TripID)}
                    >
                      Complete Orders
                    </button>
                  </div>
                }
              </div>
            </ModalDialog>
          </ModalContainer>
        }
      </div>
    );
  },
});

function StateToProps(state) {
  const { inboundTrips, driversStore, userLogged } = state.app;
  const { hubID, isCentralHub } = userLogged;
  const {
    isFetching,
    limit,
    total,
    currentPage,
    trips,
    filters,
    showDetails,
    tripActive,
  } = inboundTrips;

  fleetList = driversStore.fleetList.dict;

  const paginationState = {
    currentPage,
    limit,
    total,
  };

  const statusList = state.app.containers.statusList;
  const trip = TripParser(tripActive);
  const rawOrders = _.map(trip.UserOrderRoutes, (route) => {
    return OrderParser(route.UserOrder);
  });


  return {
    paginationState, trips, tripsIsFetching: isFetching,
    statusList: _.chain(statusList)
      .map((key, val) => [val, key])
      .sortBy((arr) => (arr[1]))
      .map((arr) => (arr[0]))
      .value(),
    nameToID: _.reduce(statusList, (memo, key, val) => {
      memo[val] = key;
      return memo;
    }, {}),
    filters,
    showDetails,
    trip,
    canMarkTripDelivered: CanMarkTripDelivered(trip, rawOrders),
    canMarkContainer: CanMarkContainer(trip, hubID),
    orders: rawOrders
  };
}

function DispatchToProps(dispatch, ownProps) {
  return {
    initialLoad() {
      dispatch(InboundTrips.FetchList());
    },
    changeFilter: (filters) => {
      dispatch(InboundTrips.AddFilters(filters));
    },
    paginationAction: {
      setCurrentPage(pageNum) {
        dispatch(InboundTrips.SetCurrentPage(pageNum));
      },
      setLimit(limit) {
        dispatch(InboundTrips.SetLimit(limit));
      },
    },
    tripDetails(id) {
      dispatch(push(`/trips/${id}/`));
    },
    showModals: (tripID) => {
      dispatch(InboundTrips.ShowDetails(tripID));
    },
    closeModal: () => {
      dispatch(InboundTrips.HideDetails());
    },
    deliverTrip(tripID) {
      dispatch(InboundTrips.TripDeliver(tripID));
    },
    askReuse(modal) {
      dispatch(ModalActions.addConfirmation(modal));
    },
    reuse(tripID) {
      dispatch(InboundTrips.TripDeliver(tripID, true));
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
