/* eslint no-underscore-dangle: ["error", { "allow": ["_milliseconds"] }] */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import NumberFormat from 'react-number-format';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import * as _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Page } from '../views/base';
import { Pagination2 } from '../components/pagination2';
import { ButtonWithLoading } from '../components/Button';
import Table, { Filter, Deadline } from './tripTable';
import * as TripService from './tripService';
import driversFetch from '../modules/drivers/actions/driversFetch';
import styles from './styles.scss';
import stylesButton from '../components/Button/styles.scss';
import * as UtilHelper from '../helper/utility';
import config from '../config/configValues.json';

function TripOrders({ orders }) {
  const orderComponents = orders.map((order, idx) => {
    const deadline = moment(order.UserOrder.DueTime).format('DD-MM-YYYY');
    const duration = moment.duration(moment(order.UserOrder.DueTime).diff(moment(new Date())));
    return (
      <div className={styles.mainOrder} key={order.UserOrderRouteID}>
        <div className={styles.orderName}>
          <div className={styles.orderNum}>
            Order #{idx + 1}
          </div>
          <div className={styles.orderEDS}>
            {order.UserOrder.UserOrderNumber}
          </div>
          {
            order.UserOrder.IsCOD &&
            <div className={styles.orderCOD}>
              COD
            </div>
          }
        </div>
        <div style={{ clear: 'both' }} />
        <div>
          <div className={styles.tripDetailsLabel}>
            From
          </div>
          <div className={styles.tripDetailsValue}>
            {order.UserOrder.PickupAddress && `${order.UserOrder.PickupAddress.FirstName} ${order.UserOrder.PickupAddress.LastName}`}
          </div>
          <div>
            {order.UserOrder.PickupAddress && order.UserOrder.PickupAddress.Address1}
          </div>
          <div className={styles.tripDetailsLabel}>
            To
          </div>
          <div className={styles.tripDetailsValue}>
            {order.UserOrder.DropoffAddress && `${order.UserOrder.DropoffAddress.FirstName} ${order.UserOrder.DropoffAddress.LastName}`}
          </div>
          <div>
            {order.UserOrder.DropoffAddress && order.UserOrder.DropoffAddress.Address1}
          </div>
          <div className={styles.deadlineValue}>
            Deadline: <Deadline deadline={order.UserOrder.DueTime} />
            <span className={duration._milliseconds < 0 ? styles['text-red'] : styles['text-black']}>
              {duration._milliseconds < 0 && <br />}
              ({deadline})
              </span>
          </div>
        </div>
      </div>
    );
  });
  return <div>{orderComponents}</div>;
}

/* eslint-disable */
TripOrders.propTypes = {
  orders: PropTypes.array,
};
/* eslint-enable */

TripOrders.defaultProps = {
  orders: [],
};

