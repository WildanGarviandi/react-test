import lodash from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import classNaming from 'classnames';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions, StatusList} from '../../modules';
import districtsFetch from '../../modules/districts/actions/districtsFetch';
import {ButtonBase, ButtonWithLoading, Input, Modal, Page, Glyph} from '../base';
import DistrictAndDriver from '../container/districtAndDriver';
import {OrderTable} from '../container/table';
import * as TripDetails from '../../modules/trips/actions/details';
import * as TripDetailsTrue from '../../modules/inboundTripDetails';
import ModalActions from '../../modules/modals/actions';
import Accordion from '../base/accordion';
import NextDestinationSetter from '../container/nextDestinationSetter';
import TransportSetter from '../container/secondSetting';
import styles from './styles.css';
import {CanMarkContainer, CanMarkOrderReceived, CanMarkTripDelivered} from '../../modules/trips';
import {formatDate} from '../../helper/time';

const columns = ['id', 'id2', 'dropoff', 'time', 'CODValue', 'orderStatus', 'routeStatus', 'action'];
const nonFillColumn = columns.slice(0, columns.length - 1);
const headers = [{
  id: 'Web Order ID', id2: 'User Order Number',
  pickup: 'Pickup Address', dropoff: 'Dropoff Address',
  time: 'Pickup Time', orderStatus: 'Order Status',routeStatus: 'Route Status', action: 'Action',
  CODValue: 'COD Value'
}];

const DetailPage = React.createClass({
  getInitialState() {
    return {
      showModal: false,
      driver: '', 
      district: {
        isChanging: false,
      },
      orderMarked: "",
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
  render() {
    const {activeDistrict, backToContainer, canDeassignDriver, container, districts, driverState, driversName, fillAble, hasDriver, isFetching, isInbound, orders, reusable, statusList, TotalCODValue, CODCount, totalDeliveryFee, trip} = this.props;

    const {canMarkContainer, canMarkOrderReceived, canMarkTripDelivered, isDeassigning} = this.props;

    const tripType = trip.DestinationHub ? 'Interhub' : 'Last Leg';
    const tripDestination = trip.DestinationHub ? `Hub ${trip.DestinationHub.Name}` : `District ${trip.District.Name}`;

    let nextSuggestion = [];
    for (var p in trip.NextDestinationSuggestion) {
        if (trip.NextDestinationSuggestion.hasOwnProperty(p) && p !== 'NO_SUGGESTION') {
            nextSuggestion.push(trip.NextDestinationSuggestion[p] + ' orders should go to ' + p);
        }
    }

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
          <Page title={'Outbound Trip Details '+ (trip.ContainerNumber ? (" of Container " + trip.ContainerNumber) : "")}>
            <div style={{clear: 'both'}} />
            <div className={classNaming(styles.container)}>
              <Glyph name={'tags'} className={styles.glyph} />
              <span className={styles.num}>Type</span>
              <span className={styles.attr}>{tripType}</span>
            </div>
            <div className={classNaming(styles.container)}>
              <Glyph name={'arrow-right'} className={styles.glyph} />
              <span className={styles.num}>Destination</span>
              <span className={styles.attr}>{tripDestination}</span>
            </div>
            <div style={{clear: 'both'}} />
            {
              fillAble &&
              <ButtonWithLoading textBase={'Fill With Orders'} onClick={this.goToFillContainer} styles={{base: styles.normalBtn}} />
            }
            {
              reusable &&
              <ButtonWithLoading textBase={'Clear and Reuse Container'} textLoading={'Clearing Container'} isLoading={emptying.isInProcess} onClick={this.clearContainer} />
            }
            {
              canDeassignDriver &&
              <ButtonWithLoading textBase="Cancel Assignment" textLoading="Deassigning" onClick={this.deassignDriver} isLoading={isDeassigning} />
            }
            <a href={'/trips/' + trip.TripID + '/manifest#' + trip.ContainerNumber} className={styles.manifestLink} target="_blank">Print Manifest</a>
            <NextDestinationSetter trip={trip} accordionState={trip && (trip.Driver || trip.ExternalTrip) ? "collapsed" : "expanded"} />
            <TransportSetter trip={trip} isInbound={false} accordionState={trip && ((trip.Driver || trip.ExternalTrip) || !(trip.District || trip.DestinationHub)) ? "collapsed" : "expanded"}/>
            <span style={{display: 'block', marginTop: 10, marginBottom: 5}}>Total {orders.length} items</span>
            {
              !trip.DestinationHub && trip.District &&
              <span>
                <span style={{display: 'block', marginTop: 10, marginBottom: 5}}>Total Delivery Fee Rp {totalDeliveryFee || 0}</span>
                <span style={{display: 'block', marginTop: 10, marginBottom: 5}}>Total COD Value Rp {TotalCODValue},- ({CODCount} items)</span>
              </span>
            }
            {
              orders.length > 0 &&
              <div style={{position: 'relative'}}>
                {
                  canMarkOrderReceived &&
                  <span className={styles.finderWrapper}>
                    <span className={styles.finderLabel} onKeyDown={this.jumpTo}>
                      Mark Order As Received From Driver :
                    </span>
                    <Input onChange={this.changeMark} onEnterKeyPressed={this.markReceived} ref="markReceived" base={{value:this.state.orderMarked}} />
                  </span>
                }
                {
                  (canMarkTripDelivered || canMarkContainer) &&
                  <span className={styles.finderWrapper2}>
                    <ButtonWithLoading textBase={'Mark Trip As Delivered'} textLoading={'Clearing Container'} isLoading={false} onClick={this.deliverTrip} />
                  </span>
                }
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
  const {isDeassigning, isFetching, orders: rawOrders} = inboundTripDetails;
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
    CODCount: CODOrders.length,
    isInbound,

    isDeassigning,
    canMarkOrderReceived: CanMarkOrderReceived(trip, rawOrders),
    canMarkTripDelivered: CanMarkTripDelivered(trip, rawOrders),
    canMarkContainer: CanMarkContainer(trip, hubID),
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
