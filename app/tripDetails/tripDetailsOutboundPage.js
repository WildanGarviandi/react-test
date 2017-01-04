import lodash from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import classNaming from 'classnames';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions, StatusList} from '../modules';
import districtsFetch from '../modules/districts/actions/districtsFetch';
import {ButtonBase, ButtonWithLoading, Input, Modal, Page, Glyph} from '../views/base';
import DistrictAndDriver from '../views/container/districtAndDriver';
import {OrderTable} from './TripDetailsTable';
import * as TripDetails from '../modules/trips/actions/details';
import * as TripDetailsTrue from '../modules/inboundTripDetails';
import ModalActions from '../modules/modals/actions';
import Accordion from '../views/base/accordion';
import NextDestinationSetter from '../views/container/nextDestinationSetter';
import TransportSetter from '../views/container/secondSetting';
import RemarksSetter from '../views/container/remarksSetter';
import styles from './styles.css';
import {CanMarkContainer, CanMarkOrderReceived, CanMarkTripDelivered} from '../modules/trips';
import {formatDate} from '../helper/time';

const columns = ['id', 'id2', 'dropoff', 'time', 'CODValue', 'CODStatus', 'orderStatus', 'routeStatus', 'action'];
const nonFillColumn = columns.slice(0, columns.length - 1);
const headers = [{
  id: 'EDS / WebOrderID', id2: 'Webstore',
  pickup: 'Pickup Address', dropoff: 'Recipient',
  time: 'Pickup Time', orderStatus: 'Order Status',routeStatus: 'Route Status', action: 'Action',
  CODValue: 'Value', CODStatus: 'COD'
}];

