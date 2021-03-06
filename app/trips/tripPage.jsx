import React from 'react';
import { connect } from 'react-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import ReactGA from 'react-ga';
import NumberFormat from 'react-number-format';

import lodash from 'lodash';

import { Page } from '../views/base';
import { Pagination2 } from '../components/pagination2';
import { ButtonWithLoading } from '../components/Button';
import Table, { Filter, Deadline } from './tripTable';
import * as TripService from './tripService';
import { TMSFetchDrivers } from '../modules/drivers/actions/driversFetch';
import styles from './styles.scss';
import stylesButton from '../components/Button/styles.scss';
import * as UtilHelper from '../helper/utility';
import tripAnalytics from './tripAnalytics.json';
import config from '../config/configValues.json';

const TripOrders = React.createClass({
  render: function() {
    var orderComponents = this.props.orders.map(
      function(order, idx) {
        return (
          <div className={styles.mainOrder} key={idx}>
            <div className={styles.orderName}>
              <div className={styles.orderNum}>
                Order #{idx + 1}
              </div>
              <div className={styles.orderEDS}>
                {order.UserOrder.UserOrderNumber}
              </div>
              {order.UserOrder.IsCOD &&
                <div className={styles.orderCOD}>COD</div>}
            </div>
            <div style={{ clear: 'both' }} />
            <div>
              <div className={styles.tripDetailsLabel}>From</div>
              <div className={styles.tripDetailsValue}>
                {order.UserOrder.PickupAddress &&
                  order.UserOrder.PickupAddress.FirstName +
                    ' ' +
                    order.UserOrder.PickupAddress.LastName}
              </div>
              <div>
                {order.UserOrder.PickupAddress &&
                  order.UserOrder.PickupAddress.Address1}
              </div>
              <div className={styles.tripDetailsLabel}>To</div>
              <div className={styles.tripDetailsValue}>
                {order.UserOrder.DropoffAddress &&
                  order.UserOrder.DropoffAddress.FirstName +
                    ' ' +
                    order.UserOrder.DropoffAddress.LastName}
              </div>
              <div>
                {order.UserOrder.DropoffAddress &&
                  order.UserOrder.DropoffAddress.Address1}
              </div>
              <div className={styles.deadlineValue}>
                Deadline: <Deadline deadline={order.UserOrder.DueTime} />
              </div>
            </div>
          </div>
        );
      }.bind(this)
    );
    return (
      <div>
        {orderComponents}
      </div>
    );
  },
});

const PanelDetails = React.createClass({
  render() {
    const { expandedTrip, shrinkTrip, isExpandDriver } = this.props;
    return (
      <div>
        {expandedTrip &&
          <div
            className={
              isExpandDriver ? styles.panelDetails2 : styles.panelDetails
            }
          >
            <div
              role="none"
              onClick={shrinkTrip}
              className={styles.closeButton}
            >
              &times;
            </div>
            <div className={styles.tripDetails}>
              <div className={styles.reassignButton}>
                <button
                  className={stylesButton.greenButton2}
                  onClick={this.props.expandDriver}
                >
                  Assign
                </button>
              </div>
              <div className={styles.tripDetailsLabel}>TripID</div>
              <div className={styles.tripDetailsValue}>
                TRIP-{expandedTrip.TripID}
              </div>
              <div className={styles.tripDetailsLabel}>From</div>
              <div className={styles.tripDetailsValue}>
                {expandedTrip.TripMerchantsAll || config.TEXT.UNKNOWN}
              </div>
              <div className={styles.tripDetailsLabel}>Destination</div>
              <div className={styles.tripDetailsValue}>
                {expandedTrip.TripDropoffAll || config.TEXT.UNKNOWN}
              </div>
              <div>
                <div className={styles.tripAdditionalInfo}>
                  <div className={styles.tripDetailsLabel}>Weight</div>
                  <div className={styles.tripDetailsValue}>
                    {expandedTrip.Weight} kg
                  </div>
                </div>
                <div className={styles.tripAdditionalInfo}>
                  <div className={styles.tripDetailsLabel}>COD Order</div>
                  <div className={styles.tripDetailsValue}>
                    {expandedTrip.CODOrders} items
                  </div>
                </div>
                <div className={styles.tripAdditionalInfo}>
                  <div className={styles.tripDetailsLabel}>COD Value</div>
                  <div className={styles.tripDetailsValue}>
                    <NumberFormat
                      displayType={'text'}
                      thousandSeparator={'.'}
                      decimalSeparator={','}
                      prefix={'Rp '}
                      value={expandedTrip.CODTotalValue}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.tripValue}>
              <div className={styles.tripValueLabel}>Total Value</div>
              <div className={styles.tripTotalValue}>
                <NumberFormat
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'Rp '}
                  value={expandedTrip.TotalValue}
                />
              </div>
            </div>
            <div className={styles.tripNumOrders}>
              <div className={styles.numOrderLeft}>Number of orders:</div>
              <div className={styles.numOrderRight}>
                {expandedTrip.UserOrderRoutes.length}
              </div>
            </div>
            <div className={styles.tripDetailsOrder}>
              <TripOrders orders={expandedTrip.UserOrderRoutes} />
            </div>
          </div>}
      </div>
    );
  },
});

