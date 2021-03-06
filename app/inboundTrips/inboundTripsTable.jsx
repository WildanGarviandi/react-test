import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import ReactTooltip from 'react-tooltip';

import * as _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';

import { DropdownWithState2 } from '../views/base/dropdown';
import { Pagination } from '../views/base';
import tableStyles from '../views/base/table.scss';
import { formatDate } from '../helper/time';
import ModalActions from '../modules/modals/actions';
import styles from './styles.scss';
import {
  CanMarkContainer,
  TripParser,
  CanMarkTripDelivered,
} from '../modules/trips';
import { OrderParser } from '../modules/orders';
import { FilterTopMultiple } from '../components/form';
import * as config from '../config/configValues.json';
import * as InboundTrips from './inboundTripsService';
import { checkPermission } from '../helper/permission';

const ColumnsOrder = [
  'tripID',
  'driver',
  'origin',
  'pickup',
  'pickupCity',
  'zip',
  'weight',
  'status',
  'verifiedOrders',
];

const ColumnsTitle = {
  containerNumber: 'Container',
  district: 'District',
  driver: 'Assigned To',
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
  tripID: 'Trip Order ID',
  weight: 'Total Weight',
  scannedOrders: 'Scanned Orders',
  verifiedOrders: 'Verified Orders',
  origin: 'Origin',
  zip: 'ZIP Code',
  childMerchant: 'Child Merchant',
};

let fleetList = {};

const Table = React.createClass({
  getProblemIcon(tripProblemMaster) {
    if (!tripProblemMaster) {
      return null;
    }

    const icon = _.get(config.problemIcon, tripProblemMaster.Problem);
    return (
      <span>
        <ReactTooltip />
        <img data-tip={icon.TOOLTIP} src={icon.URL} />
      </span>
    );
  },

  render() {
    const Headers = _.map(ColumnsOrder, columnKey => {
      return (
        <th key={columnKey}>
          {ColumnsTitle[columnKey]}
        </th>
      );
    });

    const Body = _.map(this.props.items, item => {
      const cells = _.map(ColumnsOrder, columnKey => {
        if (columnKey === 'tripID') {
          return (
            <td
              className={`${tableStyles.td} ${styles.tripIDColumn}`}
              key={columnKey}
            >
              {item.isNew && <img src={'/img/label-new.png'} />}
              {this.getProblemIcon(item.tripProblemMaster)}
              <Link to={`/trips/${item.key}`} className={styles.link}>
                {item[columnKey]}
              </Link>
            </td>
          );
        }
        if (columnKey === 'verifiedOrders') {
          return (
            <td
              className={`${tableStyles.td} ${styles.verifiedColumn}`}
              key={columnKey}
              onClick={() => this.props.showModals(item.key)}
            >
              <span>
                {item[columnKey]}
              </span>
              <img className={styles.imageNext} src="/img/icon-open-dark.png" />
            </td>
          );
        }
        if (columnKey === 'driver') {
          return (
            <td
              className={`${tableStyles.td} ${styles.driverColumn}`}
              key={columnKey}
            >
              <span className={styles.inlineVehicle}>
                {item.driverVehicleID &&
                  (item.driverVehicleID === 1
                    ? <img
                        className={styles.imageVehicle}
                        src={config.IMAGES.MOTORCYCLE}
                        alt="motorcycle"
                      />
                    : <img
                        className={styles.imageVehicle}
                        src={config.IMAGES.VAN}
                        alt="van"
                      />)}
              </span>
              {item.assignedTo
                ? <span className={styles.driverDetail}>
                    <span className={styles.valueDriver}>
                      {item.assignedTo}
                    </span>
                    <span className={styles.valuePhone}>
                      {item.driverPhone}
                    </span>
                  </span>
                : <span className={styles.driverDetail}>-</span>}
            </td>
          );
        }
        return (
          <td
            className={`${tableStyles.td} ${styles[columnKey]}`}
            key={columnKey}
          >
            {item[columnKey]}
          </td>
        );
      });

      return (
        <tr className={`${tableStyles.tr} ${styles.rowInbound}`} key={item.key}>
          {cells}
        </tr>
      );
    });

    if (this.props.isFetching) {
      return <div className={styles.loadingContainer}>Fetching data....</div>;
    } else {
      if (this.props.items.length === 0) {
        return (
          <table className={tableStyles.table}>
            <thead>
              <tr>
                {Headers}
              </tr>
            </thead>
            <tbody className={styles.noInbound}>
              <tr>
                <td colSpan={ColumnsOrder.length}>
                  <div className={styles.noInboundDesc}>
                    <img src={config.IMAGES.INBOUND_TRIP_DONE} alt="done" />
                    <div style={{ fontSize: 20 }}>Awesome work guys!</div>
                    <div style={{ fontSize: 12, marginTop: 20 }}>
                      All trip orders are verified, you have scanned and
                      verified all of the inbound orders.
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
            <thead>
              <tr>
                {Headers}
              </tr>
            </thead>
            <tbody>
              {Body}
            </tbody>
          </table>
        );
      }
    }
  },
});

