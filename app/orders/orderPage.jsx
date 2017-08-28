/* eslint no-underscore-dangle: ["error", { "allow": ["_milliseconds"] }] */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import NumberFormat from 'react-number-format';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';
import { push } from 'react-router-redux';

import * as _ from 'lodash';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Page } from '../views/base';
import { Pagination2 } from '../components/pagination2';
import { ButtonWithLoading, ButtonBase } from '../components/Button';
import Table, { Filter, Deadline } from './orderTable';
import * as OrderService from './orderService';
import { TMSFetchDrivers } from '../modules/drivers/actions/driversFetch';
import styles from './styles.scss';
import stylesButton from '../components/Button/styles.scss';
import * as UtilHelper from '../helper/utility';
import Glyph from '../components/Glyph';
import config from '../config/configValues.json';

const PanelDetails = React.createClass({
  render() {
    const { expandedOrder, shrinkOrder, isExpandDriver } = this.props;
    const duration = moment.duration(
      moment(expandedOrder.DueTime).diff(moment(new Date()))
    );
    const deadline = moment(expandedOrder.DueTime).format(
      config.DATE_FORMAT.DATE_MONTH_YEAR
    );
    return (
      <div>
        {expandedOrder &&
          <div
            className={
              isExpandDriver ? styles.panelDetails2 : styles.panelDetails
            }
          >
            <div
              role="none"
              onClick={shrinkOrder}
              className={styles.closeButton}
            >
              &times;
            </div>
            <div className={styles.orderDueTime}>
              <Deadline deadline={expandedOrder.DueTime} />
              <br />
              <p
                className={`${duration._milliseconds < 0
                  ? styles['text-red']
                  : styles['text-black']} 
                 ${styles.deadlineDate}`}
              >
                ({deadline})
              </p>
            </div>
            <div className={styles.orderDetails}>
              <div className={styles.reassignButton}>
                <button
                  className={stylesButton.greenButton2}
                  onClick={this.props.expandDriver}
                >
                  Assign
                </button>
              </div>
              <div className={styles.orderDetailsLabel}>Order ID</div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.UserOrderNumber}
              </div>
              <div className={styles.orderDetailsLabel}>Web Order ID</div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.WebOrderID}
              </div>
              <div className={styles.orderDetailsLabel}>Origin</div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.PickupAddress &&
                  expandedOrder.PickupAddress.City}
              </div>
              <div className={styles.orderDetailsLabel}>Destination</div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.DropoffAddress &&
                  expandedOrder.DropoffAddress.City}
              </div>
              <div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>Weight</div>
                  <div className={styles.orderDetailsValue}>
                    {parseFloat(expandedOrder.PackageWeight).toFixed(2)} kg
                  </div>
                </div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>COD Type</div>
                  <div className={styles.orderDetailsValue}>
                    {expandedOrder.IsCOD ? 'COD' : 'Non-COD'}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.orderValue}>
              <div className={styles.orderValueLabel}>Total Value</div>
              <div className={styles.orderTotalValue}>
                <NumberFormat
                  displayType={'text'}
                  thousandSeparator={'.'}
                  decimalSeparator={','}
                  prefix={'Rp '}
                  value={expandedOrder.TotalValue}
                />
              </div>
            </div>
            <div className={styles.scrollable}>
              <div className={styles.orderDetails}>
                <div className={styles.orderDetailsLabel}>From</div>
                <div className={styles.orderDetailsValue}>
                  {expandedOrder.PickupAddress &&
                    `${expandedOrder.PickupAddress.FirstName} ${expandedOrder
                      .PickupAddress.LastName}`}
                </div>
                <div className={styles.orderDetailsValue2}>
                  {expandedOrder.PickupAddress &&
                    expandedOrder.PickupAddress.Address1}
                </div>
              </div>
              <div className={styles.orderDetails}>
                <div className={styles.orderDetailsLabel}>To</div>
                <div className={styles.orderDetailsValue}>
                  {expandedOrder.DropoffAddress &&
                    `${expandedOrder.DropoffAddress.FirstName} ${expandedOrder
                      .DropoffAddress.LastName}`}
                </div>
                <div className={styles.orderDetailsValue2}>
                  {expandedOrder.DropoffAddress &&
                    expandedOrder.DropoffAddress.Address1}
                </div>
              </div>
            </div>
          </div>}
      </div>
    );
  },
});