function PanelDetails({ expandedTrip, shrinkTrip, isExpandDriver, expandDriver }) {
  const tripStatusStyles = styles[`tripStatus${expandedTrip.OrderStatus.OrderStatusID}`];
  return (
    <div>
      {expandedTrip &&
        <div className={isExpandDriver ? styles.panelDetails2 : styles.panelDetails}>
          <div role="none" onClick={shrinkTrip} className={styles.closeButton}>
            &times;
          </div>
          <div className={tripStatusStyles}>
            {expandedTrip.OrderStatus.OrderStatus}
          </div>
          {expandedTrip.Driver &&
            <div className={styles.tripDriver}>
              <div className={styles.vehicleIcon}>
                <img
                  alt="vehicle"
                  className={styles.driverLoadImage}
                  src={expandedTrip.Driver && expandedTrip.Driver.Vehicle &&
                    expandedTrip.Driver.Vehicle.Name === config
                      .vehicle[config.vehicleType.Motorcycle - 1].value ?
                    config.IMAGES.MOTORCYCLE : config.IMAGES.VAN}
                />
              </div>
              <div className={styles.driverDetails}>
                <span className={styles.driverName}>
                  {UtilHelper.trimString(expandedTrip.Driver && `${expandedTrip.Driver.FirstName} ${expandedTrip.Driver.LastName}`, 20)}
                </span>
              </div>
              <div className={styles.driverDetails}>
                <span className={styles.vendorLoad}>
                  Available Weight
                   {expandedTrip.Driver && expandedTrip.Driver.TotalWeight} /
                    {expandedTrip.Driver && expandedTrip.Driver.AvailableWeight}
                </span>
              </div>
            </div>
          }
          <div className={styles.tripDetails}>
            <div className={styles.reassignButton}>
              <button className={stylesButton.greenButton2} onClick={expandDriver}>Assign</button>
            </div>
            <div className={styles.tripDetailsLabel}>
              TripID
            </div>
            <div className={styles.tripDetailsValue}>
              TRIP-{expandedTrip.TripID}
            </div>
            <div className={styles.tripDetailsLabel}>
              From
            </div>
            <div className={styles.tripDetailsValue}>
              {expandedTrip.TripMerchantsAll || 'Unknown'}
            </div>
            <div className={styles.tripDetailsLabel}>
              Destination
            </div>
            <div className={styles.tripDetailsValue}>
              {expandedTrip.TripDropoffAll || 'Unknown'}
            </div>
            <div>
              <div className={styles.tripAdditionalInfo}>
                <div className={styles.tripDetailsLabel}>
                  Weight
                </div>
                <div className={styles.tripDetailsValue}>
                  {expandedTrip.Weight} kg
                </div>
              </div>
              <div className={styles.tripAdditionalInfo}>
                <div className={styles.tripDetailsLabel}>
                  COD Order
                </div>
                <div className={styles.tripDetailsValue}>
                  {expandedTrip.CODOrders} items
                </div>
              </div>
              <div className={styles.tripAdditionalInfo}>
                <div className={styles.tripDetailsLabel}>
                  COD Value
                </div>
                <div className={styles.tripDetailsValue}>
                  <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={expandedTrip.CODTotalValue} />
                </div>
              </div>
            </div>
          </div>
          <div className={styles.tripValue}>
            <div className={styles.tripValueLabel}>
              Total Value
            </div>
            <div className={styles.tripTotalValue}>
              <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={expandedTrip.TotalValue} />
            </div>
          </div>
          <div className={styles.tripNumOrders}>
            <div className={styles.numOrderLeft}>
              Number of orders:
            </div>
            <div className={styles.numOrderRight}>
              {expandedTrip.UserOrderRoutes.length}
            </div>
          </div>
          <div className={styles.tripDetailsOrder}>
            <TripOrders orders={expandedTrip.UserOrderRoutes} />
          </div>
        </div>
      }
    </div>
  );
}

/* eslint-disable */
PanelDetails.propTypes = {
  expandedTrip: PropTypes.any.isRequired,
  shrinkTrip: PropTypes.func,
  isExpandDriver: PropTypes.bool,
  expandDriver: PropTypes.func,
};
/* eslint-enable */

PanelDetails.defaultProps = {
  shrinkTrip: () => { },
  isExpandDriver: false,
  expandDriver: () => { },
};

class Drivers extends Component {
  handleDriversView() {
    const driverComponents = this.props.drivers.map((driver) => {
      const isSelected = this.props.selectedDriver === driver.UserID;
      let selectedWeight = this.props.selectedTrip.Weight;
      if (this.props.selectedTrips.length > 0) {
        selectedWeight = 0;
        this.props.selectedTrips.forEach((trip) => {
          const orders = _.map(trip.UserOrderRoutes, (route) => {
            const userOrder = route.UserOrder;
            return userOrder;
          });
          const weight = _.sumBy(orders, 'PackageWeight');
          selectedWeight += weight;
        });
      }
      const totalWeight = parseFloat(driver.TotalCurrentWeight) + parseFloat(selectedWeight);
      const driverWeight = isSelected ? totalWeight : parseFloat(driver.TotalCurrentWeight);
      let tripDriverStyle = isSelected ? styles.tripDriverSelected : styles.tripDriver;
      if (isSelected && (totalWeight > driver.AvailableWeight)) {
        tripDriverStyle = styles.tripDriverSelectedExceed;
      }
      return (
        <div className={styles.mainDriver} key={driver.UserID}>
          <div
            role="none"
            className={tripDriverStyle}
            onClick={() => { this.props.setDriver(driver.UserID); }}
          >
            <div className={styles.driverInput}>
              <img
                alt="vehicle"
                src={this.props.selectedDriver === driver.UserID ?
                  config.IMAGES.RADIO_ON : config.IMAGES.RADIO_OFF}
              />
            </div>
            <div className={styles.vehicleIcon}>
              <img
                alt="vehicle"
                className={styles.driverLoadImage}
                src={driver.Vehicle && driver.Vehicle.VehicleID === 1 ?
                  config.IMAGES.MOTORCYCLE : config.IMAGES.VAN}
              />
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.driverName}>
                {UtilHelper.trimString(`${driver.FirstName} ${driver.LastName}`, 20)}
              </span>
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.vendorLoad}>
                Available Weight {parseFloat(driverWeight).toFixed(2)} / {driver.AvailableWeight}
              </span>
            </div>
          </div>
        </div>
      );
    });
    return driverComponents;
  }
  render() {
    return <div>{this.handleDriversView()}</div>;
  }
}