const DetailPage = React.createClass({
  getInitialState() {
    return {
      showModal: false,
      driver: '', 
      district: {
        isChanging: false,
      },
      orderMarked: ""
    };
  },
  closeModal() {
    this.setState({showModal: false});
  },
  clearContainer() {
    if(confirm('Are you sure you want to empty and reuse this container?')) {
      this.setState({showModal: true});
      this.props.clearContainer(this.props.container.ContainerID);
    }
  },
  componentWillMount() {
    this.props.fetchStatusList();
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
    this.props.markReceived(val);
    this.setState({
      orderMarked: "",
    });
  },
  deliverTrip() {
    if(this.props.canMarkTripDelivered) {
      this.props.deliverTrip(this.props.trip.TripID);
    } else {
      this.props.askReuse({
        message: "Do you want to reuse the container?",
        action: this.props.reuse.bind(null, this.props.trip.TripID),
        cancel: this.props.deliverTrip.bind(null, this.props.trip.TripID),
      });
    }
  },
  exportManifest() {
    this.props.exportManifest();
  },
  render() {
    const {activeDistrict, backToContainer, canDeassignDriver, container, districts, driverState, driversName, fillAble, hasDriver, isFetching, isInbound, orders, reusable, statusList, TotalCODValue, CODCount, totalDeliveryFee, trip, TotalWeight} = this.props;

    const {canMarkContainer, canMarkOrderReceived, canMarkTripDelivered, 
          isDeassigning, isChangingRemarks, isTripEditing} = this.props;

    const tripType = trip.DestinationHub ? 'INTERHUB' : 'LAST LEG';
    let tripDestination;
    if (trip.DestinationHub) {
      tripDestination = `Hub ${trip.DestinationHub.Name}`;
    } else if (trip.District) {
      tripDestination = `District ${trip.District.Name}`;
    } else {
      tripDestination = 'No Destination Yet';
    }

    let nextSuggestion = [];
    for (var p in trip.NextDestinationSuggestion) {
        if (trip.NextDestinationSuggestion.hasOwnProperty(p) && p !== 'NO_SUGGESTION') {
            nextSuggestion.push(p + ' (' + trip.NextDestinationSuggestion[p] + 
              (trip.NextDestinationSuggestion[p] > 1 ? ' orders' : ' order') + ')');
        }
    }

    let fleetSuggestion = [];
    if (trip.LastMileFleetSuggestion && trip.LastMileFleetSuggestion.length > 0) {
      fleetSuggestion = trip.LastMileFleetSuggestion.map((val) => {
        return {
          fleetID: val.UserID,
          companyName: val.CompanyDetail.CompanyName,
          capacity: val.OrderCapacity,
          ovl: val.CompanyDetail.OrderVolumeLimit
        }
      });
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
          this.props.notFound && !isFetching &&
          <h3>Failed Fetching Container Details</h3>
        }
        {
          !this.props.notFound && !isFetching &&
          <Page title={'Trip Details'} backButton="true">
            <div className="nb">
              <h3>#{'Trip-'+ trip.TripID} <span className={styles.orderStatus}>{trip.OrderStatus ? trip.OrderStatus.OrderStatus : ''}</span></h3>
            </div>
            <div className={styles.mB30}>
              <RemarksSetter trip={trip} />
            </div>
            <div style={{clear: 'both'}} />
            <div className={styles.mB30 + " nb"}>
              <div className="row">
                <div className={styles.colMd6 + ' ' + styles.noPadding}>
                  <div className={styles.colMd6}>
                    <p className={styles.title}>{tripType}</p>
                    <p><Glyph name={'arrow-right'} className={styles.glyph} /> Outbound, {tripDestination}</p>
                  </div>
                  <div className={styles.colMd6}>
                    {
                      haveSet ?
                      <div>
                        {
                          trip.Driver &&
                          <div>
                            <p className={styles.title}>FLEET : {companyName}</p>
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
                      fillAble &&
                      <ButtonWithLoading styles={{base: styles.greenBtn}} textBase={'Fill With Orders'} onClick={this.goToFillContainer} />
                    }
                    {
                      reusable &&
                      <ButtonWithLoading styles={{base: styles.greenBtn}} textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
                    }
                    {
                      canDeassignDriver &&
                      <ButtonWithLoading styles={{base: styles.greenBtn}} textBase="Cancel Assignment" textLoading="Deassigning" onClick={this.deassignDriver} isLoading={isDeassigning} />
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
            
            <span style={{display: 'block', marginTop: 10, marginBottom: 5}} className="nb">
              <span style={{display: 'inline-block', verticalAlign: 'middle'}}>
                <label className={styles.title}>ORDERS IN THIS TRIP</label>
              </span>
              {
                fillAble &&
                <ButtonWithLoading textBase={'+ Add Order'} onClick={this.goToFillContainer} 
                  styles={{base: styles.normalBtn + ' ' + styles.addOrderBtn}} />
              }
            </span>
            {
              orders.length > 0 &&
              <div style={{position: 'relative'}}>
                <OrderTable columns={fillAble ? columns : nonFillColumn} headers={headers} items={orders} statusList={statusList} />
              </div>
            }
          </Page>
        }
      </div>
    );
  }
});

const mapStateToProps = (state, ownProps) => {
  const {inboundTripDetails, userLogged} = state.app;
  const {hubID} = userLogged;
  const {isDeassigning, isFetching, orders: rawOrders, isChangingRemarks, isTripEditing} = inboundTripDetails;
  const trip = ownProps.trip;
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
      id: order.WebOrderID + ' / ' + order.UserOrderNumber,
      id2: order.User.FirstName + ' ' + order.User.LastName,
      pickup: order.PickupAddress && order.PickupAddress.Address1,
      dropoff: Recipient ,
      time: order.PickupTime && formatDate(order.PickupTime),
      id3: order.UserOrderID,
      isDeleting: order.isRemoving,
      orderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
      routeStatus: order.Status,
      CODValue: order.IsCOD ? order.TotalValue : 0,
      DeliveryFee: order.DeliveryFee,
      tripID: trip.TripID,
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
    isChangingRemarks,
    isTripEditing
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
      dispatch(TripDetailsTrue.FetchDetails(id));
    },
    driverDeassign: function() {
      dispatch(TripDetailsTrue.Deassign(ownProps.params.id));
    },
    goToFillContainer: function(id) {
      dispatch(push('/trips/' + id + '/fillReceived'));
    },
    fetchStatusList: function() {
      dispatch(StatusList.fetch());
    },
    markReceived: function(scannedID) {
      dispatch(TripDetailsTrue.OrderReceived(scannedID));
    },
    deliverTrip: function(tripID) {
      dispatch(TripDetailsTrue.TripDeliver(tripID));
    },
    askReuse: function(modal) {
      dispatch(ModalActions.addConfirmation(modal));
    },
    reuse: function(tripID) {
      dispatch(TripDetailsTrue.TripDeliver(tripID, true));
    },
    exportManifest: function() {
      dispatch(TripDetailsTrue.ExportManifest(ownProps.params.id));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