class Drivers extends Component {
  render() {
    const driverComponents = this.props.drivers.map(driver => {
      const isSelected = this.props.selectedDriver === driver.UserID;
      let selectedWeight = this.props.selectedOrder.PackageWeight;
      if (this.props.selectedOrders.length > 0) {
        selectedWeight = 0;
        this.props.selectedOrders.forEach(order => {
          selectedWeight += order.PackageWeight;
        });
      }
      const totalWeight =
        parseFloat(driver.TotalCurrentWeight) + parseFloat(selectedWeight);
      const driverWeight = isSelected
        ? totalWeight
        : parseFloat(driver.TotalCurrentWeight);
      let orderDriverStyle = isSelected
        ? styles.orderDriverSelected
        : styles.orderDriver;
      if (isSelected && totalWeight > driver.AvailableWeight) {
        orderDriverStyle = styles.orderDriverSelectedExceed;
      }
      return (
        <div className={styles.mainDriver} key={driver.UserID}>
          <div
            role="none"
            className={orderDriverStyle}
            onClick={() => this.props.setDriver(driver.UserID)}
          >
            <div className={styles.driverInput}>
              <img
                alt="radio button"
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
                  driver.Vehicle &&
                  driver.Vehicle.VehicleID === config.vehicleType.Motorcycle
                    ? config.IMAGES.MOTORCYCLE
                    : config.IMAGES.VAN
                }
              />
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.driverName}>
                {UtilHelper.trimString(
                  `${driver.FirstName} ${driver.LastName}`,
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
    });
    return (
      <div>
        {driverComponents}
      </div>
    );
  }
}

/* eslint-disable */
Drivers.propTypes = {
  drivers: PropTypes.array,
  selectedDriver: PropTypes.any,
  selectedOrder: PropTypes.any,
  selectedOrders: PropTypes.any,
  setDriver: PropTypes.func,
};
/* eslint-enable */

Drivers.defaultProps = {
  drivers: [],
  selectedDriver: {},
  selectedOrder: {},
  selectedOrders: [],
  setDriver: () => {},
};

class PanelDrivers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      driverList: this.props.drivers,
      searchValue: '',
    };

    this.searchDriver = this.searchDriver.bind(this);
  }
  searchDriver(e) {
    this.setState({ searchValue: e.target.value });
    const driverList = _.filter(this.props.drivers, driver => {
      const driverName = `${driver.FirstName} ${driver.LastName}`;
      const searchValue = e.target.value;
      return driverName.toLowerCase().includes(searchValue);
    });
    this.setState({ driverList });
  }
  render() {
    const setDriverButton = {
      textBase: 'Assign Driver',
      onClick: this.props.isExpandDriverBulk
        ? this.props.bulkAssignOrder.bind(
            null,
            this.props.selectedOrders,
            this.props.selectedDriver
          )
        : this.props.assignOrder.bind(
            null,
            this.props.expandedOrder.UserOrderID,
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
            onClick={this.props.shrinkOrder}
            className={styles.closeButton}
          >
            &times;
          </div>}
        {this.props.isExpandDriverBulk &&
          <div className={styles.panelDriverChoose}>
            Choose a driver for {this.props.selectedOrders.length} order:
          </div>}
        {!this.props.isExpandDriverBulk &&
          <div className={styles.panelDriverChoose}>
            Choose a driver for this order
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
            selectedOrders={this.props.selectedOrders}
            selectedOrder={this.props.expandedOrder}
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
  drivers: PropTypes.any,
  isExpandDriverBulk: PropTypes.bool,
  bulkAssignOrder: PropTypes.func,
  selectedOrders: PropTypes.any,
  selectedDriver: PropTypes.any,
  assignOrder: PropTypes.func,
  expandedOrder: PropTypes.any,
  shrinkOrder: PropTypes.func,
  setDriver: PropTypes.func,
};
/* eslint-enable */

PanelDrivers.defaultProps = {
  drivers: [],
  isExpandDriverBulk: false,
  bulkAssignOrder: () => {},
  selectedOrders: {},
  selectedDriver: {},
  assignOrder: () => {},
  expandedOrder: {},
  shrinkOrder: () => {},
  setDriver: () => {},
};

function ErrorAssign({ errorIDs }) {
  return (
    <div>
      {errorIDs.map(error =>
        <div key={error.UserOrderID}>
          {error.UserOrderID} : {error.error}
        </div>
      )}
    </div>
  );
}

/* eslint-disable */
ErrorAssign.propTypes = {
  errorIDs: PropTypes.any.isRequired,
};
/* eslint-enable */

const OrderPage = React.createClass({
  getInitialState() {
    return {
      opened: true,
      idsRaw: '',
      ids: [],
      idsStart: '',
      driverID: null,
      orders: [],
      selectedOrders: [],
      isSuccessAssign: false,
    };
  },
  toggleOpen() {
    this.setState({ opened: !this.state.opened, idsStart: this.state.idsRaw });
  },
  cancelChange() {
    this.setState({ opened: true, idsRaw: '', ids: [] });
  },
  textChange(e) {
    this.setState({ idsRaw: e.target.value });
  },
  processText() {
    const IDs = _.chain(this.state.idsRaw.match(/\S+/g)).uniq().value();
    if (IDs.length === 0) {
      alert('Please write EDS Number or Order ID');
      return;
    }
    this.setState({ ids: IDs });
    this.toggleOpen();
    const newFilters = { userOrderNumbers: JSON.stringify(IDs) };
    this.props.UpdateAndFetch(newFilters);
  },
  clearText() {
    this.setState({ opened: true, idsRaw: '', ids: [] });
    this.setState({ ids: [] });
    const newFilters = { userOrderNumbers: [] };
    this.props.UpdateAndFetch(newFilters);
  },
  componentWillMount() {
    this.clearText();
    this.props.ShrinkOrder();
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
    const selectedOrders = _.filter(this.props.orders, ['IsChecked', true]);
    if (selectedOrders.length < 1) {
      alert('No order selected');
      return;
    }
    this.setState({ selectedOrders });
    this.props.ShrinkOrder();
    setTimeout(() => {
      this.props.ExpandDriverBulk();
    }, 100);
  },
  render() {
    const {
      paginationState,
      PaginationAction,
      drivers,
      total,
      errorIDs,
      successAssign,
      errorAssign,
      orders,
      expandedOrder,
      isExpandOrder,
      isExpandDriver,
      isExpandDriverBulk,
      AssignOrder,
      BulkAssignOrder,
      ShrinkOrder,
      ExpandDriver,
      selectedDriver,
      SetDriver,
    } = this.props;
    return (
      <Page
        title="My Orders"
        count={{ itemName: 'Items', done: 'All Done', value: total }}
      >
        <div>
          <div
            role="none"
            className={styles.addCompanyOrderButton}
            onClick={this.props.GoToAddOrder}
          >
            + Add Company Order
          </div>
          <div className={styles.filterOrderArea}>
            {this.state.opened
              ? <div
                  role="none"
                  className={styles.top2}
                  onClick={this.toggleOpen}
                >
                  <h4 className={styles.title}>
                    <Glyph name="chevron-down" className={styles.glyphFilter} />
                    {this.state.ids.length
                      ? `Search multiple orders (${this.state.ids
                          .length} keywords)`
                      : 'Search multiple orders'}
                  </h4>
                </div>
              : <div className={styles.panel2}>
                  <div
                    role="none"
                    className={styles.top}
                    onClick={this.toggleOpen}
                  >
                    <h4 className={styles.title}>
                      <Glyph name="chevron-up" className={styles.glyphFilter} />
                      {'Search multiple orders:'}
                    </h4>
                  </div>
                  <div className={styles.bottom}>
                    <textarea
                      style={{ height: 100, width: '100%' }}
                      value={this.state.idsRaw}
                      onChange={this.textChange}
                      placeholder={
                        'Write/Paste EDS Number or Order ID here, separated with newline'
                      }
                    />
                    <ButtonBase
                      styles={styles.modalBtn}
                      onClick={this.processText}
                    >
                      Filter
                    </ButtonBase>
                    <ButtonBase
                      styles={styles.modalBtn}
                      onClick={this.clearText}
                    >
                      Clear
                    </ButtonBase>
                    <ButtonBase
                      styles={styles.modalBtn}
                      onClick={this.cancelChange}
                    >
                      Cancel
                    </ButtonBase>
                  </div>
                </div>}
          </div>
        </div>
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
          this.props.orders.length === 0 &&
          !_.isEmpty(this.props.filters) &&
          <div>
            <div style={{ clear: 'both' }} />
            <div className={styles.noOrderDesc}>
              <img alt="done" src={config.IMAGES.ORDERS_DONE} />
              <div style={{ fontSize: 20 }}>Orders not found</div>
              <div style={{ fontSize: 12, marginTop: 20 }}>
                Please choose another filter to get the orders.
              </div>
            </div>
          </div>}
        {!this.props.isFetching &&
          this.props.orders.length === 0 &&
          _.isEmpty(this.props.filters) &&
          <div>
            <div style={{ clear: 'both' }} />
            <div className={styles.noOrderDesc}>
              <img alt="done" src={config.IMAGES.ORDERS_DONE} />
              <div style={{ fontSize: 20 }}>
                You dont have any orders right now!
              </div>
              <div style={{ fontSize: 12, marginTop: 20 }}>
                You have assign all orders
              </div>
            </div>
          </div>}
        {!this.props.isFetching &&
          !this.props.isLoadingDriver &&
          this.props.orders.length > 0 &&
          <div>
            <Table orders={orders} />
            {isExpandOrder &&
              <PanelDetails
                isExpandDriver={isExpandDriver}
                expandedOrder={expandedOrder}
                shrinkOrder={ShrinkOrder}
                expandDriver={ExpandDriver}
              />}
            {isExpandDriver &&
              <PanelDrivers
                selectedOrders={this.state.selectedOrders}
                isExpandDriverBulk={isExpandDriverBulk}
                shrinkOrder={ShrinkOrder}
                expandedOrder={expandedOrder}
                assignOrder={AssignOrder}
                bulkAssignOrder={BulkAssignOrder}
                selectedDriver={selectedDriver}
                setDriver={SetDriver}
                drivers={drivers}
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
                      className={`${styles.successContent} ${styles.ordersContentEmpty}`}
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
                      className={`${styles.successContent} ${styles.ordersContentEmpty}`}
                    >
                      <img
                        alt="success"
                        className={styles.successIcon}
                        src={config.IMAGES.ICON_SUCCESS}
                      />
                      <div className={styles.mediumText}>
                        You have successfully assigned this order
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

function StoreToOrdersPage(store) {
  const {
    currentPage,
    limit,
    total,
    isFetching,
    filters,
    errorIDs,
    successAssign,
    errorAssign,
    orders,
    expandedOrder,
    isExpandOrder,
    isExpandDriver,
    isExpandDriverBulk,
    selectedDriver,
    isSuccessAssign,
  } = store.app.myOrders;
  const userLogged = store.app.userLogged;
  const driversStore = store.app.driversStore;
  const driverList = driversStore.driverList;
  const isLoadingDriver = driverList.isLoading;
  const fleetDrivers = driversStore.fleetDrivers;
  const drivers = fleetDrivers.driverList;
  return {
    orders,
    drivers,
    userLogged,
    paginationState: {
      currentPage,
      limit,
      total,
    },
    expandedOrder,
    isFetching,
    filters,
    isExpandOrder,
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

function DispatchToOrdersPage(dispatch) {
  return {
    FetchList: () => {
      dispatch(OrderService.FetchList());
    },
    FetchDrivers: fleetID => {
      dispatch(TMSFetchDrivers(fleetID, true));
    },
    AssignOrder: (orders, driverID) => {
      dispatch(OrderService.AssignDriver(orders, driverID));
    },
    BulkAssignOrder: (orders, driverID) => {
      dispatch(OrderService.BulkAssignDriver(orders, driverID));
    },
    ShrinkOrder: () => {
      dispatch(OrderService.ShrinkOrder());
      dispatch(OrderService.ResetDriver());
    },
    ExpandDriver: () => {
      dispatch(OrderService.ExpandDriver());
    },
    ExpandDriverBulk: () => {
      dispatch(OrderService.ExpandDriverBulk());
    },
    CloseSuccessAssign: () => {
      dispatch(OrderService.CloseSuccessAssign());
    },
    SetDriver: driverID => {
      dispatch(OrderService.SetDriver(driverID));
    },
    PaginationAction: {
      setCurrentPage: currentPage => {
        dispatch(OrderService.SetCurrentPage(currentPage));
      },
      setLimit: limit => {
        dispatch(OrderService.SetLimit(limit));
      },
    },
    GoToAddOrder: () => {
      dispatch(push('/myorders/add/'));
    },
    UpdateAndFetch: newFilters => {
      dispatch(OrderService.UpdateAndFetch(newFilters));
    },
  };
}

export default connect(StoreToOrdersPage, DispatchToOrdersPage)(OrderPage);
