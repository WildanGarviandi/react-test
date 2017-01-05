import lodash from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import classNaming from 'classnames';
import moment from 'moment';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions, StatusList} from '../modules';
import districtsFetch from '../modules/districts/actions/districtsFetch';
import {ButtonBase, ButtonWithLoading, Input, InputWithDefault, Modal, Page, Glyph} from '../views/base';
import {OrderTable} from './tripDetailsTable';
import * as TripDetails from './tripDetailsService';
import ModalActions from '../modules/modals/actions';
import Accordion from '../views/base/accordion';
import RemarksSetter from '../components/remarksSetter';
import styles from './styles.css';
import {CanMarkContainer, CanMarkOrderReceived, CanMarkTripDelivered, TripParser} from '../modules/trips';
import {formatDate} from '../helper/time';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

const columns = ['id', 'id2', 'pickup', 'time', 'CODValue', 'CODStatus', 'orderStatus', 'routeStatus', 'isSuccess', 'action'];
const nonFillColumn = columns.slice(0, columns.length - 1);
const headers = [{
  id: 'EDS / WebOrderID', id2: 'Webstore',
  pickup: 'Pickup Address', dropoff: 'Recipient',
  time: 'Pickup Time', orderStatus: 'Order Status',routeStatus: 'Route Status', action: 'Action',
  CODValue: 'Value', isSuccess: 'Scanned', CODStatus: 'COD'
}];