const Drivers = React.createClass({
  render: function() {
    var driverComponents = this.props.drivers.map(
      function(driver, idx) {
        const isSelected = this.props.selectedDriver === driver.UserID;
        let selectedWeight = this.props.selectedTrip.Weight;
        if (this.props.selectedTrips.length > 0) {
          selectedWeight = 0;
          this.props.selectedTrips.forEach(function(trip) {
            const orders = lodash.map(trip.UserOrderRoutes, route => {
              return route.UserOrder;
            });
            const weight = lodash.sumBy(orders, 'PackageWeight');
            selectedWeight += weight;
          });
        }
        const totalWeight =
          parseFloat(driver.TotalCurrentWeight) + parseFloat(selectedWeight);
        const driverWeight = isSelected
          ? totalWeight
          : parseFloat(driver.TotalCurrentWeight);
        let tripDriverStyle = isSelected
          ? styles.tripDriverSelected
          : styles.tripDriver;
        if (isSelected && totalWeight > driver.AvailableWeight) {
          tripDriverStyle = styles.tripDriverSelectedExceed;
        }
        return (
          <div className={styles.mainDriver} key={idx}>
            <div
              role="none"
              className={tripDriverStyle}
              onClick={() => {
                this.props.setDriver(driver.UserID);
              }}
            >
              <div className={styles.driverInput}>
                <img
                  alt="radio"
                  src={
                    this.props.selectedDriver === driver.UserID
                      ? config.IMAGES.RADIO_ON
                      : config.IMAGES.RADIO_OFF
                  }
                />
              </div>
              <div className={styles.vehicleIcon}>
                <img
                  alt="vehicle"
                  className={styles.driverLoadImage}
                  src={
                    driver.Vehicle && driver.Vehicle.VehicleID === 1
                      ? config.IMAGES.MOTORCYCLE
                      : config.IMAGES.VAN
                  }
                />
              </div>
              <div className={styles.driverDetails}>
                <span className={styles.driverName}>
                  {UtilHelper.trimString(
                    driver.FirstName + ' ' + driver.LastName,
                    20
                  )}
                </span>
              </div>
              <div className={styles.driverDetails}>
                <span className={styles.vendorLoad}>
                  Available Weight {parseFloat(driverWeight).toFixed(2)} /{' '}
                  {driver.AvailableWeight}
                </span>
              </div>
            </div>
          </div>
        );
      }.bind(this)
    );
    return (
      <div>
        {driverComponents}
      </div>
    );
  },
});

const PanelDrivers = React.createClass({
  getInitialState() {
    return { driverList: this.props.drivers, searchValue: '' };
  },
  searchDriver(e) {
    this.setState({ searchValue: e.target.value });
    ReactGA.event({
      category: tripAnalytics.searchDriver.category,
      action: tripAnalytics.searchDriver.action,
      label: this.props.userLogged.hubName,
    });
    let driverList = lodash.filter(this.props.drivers, function(driver) {
      let driverName = driver.FirstName + ' ' + driver.LastName;
      let searchValue = e.target.value;
      return driverName.toLowerCase().includes(searchValue);
    });
    this.setState({ driverList });
  },
  render() {
    const setDriverButton = {
      textBase: 'Assign Driver',
      onClick: this.props.isExpandDriverBulk
        ? this.props.bulkAssignTrip.bind(
            null,
            this.props.selectedTrips,
            this.props.selectedDriver
          )
        : this.props.assignTrip.bind(
            null,
            this.props.expandedTrip.TripID,
            this.props.selectedDriver
          ),
      styles: {
        base: stylesButton.greenButton4,
      },
    };
    return (
      <div className={styles.mainDriverPanel}>
        {this.props.isExpandDriverBulk &&
          <div
            role="none"
            onClick={this.props.shrinkTrip}
            className={styles.closeButton}
          >
            &times;
          </div>}
        {this.props.isExpandDriverBulk &&
          <div className={styles.panelDriverChoose}>
            Choose a driver for {this.props.selectedTrips.length} trip:
          </div>}
        {!this.props.isExpandDriverBulk &&
          <div className={styles.panelDriverChoose}>
            Choose a driver for this trip
          </div>}
        <div className={styles.panelDriverSearch}>
          <input
            className={styles.inputDriverSearch}
            onChange={this.searchDriver}
            placeholder={'Search Driver...'}
          />
        </div>
        <div className={styles.panelDriverList}>
          <Drivers
            selectedDriver={this.props.selectedDriver}
            selectedTrips={this.props.selectedTrips}
            selectedTrip={this.props.expandedTrip}
            setDriver={this.props.setDriver}
            drivers={this.state.driverList}
          />
        </div>
        <div className={styles.setDriverButton}>
          <ButtonWithLoading {...setDriverButton} />
        </div>
      </div>
    );
  },
});

