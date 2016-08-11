import lodash from 'lodash';
import React from 'react';
import classNaming from 'classnames';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import {ContainerDetailsActions, StatusList} from '../../modules';
import districtsFetch from '../../modules/districts/actions/districtsFetch';
import {ButtonBase, ButtonWithLoading, Modal, Page} from '../base';
import DistrictAndDriver from './districtAndDriver';
import {OrderTable} from './table';
import * as TripDetails from '../../modules/trips/actions/details';
import Accordion from '../base/accordion';
import NextDestinationSetter from './nextDestinationSetter';
import TransportSetter from './secondSetting';

import styles from './styles.css';

const columns = ['id', 'id2', 'pickup', 'dropoff', 'time', 'CODValue', 'orderStatus', 'routeStatus', 'action'];
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
    this.props.containerDetailsFetch(this.props.params.id);
    this.props.fetchStatusList();
  },
  goToFillContainer() {
    const {container} = this.props;
    this.props.goToFillContainer(container.ContainerID);
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
  render() {
    const {activeDistrict, backToContainer, canDeassignDriver, container, districts, driverState, driversName, fillAble, hasDriver, isFetching, orders, reusable, statusList, TotalCODValue, CODCount, totalDeliveryFee, trip} = this.props;

    console.log('f', fillAble);

    return (
      <div>
        {
          isFetching &&
          <h3>Fetching Container Details...</h3>
        }
        {
          this.props.notFound && !isFetching &&
          <h3>Failed Fetching Container Details</h3>
        }
        {
          !this.props.notFound && !isFetching &&
          <Page title={'Trip Details' + (trip.ContainerNumber && (" of Container " + trip.ContainerNumber))}>
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
              <ButtonWithLoading textBase="Cancel Assignment" textLoading="Deassigning" onClick={this.deassignDriver} isLoading={driverState.isDeassigning} />
            }
            <Accordion initialState="collapsed">
              <NextDestinationSetter trip={trip} />
            </Accordion>
            <Accordion initialState="collapsed">
              <TransportSetter trip={trip} />
            </Accordion>
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
              <div>
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
  const {tripDetails} = state.app;
  const {isFetching, trip} = tripDetails;
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

  const orders = _.map(containerOrders, (route) => {
    const order = route.UserOrder;
    return {
      id: order.WebOrderID,
      id2: order.UserOrderNumber,
      pickup: order.PickupAddress && order.PickupAddress.Address1,
      dropoff: order.DropoffAddress && order.DropoffAddress.Address1,
      time: order.PickupTime && (new Date(order.PickupTime)).toString(),
      id3: order.UserOrderID,
      isDeleting: order.isDeleting,
      orderStatus: (order.OrderStatus && order.OrderStatus.OrderStatus) || '',
      routeStatus: route.OrderStatus && route.OrderStatus.OrderStatus,
      CODValue: order.IsCOD ? order.TotalValue : 0,
      DeliveryFee: order.DeliveryFee,
    }
  });

  const CODOrders = _.filter(containerOrders, (order) => order.IsCOD);

  if (!trip.ContainerNumber) {
    return {notFound: true, isFetching};
  }

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
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    backToContainer: function() {
      dispatch(push('/container'));
    },
    clearContainer: function(id) {
      dispatch(ContainerDetailsActions.clearContainer(id));
    },
    containerDetailsFetch: function(id) {
      dispatch(TripDetails.fetchDetails(id));
    },
    driverDeassign: function() {
      dispatch(ContainerDetailsActions.deassignDriver(ownProps.params.id));
    },
    goToFillContainer: function(id) {
      dispatch(push('/container/' + id + '/fill'));
    },
    fetchStatusList: function() {
      dispatch(StatusList.fetch());
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(DetailPage);