/* eslint-disable */
Drivers.propTypes = {
  drivers: PropTypes.array,
  selectedTrips: PropTypes.array,
  selectedDriver: PropTypes.any,
  selectedTrip: PropTypes.any,
  setDriver: PropTypes.func,
};
/* eslint-enable */

Drivers.defaultProps = {
  drivers: [],
  selectedTrips: [],
  selectedDriver: {},
  selectedTrip: {},
  setDriver: () => { },
};

class PanelDrivers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      driverList: this.props.drivers,
      searchValue: '',
    };
  }
  searchDriver(e) {
    this.setState({ searchValue: e.target.value });
    const driverList = _.filter(this.props.drivers, (driver) => {
      const driverName = `${driver.FirstName} ${driver.LastName}`;
      const searchValue = e.target.value;
      return driverName.toLowerCase().includes(searchValue);
    });
    this.setState({ driverList });
  }
  render() {
    const setDriverButton = {
      textBase: 'Assign Driver',
      onClick: this.props.isExpandDriverBulk ?
        this.props.bulkAssignTrip.bind(null, this.props.selectedTrips, this.props.selectedDriver) :
        this.props.assignTrip.bind(null, this.props.expandedTrip.TripID, this.props.selectedDriver),
      styles: {
        base: stylesButton.greenButton4,
      },
    };
    return (
      <div className={styles.mainDriverPanel}>
        {this.props.isExpandDriverBulk &&
          <div role="none" onClick={this.props.shrinkTrip} className={styles.closeButton}>
            &times;
          </div>
        }
        {this.props.isExpandDriverBulk &&
          <div className={styles.panelDriverChoose}>
            Choose a driver for {this.props.selectedTrips.length} trip:
          </div>
        }
        {!this.props.isExpandDriverBulk &&
          <div className={styles.panelDriverChoose}>
            Choose a driver for this trip
          </div>
        }
        <div className={styles.panelDriverSearch}>
          <input className={styles.inputDriverSearch} onChange={this.searchDriver} placeholder={'Search Driver...'} />
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
  }
}

/* eslint-disable */
PanelDrivers.propTypes = {
  selectedDriver: PropTypes.any,
  selectedTrips: PropTypes.any,
  expandedTrip: PropTypes.any,
  setDriver: PropTypes.func,
  bulkAssignTrip: PropTypes.func,
  assignTrip: PropTypes.func,
  isExpandDriverBulk: PropTypes.bool,
  shrinkTrip: PropTypes.func,
  drivers: PropTypes.any,
};
/* eslint-enable */

PanelDrivers.defaultProps = {
  selectedDriver: {},
  selectedTrips: {},
  expandedTrip: {},
  setDriver: () => { },
  bulkAssignTrip: () => { },
  assignTrip: () => { },
  isExpandDriverBulk: false,
  shrinkTrip: () => { },
  drivers: {},
};

function ErrorAssign({ errorIDs }) {
  return (
    <div>
      {errorIDs.map((error, idx) => (
        <div key={idx}>
          {error.TripID} : {error.error}
        </div>
      ))}
    </div>
  );
}

/* eslint-disable */
ErrorAssign.propTypes = {
  errorIDs: PropTypes.array
};
/* eslint-enable */

ErrorAssign.defaultProps = {
  errorIDs: [],
};

function TripNotFound() {
  return (
    <div>
      <div style={{ clear: 'both' }} />
      <div className={styles.noTripDesc}>
        <img alt="on going trips" src={config.IMAGES.ON_GOING_TRIPS} />
        <div style={{ fontSize: 20 }}>
          Trips not found
        </div>
        <div style={{ fontSize: 12, marginTop: 20 }}>
          Please choose another filter to get the orders.
        </div>
      </div>
    </div>
  );
}

function NoOngoingTrips() {
  return (
    <div>
      <div style={{ clear: 'both' }} />
      <div className={styles.noTripDesc}>
        <img alt="on going trips" src={config.IMAGES.ON_GOING_TRIPS} />
        <div style={{ fontSize: 20 }}>
          You do not have any ongoing trips right now
        </div>
        <div style={{ fontSize: 12, marginTop: 20 }}>
          Please check and assign more trips on the “My Trips” Page.
        </div>
      </div>
    </div>
  );
}

