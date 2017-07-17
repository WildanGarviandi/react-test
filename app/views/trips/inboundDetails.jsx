import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { ModalContainer, ModalDialog } from 'react-modal-dialog';

import * as _ from 'lodash';
import classNaming from 'classnames';

import { ContainerDetailsActions, StatusList } from '../../modules';
import { ButtonWithLoading, Input, InputWithDefault, Page } from '../base';
import { OrderTable } from '../container/table';
import * as TripDetailsTrue from '../../modules/inboundTripDetails';
import ModalActions from '../../modules/modals/actions';
import Accordion from '../../components/accordion';
import TransportSetter from '../container/secondSetting';
import RemarksSetter from '../container/remarksSetter';
import styles from './styles.scss';
import {
  CanMarkContainer, CanMarkOrderReceived,
  CanMarkTripDelivered, TripParser,
} from '../../modules/trips';
import { formatDate } from '../../helper/time';
import Glyph from '../../components/Glyph';
import * as OrdersDetails from '../../modules/orders/actions/details';

const columns = ['id', 'id2', 'pickup', 'time', 'CODValue', 'CODStatus', 'orderStatus', 'routeStatus', 'isSuccess', 'action'];
const nonFillColumn = columns.slice(0, columns.length - 1);
const headers = [{
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', orderStatus: 'Order Status', routeStatus: 'Route Status', action: 'Action',
  CODValue: 'COD Value', isSuccess: 'Scanned', CODStatus: 'COD Status'
}];

const InputRow = React.createClass({
  getInitialState() {
    return {
      hover: false
    };
  },
  onMouseEnterHandler: function () {
    this.setState({
      hover: true
    });
  },
  onMouseLeaveHandler: function () {
    this.setState({
      hover: false
    });
  },
  render() {
    const { isEditing, label, value, onChange, type, icon, id } = this.props;
    let stylesLabel = styles.itemLabelHover;
    let stylesValue = styles.itemValueHover;

    return (
      <div style={{ clear: 'both' }}
        className={styles.bgInput}>
        <img className={styles.iconInput} src={"/img/" + icon + ".png"} />
        <span className={stylesLabel}>{label}</span>
        <InputWithDefault id={id} className={stylesValue} currentText={value} type={type} onChange={this.props.onChange} />
      </div>
    );
  }
});