class RightTable extends Component {
  showModals(item) {
    this.props.setCurrentTrip(item);
    this.props.fetchDrivers();
    this.props.fetchHubs();
    this.props.showReAssignModal();
  }

  render() {
    const { parsedItems, items } = this.props;

    return (
      <table className={tableStyles.table}>
        <thead>
          <tr>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {_.map(parsedItems, (item, key) =>
            <tr key={key}>
              <td className={tableStyles.td}>
                <button
                  className={styles.reassignButton}
                  onClick={() => this.showModals(items[key])}
                >
                  Re-Assign
                </button>
              </td>
              <td className={`${tableStyles.td} ${styles.driverColumn}`}>
                <span className={styles.inlineVehicle}>
                  {item.driverVehicleID &&
                    (item.driverVehicleID === 1
                      ? <img
                          className={styles.imageVehicle}
                          src={config.IMAGES.MOTORCYCLE}
                          alt="motorcycle"
                        />
                      : <img
                          className={styles.imageVehicle}
                          src={config.IMAGES.VAN}
                          alt="van"
                        />)}
                </span>
                {item.assignedTo
                  ? <span className={styles.driverDetail}>
                      <span className={styles.valueDriver}>
                        {item.assignedTo}
                      </span>
                      <span className={styles.valuePhone}>
                        {item.driverPhone}
                      </span>
                    </span>
                  : <span className={styles.driverDetail}>-</span>}
              </td>
              <td className={`${tableStyles.td} ${styles.pickup}`}>
                {item.pickup}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    );
  }
}

function FullAddress(address) {
  const Addr =
    address.Address1 &&
    address.Address2 &&
    address.Address1.length < address.Address2.length
      ? address.Address2
      : address.Address1;

  return _.chain([Addr, address.City, address.State, address.ZipCode])
    .filter(str => str && str.length > 0)
    .value()
    .join(', ');
}

function TripDropOff(trip) {
  const destinationHub =
    trip.DestinationHub &&
    `Hub ${trip.DestinationHub.Name} -- ${FullAddress(trip.DestinationHub)}`;
  const dropoffAddress =
    trip.DropoffAddress && FullAddress(trip.DropoffAddress);

  return destinationHub || dropoffAddress || '';
}

function isNew(trip) {
  const diff = moment().diff(moment(trip.AssignedTime), config.time.MINUTES);
  return diff >= 0 && diff < 4;
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

function getWebstore(merchants) {
  const webstores = [];
  _.mapKeys(merchants, (order, merchant) => {
    webstores.push(`${merchant} (${order} order${order > 1 ? 's' : ''})`);
  });

  return webstores.join(', ');
}

function ProcessTrip(trip) {
  const fleet = trip.FleetManager;
  const fleetName =
    fleet && fleet.CompanyDetail && fleet.CompanyDetail.CompanyName;
  const driverName =
    trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`;
  const transportation = trip.ExternalTrip
    ? `${trip.ExternalTrip.Transportation} (${trip.ExternalTrip.AwbNumber})`
    : fleetName;
  const assignedTo = transportation
    ? driverName ? `${transportation} - ${driverName}` : `${transportation}`
    : null;

  return {
    containerNumber: trip.ContainerNumber,
    district: trip.District && trip.District.Name,
    driver: trip.Driver && `${trip.Driver.FirstName} ${trip.Driver.LastName}`,
    driverVehicleID:
      trip.Driver && trip.Driver.Vehicle && trip.Driver.Vehicle.VehicleID,
    driverPhone:
      (trip.Driver && `${trip.Driver.CountryCode}${trip.Driver.PhoneNumber}`) ||
      '-',
    dropoff: TripDropOff(trip),
    dropoffTime: formatDate(trip.DropoffTime),
    key: trip.TripID,
    tripNumber: trip.TripNumber,
    pickup: (trip.PickupAddress && trip.PickupAddress.Address1) || '-',
    pickupCity: (trip.PickupAddress && trip.PickupAddress.City) || '-',
    pickupState: (trip.PickupAddress && trip.PickupAddress.State) || '-',
    pickupTime: formatDate(trip.PickupTime),
    status: trip.OrderStatus && trip.OrderStatus.OrderStatus,
    fleetName: fleetName || '',
    numberPackages: trip.TotalOrders,
    remarks: trip.Notes,
    tripID: `Trip-${trip.TripID}`,
    weight: `${parseFloat(trip.TotalWeight).toFixed(2)} kg`,
    scannedOrders: trip.ScannedOrders,
    verifiedOrders: `${trip.ScannedOrders}/${trip.TotalOrders} order(s) are verified`,
    assignedTo,
    tripType: GetTripType(trip),
    origin: trip.OriginHub
      ? `Hub ${trip.OriginHub.Name}`
      : getWebstore(trip.Merchants),
    isNew: isNew(trip),
    zip: (trip.PickupAddress && trip.PickupAddress.ZipCode) || '-',
    tripProblemMaster: trip.TripProblemMaster,
  };
}

function VerifiedOrder({ routes }) {
  return (
    <div>
      {routes.map((route, idx) =>
        <div
          key={idx}
          className={
            route.OrderStatus && route.OrderStatus.OrderStatus === 'DELIVERED'
              ? styles.modalOrderMain
              : styles.modalOrderMainNotVerified
          }
        >
          <table>
            <tbody>
              <tr>
                <td className={styles.modalOrderID}>
                  {route.UserOrder.UserOrderNumber}
                </td>
                <td rowSpan={2}>
                  <div
                    className={
                      route.OrderStatus &&
                      route.OrderStatus.OrderStatus === 'DELIVERED'
                        ? styles.modalOrderVerified
                        : styles.modalOrderNotVerified
                    }
                  >
                    <span className={styles.verifiedStatus}>
                      {route.OrderStatus &&
                      route.OrderStatus.OrderStatus === 'DELIVERED'
                        ? <img
                            className={styles.iconVerified}
                            src={config.IMAGES.ICON_READY}
                            alt="ready"
                          />
                        : <span className={styles.iconNotVerified}>
                            &times;
                          </span>}
                      <span className={styles.verifiedValue}>
                        {route.OrderStatus &&
                        route.OrderStatus.OrderStatus === 'DELIVERED'
                          ? 'VERIFIED'
                          : 'NOT VERIFIED'}
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
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InputFilter({ value, onChange, onKeyDown, placeholder }) {
  return (
    <div className={styles['table-cell']}>
      <input
        className={styles.inputSearch}
        placeholder={placeholder}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
    </div>
  );
}

function inputStateToProps(keyword) {
  return store => {
    const value = store.app.inboundTrips.filters[keyword];
    const options = config[keyword];

    return { value, options };
  };
}

function inputDispatchToProps(keyword, placeholder) {
  return dispatch => {
    function OnChange(e) {
      const value = e.target.value;

      dispatch(InboundTrips.AddFilters({ [keyword]: value }));
    }

    function OnKeyDown(e) {
      if (e.keyCode !== config.KEY_ACTION.ENTER) {
        if (
          keyword === 'pickupZipCode' &&
          ((e.keyCode >= config.KEY_ACTION.A &&
            e.keyCode <= config.KEY_ACTION.Z) ||
            e.keyCode >= config.KEY_ACTION.SEMI_COLON)
        ) {
          e.preventDefault();
        }
        return;
      }

      dispatch(InboundTrips.SetCurrentPage(1));
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
      placeholder,
    };
  };
}

const TripIDSearch = connect(
  inputStateToProps('tripID'),
  inputDispatchToProps('tripID', 'Search "Trip ID" here....')
)(InputFilter);

const OriginSearch = connect(
  inputStateToProps('origin'),
  inputDispatchToProps('origin', 'Search "Origin" here....')
)(InputFilter);

function FilterTop({ title, options, value, handleSelect }) {
  return (
    <div className={styles['filter-wrapper']}>
      <div className={styles['filter-title']}>
        {title}
      </div>
      <DropdownWithState2
        val={value}
        options={options}
        value={value}
        handleSelect={handleSelect}
      />
    </div>
  );
}

/* eslint-disable */
FilterTop.propTypes = {
  title: PropTypes.any,
  options: PropTypes.array.isRequired,
  value: PropTypes.any,
  handleSelect: PropTypes.func.isRequired,
};
/* eslint-enable */

FilterTop.defaultProps = {
  title: {},
  value: {},
};

function dropdownStateToProps(keyword, title) {
  return store => {
    const { inboundTrips, hubs } = store.app;
    const value = inboundTrips[keyword].value
      ? inboundTrips[keyword].value
      : 'All';
    let options = [];

    if (keyword === 'pickupCity') {
      const optionsTemplate = store.app.cityList.cities;
      options = [
        {
          key: 0,
          value: 'All',
        },
      ].concat(
        optionsTemplate.map(option => ({
          key: option.CityID,
          value: option.Name,
        }))
      );
    }

    if (keyword === 'tripProblem') {
      const optionsTemplate = store.app.tripProblems.problems;
      options = [
        {
          key: 0,
          value: 'All',
        },
      ].concat(
        optionsTemplate.map(option => ({
          key: option.TripProblemMasterID,
          value: option.Problem,
        }))
      );
    }

    if (keyword === 'hubs') {
      options = [
        {
          key: 0,
          value: 'All',
          checked: false,
        },
      ];
      const hubList = _.chain(hubs.list)
        .map(hub => ({
          key: hub.HubID,
          value: `Hub ${hub.Name}`,
          checked: false,
        }))
        .sortBy(arr => arr.key)
        .value();
      options = [...options, ...hubList];

      if (
        inboundTrips &&
        inboundTrips.hubIDs &&
        inboundTrips.hubIDs.length > 0
      ) {
        const ids = inboundTrips.hubIDs;
        options = options.map(hub => {
          const data = Object.assign({}, hub, {
            checked: _.some(ids, id => id === hub.key),
          });
          return data;
        });
      }
    }

    return { value, options, title };
  };
}

function dropdownDispatchToProps(keyword) {
  return dispatch => {
    const action = {
      handleSelect: option => {
        dispatch(InboundTrips.setDropdownFilter(keyword, option));
        dispatch(InboundTrips.FetchList());
      },
    };
    return action;
  };
}

function multiDropdownDispatchToProps() {
  return dispatch => {
    const action = {
      handleSelect: selectedOption => {
        if (selectedOption) {
          dispatch(
            selectedOption.checked
              ? InboundTrips.addHubFilter(selectedOption)
              : InboundTrips.deleteHubFilter(selectedOption)
          );
        }
        dispatch(InboundTrips.FetchList());
      },
      handleSelectAll: options => {
        dispatch(InboundTrips.setAllHubFilter(options));
        dispatch(InboundTrips.FetchList());
      },
    };
    return action;
  };
}

const ZipCodeSearch = connect(
  inputStateToProps('pickupZipCode'),
  inputDispatchToProps('pickupZipCode', 'Search "Zip Code" here....')
)(InputFilter);

const TripProblemDropdown = connect(
  dropdownStateToProps('tripProblem', 'Filter by Trip Problem'),
  dropdownDispatchToProps('tripProblem')
)(FilterTop);

const CityDropdown = connect(
  dropdownStateToProps('pickupCity', 'Filter by City'),
  dropdownDispatchToProps('pickupCity')
)(FilterTop);

const ChildMerchantSearch = connect(
  inputStateToProps('webstoreUserName'),
  inputDispatchToProps('webstoreUserName', 'Search "Child Merchant Name"....')
)(InputFilter);

const DriverSearch = connect(
  inputStateToProps('driverName'),
  inputDispatchToProps('driverName', 'Search "Driver name"....')
)(InputFilter);

const HubDropdown = connect(
  dropdownStateToProps('hubs', 'Filter by Hubs (can be multiple)'),
  multiDropdownDispatchToProps('hubIDs')
)(FilterTopMultiple);

export class Filter extends Component {
  constructor() {
    super();
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.props.exportOrders();
  }

  render() {
    return (
      <div className={styles['filter-container']}>
        <div className={styles['filter-box']}>
          <TripProblemDropdown />
          <CityDropdown />
          {this.props.userLogged.roleName === config.role.SUPERHUB &&
            <HubDropdown />}
          <button className={styles['export-trip']} onClick={this.onClick}>
            Export Not Picked Up Order
          </button>
        </div>
        <div className={styles['filter-box']}>
          <TripIDSearch />
          <OriginSearch />
          <DriverSearch />
          <ChildMerchantSearch />
          <ZipCodeSearch />
        </div>
      </div>
    );
  }
}

/* eslint-disable */
Filter.propTypes = {
  userLogged: PropTypes.object.isRequired,
  exportOrders: PropTypes.func.isRequired,
};
/* eslint-enable */

class TableStateful extends Component {
  constructor(props) {
    super(props);
    this.state = {
      trip: this.props.trip,
      filters: this.props.filters,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.trip) {
      this.setState({
        trip: nextProps.trip,
      });
    }
  }

  completeTrip(tripID) {
    if (this.props.canMarkTripDelivered) {
      if (this.props.trip.ScannedOrders < _.size(this.props.orders)) {
        let mark = confirm(`You have scanned only ${this.props.trip
          .ScannedOrders} from ${_.size(this.props.orders)} orders. 
        Continue to mark this trip as delivered?`);
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
  }

  componentWillUnmount() {
    this.props.resetState();
  }

  componentWillUnmount() {
    this.props.resetState();
  }

  render() {
    const {
      filters,
      paginationAction,
      paginationState,
      statusParams,
      tripDetails,
      tripsIsFetching,
      userLogged,
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
      filteringAction,
      statusProps,
      filters: this.state,
      isFetching: tripsIsFetching,
      showModals: this.props.showModals,
    };

    const rightTableProps = {
      items: this.props.trips,
      parsedItems: trips,
      setCurrentTrip: this.props.setCurrentTrip,
      showReAssignModal: this.props.showReAssignModal,
      fetchDrivers: this.props.fetchDrivers,
      fetchHubs: this.props.fetchHubs,
    };

    const hasPermission = checkPermission(userLogged, 'COMPLETE_ORDERS');

    return (
      <div>
        <div style={{ opacity: tripsIsFetching ? 0.5 : 1 }}>
          <div className={styles.tableLeft}>
            <Table {...tableProps} />
          </div>
          {!tableProps.isFetching &&
            tableProps.items.length !== 0 &&
            <div className={styles.tableRight}>
              <RightTable {...rightTableProps} />
            </div>}
          <Pagination {...paginationProps} />
        </div>
        {this.props.showDetails &&
          <ModalContainer>
            <ModalDialog>
              <div>
                <div className={styles.modalTitle}>
                  TRIP-{this.state.trip.TripID}
                </div>
                <div
                  role="button"
                  onClick={() => this.props.closeModal()}
                  className={styles.modalClose}
                >
                  &times;
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
                    <p className={styles.secondLabel}>Total Weight</p>
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
                {hasPermission &&
                  this.state.trip.UserOrderRoutes.length -
                    this.state.trip.ScannedOrders !==
                    0 &&
                  <div className={styles.bottomNotes}>
                    <span className={styles.completeNotes}>
                      {`${this.state.trip.UserOrderRoutes.length -
                        this.state.trip.ScannedOrders} `}
                      orders are still not verified yet! Click “Complete Orders”
                      button if you wish complete this trip.
                    </span>
                    <button
                      className={styles.completeButton}
                      onClick={() =>
                        this.completeTrip(null, this.state.trip.TripID)}
                    >
                      Complete Orders
                    </button>
                  </div>}
              </div>
            </ModalDialog>
          </ModalContainer>}
      </div>
    );
  }
}

function StateToProps(state) {
  const { inboundTrips, driversStore, userLogged } = state.app;
  const { hubID } = userLogged;
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
  const rawOrders = _.map(trip.UserOrderRoutes, route => {
    return OrderParser(route.UserOrder);
  });

  return {
    paginationState,
    trips,
    tripsIsFetching: isFetching,
    statusList: _.chain(statusList)
      .map((key, val) => [val, key])
      .sortBy(arr => arr[1])
      .map(arr => arr[0])
      .value(),
    nameToID: _.reduce(
      statusList,
      (memo, key, val) => {
        memo[val] = key;
        return memo;
      },
      {}
    ),
    filters,
    showDetails,
    trip,
    canMarkTripDelivered: CanMarkTripDelivered(trip, rawOrders),
    canMarkContainer: CanMarkContainer(trip, hubID),
    orders: rawOrders,
    userLogged,
  };
}

function DispatchToProps(dispatch) {
  return {
    initialLoad() {
      dispatch(InboundTrips.FetchList());
    },
    changeFilter: filters => {
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
    showModals: tripID => {
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
    setCurrentTrip(trip) {
      dispatch(InboundTrips.SetCurrentTrip(trip));
    },
    showReAssignModal: () => {
      dispatch(InboundTrips.ShowReAssignModal());
    },
    fetchDrivers: () => {
      dispatch(InboundTrips.FetchDrivers());
    },
    fetchHubs: () => {
      dispatch(InboundTrips.FetchHubs());
    },
    resetState() {
      dispatch(InboundTrips.ResetState());
    },
  };
}

export default connect(StateToProps, DispatchToProps)(TableStateful);