const TripPage = React.createClass({
  getInitialState() {
    return ({ driverID: null, trips: [], selectedTrips: [], isSuccessAssign: false });
  },
  componentWillMount() {
    this.props.ShrinkTrip();
    this.props.FetchList();
    this.props.FetchDrivers(this.props.userLogged.userID);
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      isSuccessAssign: nextProps.isSuccessAssign,
    });
  },
  selectDriver(e) {
    this.setState({ driverID: e.key });
  },
  expandBulkAssign() {
    const selectedTrips = _.filter(this.props.trips, ['IsChecked', true]);
    if (selectedTrips.length < 1) {
      alert('No trip selected');
      return;
    }
    this.setState({ selectedTrips });
    this.props.ShrinkTrip();
    setTimeout(() => {
      this.props.ExpandDriverBulk();
    }, 100);
  },
  exportTrip() {
    this.props.ExportTrip();
  },
  render() {
    const {
      paginationState,
      PaginationAction,
      errorIDs,
      successAssign,
      errorAssign,
      drivers,
      total,
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
      <Page title="My Ongoing Trips" count={{ itemName: 'Items', done: 'All Done', value: total }}>
        <Pagination2 {...paginationState} {...PaginationAction} />
        <div className={styles.filterOption}>
          <Filter expandDriver={this.expandBulkAssign} />
        </div>
        {
          (this.props.isFetching || this.props.isLoadingDriver) &&
          <div>
            <div style={{ clear: 'both' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 20 }}>
                Fetching data....
              </div>
            </div>
          </div>
        }
        {
          !this.props.isFetching && this.props.trips.length === 0 &&
          !_.isEmpty(this.props.filters) &&
          <TripNotFound />
        }
        {
          !this.props.isFetching &&
          this.props.trips.length === 0 && _.isEmpty(this.props.filters) &&
          <NoOngoingTrips />
        }
        {
          !this.props.isFetching && !this.props.isLoadingDriver && this.props.trips.length > 0 &&
          <div>
            <Table trips={trips} />
            {
              isExpandTrip &&
              <PanelDetails
                isExpandDriver={isExpandDriver}
                expandedTrip={expandedTrip}
                shrinkTrip={ShrinkTrip}
                expandDriver={ExpandDriver}
              />
            }
            {
              isExpandDriver &&
              <PanelDrivers
                bulkAssignTrip={BulkAssignTrip}
                selectedTrips={this.state.selectedTrips}
                isExpandDriverBulk={isExpandDriverBulk}
                shrinkTrip={ShrinkTrip}
                expandedTrip={expandedTrip}
                assignTrip={AssignTrip}
                selectedDriver={selectedDriver}
                setDriver={SetDriver}
                drivers={drivers}
              />
            }
          </div>
        }

        {this.state.isSuccessAssign &&
          <ModalContainer>
            <ModalDialog>
              {
                errorIDs.length > 0 &&
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Assign Report</h2>
                    <div className={`${styles.successContent} ${styles.ordersContentEmpty}`}>
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
                    <button className={styles.endButton} onClick={this.props.CloseSuccessAssign}>
                      <span className={styles.mediumText}>Got It</span>
                    </button>
                  </div>
                </div>
              }
              {errorIDs.length === 0 &&
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Success</h2>
                    <div className={`${styles.successContent} ${styles.ordersContentEmpty}`}>
                      <img alt="success" className={styles.successIcon} src={config.IMAGES.ICON_SUCCESS} />
                      <div className={styles.mediumText}>
                        You have successfully assigned this trip
                      </div>
                      <ErrorAssign errorIDs={errorIDs} />
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.endButton} onClick={this.props.CloseSuccessAssign}>
                      <span className={styles.mediumText}>Got It</span>
                    </button>
                  </div>
                </div>
              }
            </ModalDialog>
          </ModalContainer>
        }
      </Page>
    );
  },
});

function StoreToTripsPage(store) {
  const { currentPage, limit, total, isFetching,
    filters, trips, errorIDs, successAssign, errorAssign,
    expandedTrip, isExpandTrip, isExpandDriver,
    isExpandDriverBulk, selectedDriver,
    isSuccessAssign } = store.app.myOngoingTrips;
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
      currentPage, limit, total,
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
    FetchDrivers: (fleetID) => {
      dispatch(driversFetch(fleetID, true));
    },
    AssignTrip: (trips, driverID) => {
      dispatch(TripService.ReassignDriver(trips, driverID));
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
    SetDriver: (driverID) => {
      dispatch(TripService.SetDriver(driverID));
    },
    PaginationAction: {
      setCurrentPage: (currentPage) => {
        dispatch(TripService.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(TripService.SetLimit(limit));
      },
    },
  };
}

export default connect(StoreToTripsPage, DispatchToTripsPage)(TripPage);