const ErrorAssign = React.createClass({
  render: function() {
    var errorComponents = this.props.errorIDs.map(
      function(error, idx) {
        return (
          <div key={idx}>
            {error.TripID} : {error.error}
          </div>
        );
      }.bind(this)
    );
    return (
      <div>
        {errorComponents}
      </div>
    );
  },
});

const TripPage = React.createClass({
  getInitialState() {
    return {
      driverID: null,
      trips: [],
      selectedTrips: [],
      isSuccessAssign: false,
    };
  },
  componentWillMount() {
    this.props.ShrinkTrip();
    this.props.FetchList();
    this.props.FetchDrivers(this.props.userLogged.userID);
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      isSuccessAssign: nextProps['isSuccessAssign'],
    });
  },
  selectDriver(e) {
    this.setState({ driverID: e.key });
  },
  expandBulkAssign() {
    let selectedTrips = lodash.filter(this.props.trips, ['IsChecked', true]);
    if (selectedTrips.length < 1) {
      alert('No trip selected');
      return;
    }
    this.setState({ selectedTrips });
    this.props.ShrinkTrip();
    setTimeout(
      function() {
        this.props.ExpandDriverBulk();
      }.bind(this),
      100
    );
  },
  exportTrip() {
    this.props.ExportTrip();
  },
  render() {
    const {
      paginationState,
      PaginationAction,
      drivers,
      total,
      userLogged,
      errorIDs,
      successAssign,
      errorAssign,
      trips,
      expandedTrip,
      isExpandTrip,
      isExpandDriver,
      isExpandDriverBulk,
      AssignTrip,
      BulkAssignTrip,
      ShrinkTrip,
      ExpandDriver,
      selectedDriver,
      SetDriver,
    } = this.props;
    return (
      <Page
        title="My Trips"
        count={{ itemName: 'Items', done: 'All Done', value: total }}
      >
        <Pagination2 {...paginationState} {...PaginationAction} />
        <div className={styles.filterOption}>
          <Filter expandDriver={this.expandBulkAssign} />
        </div>
        {(this.props.isFetching || this.props.isLoadingDriver) &&
          <div>
            <div style={{ clear: 'both' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>Fetching data....</div>
            </div>
          </div>}
        {!this.props.isFetching &&
          this.props.trips.length === 0 &&
          !lodash.isEmpty(this.props.filters) &&
          <div>
            <div style={{ clear: 'both' }} />
            <div className={styles.noTripDesc}>
              <img alt="trip done" src={config.IMAGES.INBOUND_TRIP_DONE} />
              <div style={{ fontSize: 20 }}>Trips not found</div>
              <div style={{ fontSize: 12, marginTop: 20 }}>
                Please choose another filter to get the orders.
              </div>
            </div>
          </div>}
        {!this.props.isFetching &&
          this.props.trips.length === 0 &&
          lodash.isEmpty(this.props.filters) &&
          <div>
            <div style={{ clear: 'both' }} />
            <div className={styles.noTripDesc}>
              <img alt="trip done" src={config.IMAGES.INBOUND_TRIP_DONE} />
              <div style={{ fontSize: 20 }}>Awesome work guys!</div>
              <div style={{ fontSize: 12, marginTop: 20 }}>
                You have assign all trips, please always check if there’s
                another trip to assign every 5 minutes.
              </div>
            </div>
          </div>}
        {!this.props.isFetching &&
          !this.props.isLoadingDriver &&
          this.props.trips.length > 0 &&
          <div>
            <Table trips={trips} />
            {isExpandTrip &&
              <PanelDetails
                isExpandDriver={isExpandDriver}
                expandedTrip={expandedTrip}
                shrinkTrip={ShrinkTrip}
                expandDriver={ExpandDriver}
              />}
            {isExpandDriver &&
              <PanelDrivers
                selectedTrips={this.state.selectedTrips}
                isExpandDriverBulk={isExpandDriverBulk}
                shrinkTrip={ShrinkTrip}
                expandedTrip={expandedTrip}
                assignTrip={AssignTrip}
                bulkAssignTrip={BulkAssignTrip}
                selectedDriver={selectedDriver}
                setDriver={SetDriver}
                drivers={drivers}
                userLogged={userLogged}
              />}
          </div>}

        {this.state.isSuccessAssign &&
          <ModalContainer>
            <ModalDialog>
              {errorIDs.length > 0 &&
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Assign Report</h2>
                    <div
                      className={
                        styles.successContent + ' ' + styles.ordersContentEmpty
                      }
                    >
                      <div>
                        Success: {successAssign}
                      </div>
                      <div>
                        Error: {errorAssign}
                      </div>
                      <ErrorAssign errorIDs={errorIDs} />
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button
                      className={styles.endButton}
                      onClick={this.props.CloseSuccessAssign}
                    >
                      <span className={styles.mediumText}>Got It</span>
                    </button>
                  </div>
                </div>}
              {errorIDs.length === 0 &&
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Success</h2>
                    <div
                      className={
                        styles.successContent + ' ' + styles.ordersContentEmpty
                      }
                    >
                      <img
                        alt="success"
                        className={styles.successIcon}
                        src={config.IMAGES.ICON_SUCCESS}
                      />
                      <div className={styles.mediumText}>
                        You have successfully assigned this trip
                      </div>
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button
                      className={styles.endButton}
                      onClick={this.props.CloseSuccessAssign}
                    >
                      <span className={styles.mediumText}>Got It</span>
                    </button>
                  </div>
                </div>}
            </ModalDialog>
          </ModalContainer>}
      </Page>
    );
  },
});