const DetailPage = React.createClass({
  getInitialState() {
    return {
      showModal: false,
      driver: '',
      district: {
        isChanging: false,
      },
      orderMarked: "",
      scanUpdateToggle: false,
      scannedOrder: this.props.scannedOrder || {},
      isSuccessEditing: false
    };
  },
  openModal() {
    this.setState({ showModal: true });
  },
  closeModal() {
    this.setState({ showModal: false, scannedOrder: {} });
    this.props.StopEditOrder();
  },
  changeToggle() {
    this.setState({ scanUpdateToggle: !this.state.scanUpdateToggle });
  },
  clearContainer() {
    if (confirm('Are you sure you want to empty and reuse this container?')) {
      this.setState({ showModal: true });
      this.props.clearContainer(this.props.container.ContainerID);
    }
  },
  componentWillMount() {
    this.props.fetchStatusList();
    this.props.StopEditOrder();
  },
  goToFillContainer() {
    const { trip } = this.props;
    this.props.goToFillContainer(trip.TripID);
  },
  pickDriver(val) {
    const driver = _.find(this.props.drivers, (driver) => (val == PrepareDriver(driver.Driver)));
    this.setState({ driverID: driver.Driver.UserID, driver: val });
  },
  finalizeDriver() {
    this.props.driverPick(this.props.container.ContainerID, this.state.driverID);
  },
  deassignDriver() {
    if (confirm('Are you sure you want to deassign driver on this container?')) {
      this.props.driverDeassign();
    }
  },
  changeMark(val) {
    this.setState({
      orderMarked: val,
    })
  },
  markReceived(val) {
    this.props.markReceived(val, "markReceivedInput", this.state.scanUpdateToggle);
    this.setState({
      orderMarked: "",
    });
  },
  submitReceived() {
    this.props.markReceived(this.state.orderMarked, null, this.state.scanUpdateToggle);
    this.setState({
      orderMarked: "",
    });
  },
  componentWillReceiveProps(nextProps) {
    if ((nextProps['isEditing'])) {
      this.openModal();
      if (document.getElementById('packageVolume')) {
        document.getElementById('packageVolume').focus();
      }
    }
    if (this.state.scannedOrder.UserOrderID !== nextProps.scannedOrder) {
      this.setState({
        scannedOrder: nextProps['scannedOrder'],
      });
    }
    this.setState({
      isSuccessEditing: nextProps['isSuccessEditing'],
    });
  },
  exportManifest() {
    this.props.exportManifest();
  },
  deliverTrip() {
    if (this.props.canMarkTripDelivered) {
      let scanned = _.reduce(this.props.orders, function (sum, order) {
        if (order.routeStatus === 'DELIVERED') {
          return sum + 1;
        } else {
          return sum;
        }
      }, 0);

      if (scanned < _.size(this.props.orders)) {
        let mark = confirm('You have scanned only ' + scanned + ' from ' + _.size(this.props.orders) +
          ' orders. Continue to mark this trip as delivered?');
        if (mark) {
          this.props.deliverTrip(this.props.trip.TripID);
        }
      } else {
        this.props.deliverTrip(this.props.trip.TripID);
      }
    } else {
      this.props.askReuse({
        message: "Do you want to reuse the container?",
        action: this.props.reuse.bind(null, this.props.trip.TripID),
        cancel: this.props.deliverTrip.bind(null, this.props.trip.TripID),
      });
    }
  },
  stateChange(key) {
    return (value) => {
      this.setState({ [key]: value });
    };
  },
  updateOrder() {
    let updatedFields = ['PackageVolume', 'PackageWeight', 'DeliveryFee']
    let currentData = _.assign({}, this.state);
    let updatedData = {}
    updatedFields.forEach(function (field) {
      if (typeof currentData[field] !== 'undefined') {
        updatedData[field] = parseInt(currentData[field]);
      }
    });
    this.props.UpdateOrder(this.props.scannedOrder.UserOrderID, updatedData);
  },
  confirmSuccess() {
    this.closeModal();
    this.props.revertSuccessEditing();
  },
  render() {
    const { activeDistrict, backToContainer, canDeassignDriver, container, districts, driverState, driversName, fillAble, hasDriver, isFetching, isInbound, orders, reusable, statusList, TotalCODValue, CODCount, totalDeliveryFee, trip } = this.props;

    const { canMarkContainer, canMarkOrderReceived, canMarkTripDelivered, isDeassigning, isEditing, scannedOrder } = this.props;

    const successfullScan = _.filter(this.props.orders, { 'isSuccess': 'Yes' });

    const tripType = trip.OriginHub ? 'Interhub' : 'First Leg';
    const tripOrigin = trip.OriginHub ? `Hub ${trip.OriginHub.Name}` : TripParser(trip).WebstoreNames;

    let statisticItem = '';
    if (!this.props.notFound && !isFetching && canDeassignDriver) {
      statisticItem = `Scanned ${successfullScan.length} of ${orders.length} items`;
    }
    if (!this.props.notFound && !isFetching && !canDeassignDriver) {
      statisticItem = `Total ${orders.length} items`;
    }
    return (
      <div>
        {
          isFetching &&
          <h3>Fetching Trip Details...</h3>
        }
        {
          this.state.showModal && isEditing &&
          <ModalContainer onClose={this.closeModal}>
            <ModalDialog onClose={this.closeModal}>
              {!this.state.isSuccessEditing &&
                <div style={{ clear: 'both' }}>
                  <InputRow id={'packageVolume'} label={'Package Volume'} icon={'icon-volume'} value={this.state.scannedOrder.PackageVolume} type={'text'} onChange={this.stateChange('PackageVolume')} />
                  <InputRow label={'Package Weight'} icon={'icon-weight'} value={this.state.scannedOrder.PackageWeight} type={'text'} onChange={this.stateChange('PackageWeight')} />
                  <InputRow label={'Delivery Fee'} icon={'icon-delivery-fee'} value={this.state.scannedOrder.OrderCost} type={'text'} onChange={this.stateChange('DeliveryFee')} />
                  <div style={{ clear: 'both' }} />
                  <button className={styles.saveButton} onClick={this.updateOrder}>SUBMIT</button>
                </div>
              }
              {this.state.isSuccessEditing &&
                <div>
                  <img className={styles.successIcon} src={"/img/icon-success.png"} />
                  <div className={styles.updateSuccess}>
                    Update Order Success
                  </div>
                  <button className={styles.saveButton} onClick={this.confirmSuccess}>OK</button>
                </div>
              }
            </ModalDialog>
          </ModalContainer>
        }
        {
          this.props.notFound && !isFetching &&
          <h3>Failed Fetching Container Details</h3>
        }
        {
          !this.props.notFound && !isFetching &&
          <Page title={'Inbound Trip Details' + (trip.ContainerNumber ? (" of Container " + trip.ContainerNumber) : "")}
            backButton="true">
            <div style={{ clear: 'both' }} />
            <div className={classNaming(styles.container)}>
              <Glyph name={'tags'} className={styles.glyph} />
              <span className={styles.num}>Type</span>
              <span className={styles.attr}>{tripType}</span>
            </div>
            <div className={classNaming(styles.container)}>
              <Glyph name={'arrow-right'} className={styles.glyph} />
              <span className={styles.num}>Origin</span>
              <span className={styles.attr}>{tripOrigin}</span>
            </div>
            <div style={{ clear: 'both' }} />
            {
              reusable &&
              <ButtonWithLoading textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
            }
            {
              canDeassignDriver &&
              <ButtonWithLoading textBase="Cancel Assignment" textLoading="Deassigning" onClick={this.deassignDriver} isLoading={isDeassigning} />
            }
            {
              (canMarkTripDelivered || canMarkContainer) &&
              <ButtonWithLoading styles={{ base: styles.greenBtn }} textBase={'Complete Trip'} textLoading={'Clearing Container'} isLoading={false} onClick={this.deliverTrip} />
            }
            <a href={'/trips/' + trip.TripID + '/manifest#'} className={styles.manifestLink} target="_blank">Print Manifest</a>
            <a onClick={this.exportManifest} className={styles.manifestLink} target="_blank">Export Excel Manifest</a>
            <Accordion initialState="collapsed">
              <TransportSetter trip={trip} isInbound={true} />
            </Accordion>
            {this.props.isCentralHub && canMarkOrderReceived &&
              <div className={styles.bgToggle}>
                <div className={styles.toggleQuestion}>
                  What do you want to do?
                </div>
                <button className={this.state.scanUpdateToggle ? styles.toggleScanButtonInactive : styles.toggleScanButtonActive} onClick={this.changeToggle}>Scan Only</button>
                <button className={this.state.scanUpdateToggle ? styles.toggleScanButtonActive : styles.toggleScanButtonInactive} onClick={this.changeToggle}>Scan + Update Data</button>
              </div>
            }
            <RemarksSetter trip={trip} />
            <span style={{ display: 'block', marginTop: 25, marginBottom: 5 }}>
              <span style={{ fontSize: 20, display: 'initial', verticalAlign: 'middle' }}>{statisticItem}</span>
              {
                fillAble &&
                <ButtonWithLoading textBase={'+ Add Order'} onClick={this.goToFillContainer}
                  styles={{ base: styles.normalBtn + ' ' + styles.addOrderBtn }} />
              }
            </span>
            {
              !trip.DestinationHub && trip.District &&
              <span>
                <span style={{ display: 'block', marginTop: 10, marginBottom: 5 }}>Total Delivery Fee Rp {totalDeliveryFee || 0}</span>
                <span style={{ display: 'block', marginTop: 10, marginBottom: 5 }}>Total COD Value Rp {TotalCODValue},- ({CODCount} items)</span>
              </span>
            }
            {
              orders.length > 0 &&
              <div style={{ position: 'relative' }}>
                <div className={styles.finderWrapperContainer}>
                  {
                    canMarkOrderReceived &&
                    <span className={styles.finderWrapper} style={{ top: -25 }}>
                      <span className={styles.finderLabel} onKeyDown={this.jumpTo}>
                        Received Order :
                      </span>
                      <Input onChange={this.changeMark} onEnterKeyPressed={this.markReceived} ref="markReceived" base={{ value: this.state.orderMarked }}
                        id="markReceivedInput" />
                      <a onClick={this.submitReceived} className={styles.submitButton}>Submit</a>
                    </span>
                  }
                </div>
                <OrderTable isInbound={true} columns={fillAble ? columns : nonFillColumn} headers={headers} items={orders} statusList={statusList} />
              </div>
            }
          </Page>
        }
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const { inboundTripDetails, userLogged, orderDetails } = state.app;
  const { hubID, isCentralHub } = userLogged;
  const { isDeassigning, isFetching, orders: rawOrders, isEditing, scannedOrder } = inboundTripDetails;
  const trip = ownProps.trip;
  const isSuccessEditing = orderDetails.isSuccessEditing;
  const containerID = ownProps.params.id;
  const { containers, statusList } = state.app.containers;
  const container = containers[containerID];

  if (isFetching) {
    return { isFetching: true };
  }

  if (!trip) {
    return { notFound: true };
  }

  const emptying = false;
  const reusable = false;
  const fillAble = trip.OrderStatus && (trip.OrderStatus.OrderStatusID === 1 || trip.OrderStatus.OrderStatusID === 9);
  const { drivers } = state.app;

  const containerOrders = _.map(trip.UserOrderRoutes, (route) => {
    return route;
  });

  // const orders = _.map(containerOrders, (order) => {
  // const order = route.UserOrder;

  const orders = _.map(rawOrders, (order) => {
    return {
      id: order.WebOrderID,
      id2: order.UserOrderNumber,
      pickup: order.PickupAddress && order.PickupAddress.Address1,
      dropoff: order.DropoffAddress && order.DropoffAddress.Address1,
      time: order.PickupTime && formatDate(order.PickupTime),
      id3: order.UserOrderID,
      isDeleting: order.isRemoving,
      orderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
      routeStatus: order.Status,
      CODValue: order.IsCOD ? order.TotalValue : 0,
      DeliveryFee: order.DeliveryFee,
      tripID: trip.TripID,
      isSuccess: order.Status === 'DELIVERED' ? 'Yes' : 'No',
      CODStatus: order.CODPaymentUserOrder && order.CODPaymentUserOrder.CODPayment.Status || 'N/A'
    }
  });

  const CODOrders = _.filter(containerOrders, (order) => order.IsCOD);

  // if (!trip.ContainerNumber) {
  //   return {notFound: true, isFetching};
  // }

  const routes = ownProps.routes;
  const paths = routes[2].path.split('/');
  const isInbound = paths[2] === 'inbound';

  console.log('mark', CanMarkTripDelivered(trip, rawOrders), CanMarkContainer(trip, hubID));

  return {
    trip: trip,
    orders: orders,
    container: container,
    isFetching: isFetching,
    fillAble: fillAble,
    reusable: reusable,
    emptying: emptying || {},
    canDeassignDriver: (trip.Driver && trip.OrderStatus.OrderStatusID == 2) || false,
    driverState: {
      isDeassigning: state.app.driversStore.driverDeassignment,
      isPicking: state.app.driversStore.driverList.isLoading,
    },
    statusList: _.chain(statusList)
      .map((key, val) => ({ key: key, value: val }))
      .sortBy((arr) => (arr.key))
      .value(),
    totalDeliveryFee: _.reduce(orders, (total, order) => {
      return total + order.DeliveryFee;
    }, 0),
    TotalCODValue: _.reduce(CODOrders, (sum, order) => sum + order.TotalValue, 0),
    CODCount: CODOrders.length,
    isInbound,

    isDeassigning,
    canMarkOrderReceived: CanMarkOrderReceived(trip, rawOrders),
    canMarkTripDelivered: CanMarkTripDelivered(trip, rawOrders),
    canMarkContainer: CanMarkContainer(trip, hubID),
    isEditing,
    scannedOrder,
    isSuccessEditing,
    isCentralHub
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const route = ownProps.routes[ownProps.routes.length - 1];
  const path = route.path;

  return {
    backToContainer: function () {
      dispatch(push('/container'));
    },
    clearContainer: function (id) {
      dispatch(ContainerDetailsActions.clearContainer(id));
    },
    containerDetailsFetch: function (id) {
      dispatch(TripDetailsTrue.FetchDetails(id));
    },
    driverDeassign: function () {
      dispatch(TripDetailsTrue.Deassign(ownProps.params.id));
    },
    goToFillContainer: function (id) {
      dispatch(push('/trips/' + id + '/fillPickup'));
    },
    fetchStatusList: function () {
      dispatch(StatusList.fetch());
    },
    markReceived: function (scannedID, backElementFocusID, scanUpdateToggle) {
      dispatch(TripDetailsTrue.OrderReceived(scannedID, backElementFocusID, scanUpdateToggle));
    },
    deliverTrip: function (tripID, orders) {
      dispatch(TripDetailsTrue.TripDeliver(tripID));
    },
    askReuse: function (modal) {
      dispatch(ModalActions.addConfirmation(modal));
    },
    reuse: function (tripID) {
      dispatch(TripDetailsTrue.TripDeliver(tripID, true));
    },
    exportManifest: function () {
      dispatch(TripDetailsTrue.ExportManifest(ownProps.params.id));
    },
    UpdateOrder: function (id, order) {
      dispatch(OrdersDetails.editOrder(id, order, true));
    },
    StopEditOrder: function () {
      dispatch(TripDetailsTrue.StopEditOrder());
    },
    revertSuccessEditing: function () {
      dispatch(OrdersDetails.revertSuccessEditing());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