const InputRow = React.createClass({
  getInitialState() {
    return {
      hover: false
    };
  },
  onMouseEnterHandler: function() {
    this.setState({
      hover: true
    });
  },
  onMouseLeaveHandler: function() {
    this.setState({
      hover: false
    });
  },
  render() {
    const {isEditing, label, value, onChange, type, icon, id} = this.props;
    let stylesLabel = styles.itemLabelHover;
    let stylesValue = styles.itemValueHover;

    return (
      <div style={{clear: 'both'}} 
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
    this.setState({showModal: true});
  },
  closeModal() {
    this.setState({showModal: false, scannedOrder: {}});    
    this.props.StopEditOrder();
  },
  changeToggle() {
    this.setState({scanUpdateToggle: !this.state.scanUpdateToggle});    
  },
  clearContainer() {
    if(confirm('Are you sure you want to empty and reuse this container?')) {
      this.setState({showModal: true});
      this.props.clearContainer(this.props.container.ContainerID);
    }
  },
  componentWillMount() {
    this.props.fetchStatusList();
    this.props.StopEditOrder();
  },
  goToFillContainer() {
    const {trip} = this.props;
    this.props.goToFillContainer(trip.TripID);
  },
  pickDriver(val) {
    const driver = _.find(this.props.drivers, (driver) => (val == PrepareDriver(driver.Driver)));
    this.setState({driverID: driver.Driver.UserID, driver: val});
  },
  finalizeDriver() {
    this.props.driverPick(this.props.container.ContainerID,this.state.driverID);
  },
  deassignDriver() {
    if(confirm('Are you sure you want to deassign driver on this container?')) {
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
    if(this.props.canMarkTripDelivered) {
      let scanned = lodash.reduce(this.props.orders, function (sum, order) {
        if (order.routeStatus === 'DELIVERED') {
          return sum + 1;
        } else {
          return sum;
        }
      }, 0);

      if (scanned < lodash.size(this.props.orders)) {
        let mark = confirm('You have scanned only ' + scanned + ' from ' + lodash.size(this.props.orders) +
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
      this.setState({[key]: value});
    };
  },
  updateOrder() {
    let updatedFields = ['PackageVolume', 'PackageWeight', 'DeliveryFee']
    let currentData = lodash.assign({}, this.state);
    let updatedData = {}
    updatedFields.forEach(function(field) {
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
    const {activeDistrict, backToContainer, canDeassignDriver, container, districts, driverState, driversName, fillAble, hasDriver, isFetching, isInbound, orders, reusable, statusList, TotalCODValue, CODCount, totalDeliveryFee, trip, TotalWeight} = this.props;

    const {canMarkContainer, canMarkOrderReceived, canMarkTripDelivered, isDeassigning, isEditing, scannedOrder} = this.props;

    const successfullScan = lodash.filter(this.props.orders, {'isSuccess': 'Yes'});

    const tripType = trip.OriginHub ? 'INTERHUB' : 'FIRST LEG';
    const tripOrigin = trip.OriginHub ? `Hub ${trip.OriginHub.Name}` : TripParser(trip).WebstoreNames;

    let statisticItem = '';
    if (!this.props.notFound && !isFetching && canDeassignDriver) {
      statisticItem = `Scanned ${successfullScan.length} of ${orders.length} items`;
    }
    if (!this.props.notFound && !isFetching && !canDeassignDriver) {
      statisticItem = `Total ${orders.length} items`;
    }

    const canSet = trip.DestinationHub || trip.District;
    const haveSet = trip.Driver || trip.ExternalTrip;

    const driverName = trip.Driver ? 
      trip.Driver.FirstName + ' ' + trip.Driver.LastName + ' | ' + trip.Driver.CountryCode + ' ' +trip.Driver.PhoneNumber : 'No Driver Yet';
    const companyName = trip.Driver && trip.Driver.Driver && trip.Driver.Driver.FleetManager && trip.Driver.Driver.FleetManager.CompanyDetail ? 
      trip.Driver.Driver.FleetManager.CompanyDetail.CompanyName : '';

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
              { !this.state.isSuccessEditing &&
                <div style={{clear: 'both'}}>
                  <InputRow id={'packageVolume'} label={'Package Volume'} icon={'icon-volume'} value={this.state.scannedOrder.PackageVolume} type={'text'} onChange={this.stateChange('PackageVolume') } />
                  <InputRow label={'Package Weight'} icon={'icon-weight'} value={this.state.scannedOrder.PackageWeight} type={'text'} onChange={this.stateChange('PackageWeight') } />
                  <InputRow label={'Delivery Fee'} icon={'icon-delivery-fee'} value={this.state.scannedOrder.OrderCost} type={'text'} onChange={this.stateChange('DeliveryFee') } />
                  <div style={{clear: 'both'}} />
                  <button className={styles.saveButton} onClick={this.updateOrder}>SUBMIT</button>
                </div> 
              }   
              { this.state.isSuccessEditing &&
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
          <Page title={'Trip Details'} backButton="true">
            <div className="nb">
              <h3>#{'Trip-'+ trip.TripID} <span className={styles.orderStatus}>{trip.OrderStatus ? trip.OrderStatus.OrderStatus : ''}</span></h3>
            </div>
            <div className={styles.mB30 + ' ' + styles.displayFlex + ' nb'}>
              <div className={styles.colMd6 + ' ' + styles.noPadding}>
                <RemarksSetter trip={trip} />
              </div>
              <div className={styles.colMd6}>
                {
                  trip.PickupTime &&
                  <p className={styles.title}>PICKUP TIME : {formatDate(trip.PickupTime)}</p>
                }
                {
                  trip.DropoffTime &&
                  <p className={styles.title}>DROPOFF TIME : {formatDate(trip.DropoffTime)}</p>
                }
              </div>
            </div>
            <div style={{clear: 'both'}} />
            <div className={styles.mB30 + " nb"}>
              <div className="row">
                <div className={styles.colMd6 + ' ' + styles.noPadding}>
                  <div className={styles.colMd6}>
                    <p className={styles.title}>{tripType}</p>
                    <p><Glyph name={'arrow-right'} className={styles.glyph} /> Inbound, {tripOrigin}</p>
                  </div>
                  <div className={styles.colMd6}>
                    {
                      haveSet ?
                      <div>
                        {
                          trip.Driver &&
                          <div>
                            <p className={styles.title}>Fleet : {companyName}</p>
                            <p>{driverName}</p>
                          </div>
                        }
                        {
                          trip.ExternalTrip &&
                          <p className={styles.title}>3PL : {trip.ExternalTrip.Transportation}</p>
                        }
                      </div>
                      :
                      <div>
                        <p className={styles.title}>3PL / Fleet :</p>
                        <p>No Driver Yet</p>
                      </div>
                    }
                  </div>
                </div>
                <div className={styles.colMd6 + ' ' + styles.noPadding}>
                  <div className={styles.colMd4 + ' '+ styles.actionButtoninside}>
                    {
                      reusable &&
                      <ButtonWithLoading styles={{base: styles.greenBtn}} textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
                    }
                    {
                      canDeassignDriver &&
                      <ButtonWithLoading styles={{base: styles.greenBtn}} textBase="Cancel Assignment" textLoading="Deassigning" onClick={this.deassignDriver} isLoading={isDeassigning} />
                    }
                    {
                      (canMarkTripDelivered || canMarkContainer) &&
                      <ButtonWithLoading styles={{base: styles.greenBtn}} textBase={'Complete Trip'} textLoading={'Clearing Container'} isLoading={false} onClick={this.deliverTrip} />
                    }
                  </div>
                  <div className={styles.colMd4}>
                    <a href={'/trips/' + trip.TripID + '/manifest#'} className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} target="_blank">Print Manifest</a>
                  </div>
                  <div className={styles.colMd4}>
                    <a onClick={this.exportManifest} className={styles.colMd12 + ' ' + styles.manifestLink + ' btn btn-md btn-default'} target="_blank">Excel Manifest</a>
                  </div>
                </div>
              </div>
            </div>
            <div style={{clear: 'both'}} />
            
              <div className={styles.infoArea + ' ' + styles.mB30 + " nb"}>
                <div className={styles.colMd6 + ' ' + styles.noPadding + ' ' + styles.stats}>
                  <p className={styles.title}>STATS</p>
                  <div className={styles.colMd4 + ' ' + styles.noPadding}>
                    <h3>{TotalWeight}<small> Kg</small></h3>
                    <p>Weight</p>
                  </div>
                  <div className={styles.colMd4 + ' ' + styles.noPadding}>
                    <h3><small>#</small>{orders.length}</h3>
                    <p>Orders</p>
                  </div>
                  <div className={styles.colMd4 + ' ' + styles.noPadding}>
                    <h3><small>Rp </small>{totalDeliveryFee || 0}</h3>
                    <p>Delivery Fee</p>
                  </div>
                </div>
                <div className={styles.colMd1}>
                </div>
                <div className={styles.colMd5 + ' ' + styles.noPadding + ' ' + styles.cod}>
                  <p className={styles.title}>COD</p>
                  <div className={styles.colMd6 + ' ' + styles.noPadding}>
                    <h3><small>#</small>{CODCount}</h3>
                    <p>COD Orders</p>
                  </div>
                  <div className={styles.colMd6 + ' ' + styles.noPadding}>
                    <h3><small>Rp </small>{TotalCODValue}</h3>
                    <p>COD Value</p>
                  </div>
                </div>
              </div>
            
            <div className={styles.displayFlex + ' nb'}>
              <div className={styles.colMd6 + ' ' + styles.noPadding}>
                <span style={{display: 'block', marginTop: 0, marginBottom: 20}}>
                  <span style={{display: 'inline-block', verticalAlign: 'middle'}}>
                    <label className={styles.title}>ORDERS IN THIS TRIP</label>
                  </span>
                  {
                    fillAble &&
                    <ButtonWithLoading textBase={'+ Add Order'} onClick={this.goToFillContainer} 
                      styles={{base: styles.normalBtn + ' ' + styles.addOrderBtn}} />
                  }
                </span>
              </div>
              {
                orders.length > 0 && canMarkOrderReceived &&
                <div className={styles.colMd6 + ' ' + styles.noPadding}>
                  <div className={styles.finderWrapper + ' form-group'}>
                    <div className={styles.colMd4}>
                      <label className={styles.formLabel + ' control-label'} onKeyDown={this.jumpTo}>RECEIVED ORDER : </label>
                    </div>
                    <div className={styles.colMd8 + ' ' + styles.noPadding}>
                      <div className={styles.formInput + ' input-group'}>
                        <Input onChange={this.changeMark} className="form-control" onEnterKeyPressed={this.markReceived} ref="markReceived" base={{value:this.state.orderMarked}} 
                        id="markReceivedInput" />
                        <div className={styles.btnAddon + ' input-group-addon'}><a onClick={this.submitReceived} className={styles.submitButton}>Submit</a></div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </div>
            {
              orders.length > 0 &&
              <div style={{position: 'relative'}}>
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
  const {inboundTripDetails, userLogged, orderDetails} = state.app;
  const {hubID, isCentralHub} = userLogged;
  const {isDeassigning, isFetching, orders: rawOrders, isEditing, scannedOrder} = inboundTripDetails;
  const trip = ownProps.trip;
  const isSuccessEditing = orderDetails.isSuccessEditing;
  const containerID = ownProps.params.id;
  const {containers, statusList} = state.app.containers;
  const container = containers[containerID];

  if(isFetching) {
    return {isFetching: true};
  }

  if(!trip) {
    return {notFound: true};
  }

  const emptying = false;
  const reusable = false;
  const fillAble = trip.OrderStatus && (trip.OrderStatus.OrderStatusID === 1 || trip.OrderStatus.OrderStatusID === 9);
  const {drivers} = state.app;

  const containerOrders = lodash.map(trip.UserOrderRoutes, (route) => {
    return route;
  });

  // const orders = _.map(containerOrders, (order) => {
    // const order = route.UserOrder;

  var TotalWeight = 0;
  const orders = _.map(rawOrders, (order) => {
    const Recipient = order.RecipientName + '\n' + (order.DropoffAddress ? order.DropoffAddress.City + ' ' + order.DropoffAddress.ZipCode : '');
    TotalWeight += order.PackageWeight;

    return {
      id: order.WebOrderID,
      id2: order.User.FirstName + ' ' + order.User.LastName,
      pickup: order.PickupAddress && order.PickupAddress.Address1,
      dropoff: Recipient,
      time: order.PickupTime && formatDate(order.PickupTime),
      id3: order.UserOrderID,
      isDeleting: order.isRemoving,
      orderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
      routeStatus: order.Status,
      CODValue: order.IsCOD ? order.TotalValue : 0,
      DeliveryFee: order.DeliveryFee,
      tripID: trip.TripID,
      isSuccess: order.Status === 'DELIVERED' ? 'Yes' : 'No',
      CODStatus: (order.CODPaymentUserOrder && order.CODPaymentUserOrder.CODPayment) ?
                  order.CODPaymentUserOrder.CODPayment.Status : 'No'
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
      .map((key, val) => ({key: key, value: val}))
      .sortBy((arr) => (arr.key))
      .value(),
    totalDeliveryFee: _.reduce(orders, (total, order) => {
      return total + order.DeliveryFee;
    }, 0),
    TotalCODValue: _.reduce(CODOrders, (sum, order) => sum + order.TotalValue, 0),
    TotalWeight: TotalWeight,
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
  const route = ownProps.routes[ownProps.routes.length-1];
  const path = route.path;

  return {
    backToContainer: function() {
      dispatch(push('/container'));
    },
    clearContainer: function(id) {
      dispatch(ContainerDetailsActions.clearContainer(id));
    },
    containerDetailsFetch: function(id) {
      dispatch(TripDetails.FetchDetails(id));
    },
    driverDeassign: function() {
      dispatch(TripDetails.Deassign(ownProps.params.id));
    },
    goToFillContainer: function(id) {
      dispatch(push('/trips/' + id + '/fillPickup'));
    },
    fetchStatusList: function() {
      dispatch(StatusList.fetch());
    },
    markReceived: function(scannedID, backElementFocusID, scanUpdateToggle) {
      dispatch(TripDetails.OrderReceived(scannedID, backElementFocusID, scanUpdateToggle));
    },
    deliverTrip: function(tripID, orders) {
      dispatch(TripDetails.TripDeliver(tripID));
    },
    askReuse: function(modal) {
      dispatch(ModalActions.addConfirmation(modal));
    },
    reuse: function(tripID) {
      dispatch(TripDetails.TripDeliver(tripID, true));
    },
    exportManifest: function() {
      dispatch(TripDetails.ExportManifest(ownProps.params.id));
    },
    UpdateOrder: function(id, order){
      dispatch(TripDetails.editOrder(id, order, true));
    },
    StopEditOrder: function() {
      dispatch(TripDetails.StopEditOrder());
    },
    revertSuccessEditing: function(){
      dispatch(TripDetails.revertSuccessEditing());
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