function StoreToTripsPage(store) {
  const {
    currentPage,
    limit,
    total,
    isFetching,
    filters,
    trips,
    errorIDs,
    successAssign,
    errorAssign,
    expandedTrip,
    isExpandTrip,
    isExpandDriver,
    isExpandDriverBulk,
    selectedDriver,
    isSuccessAssign,
  } = store.app.myTrips;
  const userLogged = store.app.userLogged;
  const driversStore = store.app.driversStore;
  const driverList = driversStore.driverList;
  const isLoadingDriver = driverList.isLoading;
  const fleetDrivers = driversStore.fleetDrivers;
  const drivers = fleetDrivers.driverList;
  return {
    trips,
    drivers,
    userLogged,
    paginationState: {
      currentPage,
      limit,
      total,
    },
    expandedTrip,
    isFetching,
    filters,
    isExpandTrip,
    isExpandDriver,
    isExpandDriverBulk,
    total,
    selectedDriver,
    isSuccessAssign,
    isLoadingDriver,
    errorIDs,
    successAssign,
    errorAssign,
  };
}

function DispatchToTripsPage(dispatch) {
  return {
    FetchList: () => {
      dispatch(TripService.FetchList());
    },
    FetchDrivers: fleetID => {
      dispatch(TMSFetchDrivers(fleetID, true));
    },
    AssignTrip: (trips, driverID) => {
      dispatch(TripService.AssignDriver(trips, driverID));
    },
    BulkAssignTrip: (trips, driverID) => {
      dispatch(TripService.BulkAssignDriver(trips, driverID));
    },
    ExportTrip: () => {
      dispatch(TripService.ExportTrip());
    },
    ShrinkTrip: () => {
      dispatch(TripService.ShrinkTrip());
      dispatch(TripService.ResetDriver());
    },
    ExpandDriver: () => {
      dispatch(TripService.ExpandDriver());
    },
    ExpandDriverBulk: () => {
      dispatch(TripService.ExpandDriverBulk());
    },
    CloseSuccessAssign: () => {
      dispatch(TripService.CloseSuccessAssign());
    },
    SetDriver: driverID => {
      dispatch(TripService.SetDriver(driverID));
    },
    PaginationAction: {
      setCurrentPage: currentPage => {
        dispatch(TripService.SetCurrentPage(currentPage));
      },
      setLimit: limit => {
        dispatch(TripService.SetLimit(limit));
      },
    },
  };
}

export default connect(StoreToTripsPage, DispatchToTripsPage)(TripPage);
