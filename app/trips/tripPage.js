import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../views/base';
import {Pagination2} from '../components/pagination2';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import Table, {Filter} from './tripTable';
import * as TripService from './tripService';
import driversFetch from '../modules/drivers/actions/driversFetch';
import styles from './styles.css';
import stylesButton from '../components/button.css';
import * as UtilHelper from '../helper/utility';
import NumberFormat from 'react-number-format';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

const TripOrders = React.createClass({
  render: function() {
    var orderComponents = this.props.orders.map(function(order, idx) {
      return (
        <div className={styles.mainOrder} key={idx}>
          <div className={styles.orderName}>
            <div className={styles.orderNum}>
              Order #{idx+1}
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
          <div style={{clear: 'both'}} />
          <div>
            <div className={styles.tripDetailsLabel}>
              From
            </div>
            <div className={styles.tripDetailsValue}>
              {order.UserOrder.PickupAddress && order.UserOrder.PickupAddress.FirstName + ' ' + order.UserOrder.PickupAddress.LastName}
            </div>
            <div>
              {order.UserOrder.PickupAddress && order.UserOrder.PickupAddress.Address1}
            </div>
            <div className={styles.tripDetailsLabel}>
              To
            </div>
            <div className={styles.tripDetailsValue}>
              {order.UserOrder.DropoffAddress && order.UserOrder.DropoffAddress.FirstName + ' ' + order.UserOrder.DropoffAddress.LastName}
            </div>
            <div>
              {order.UserOrder.DropoffAddress && order.UserOrder.DropoffAddress.Address1}
            </div>
          </div>
        </div>
      );
    }.bind(this));
    return <div>{orderComponents}</div>;
  }
});

const PanelDetails = React.createClass({
  render() {
    const { expandedTrip, shrinkTrip, isExpandDriver } = this.props;
    const reassignTripButton = {
      textBase: 'Assign',
      onClick: this.props.expandDriver,
      styles: {
        base: stylesButton.greenButton2,
      }
    };
    const tripStatusStyles = styles['tripStatus' + expandedTrip.OrderStatus.OrderStatusID];
    return (
      <div>
        { expandedTrip &&
          <div className={isExpandDriver ? styles.panelDetails2 : styles.panelDetails}>
            <div onClick={shrinkTrip} className={styles.closeButton}>
              X
            </div>
            <div className={styles.tripDetails}>
              <div className={styles.reassignButton}>
                <ButtonWithLoading {...reassignTripButton} />
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
                {expandedTrip.TripMerchantsAll}
              </div>
              <div className={styles.tripDetailsLabel}>
                Destination
              </div>
              <div className={styles.tripDetailsValue}>
                {expandedTrip.TripDropoffAll}
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
                    {expandedTrip.TotalCOD} items
                  </div>
                </div>
                <div className={styles.tripAdditionalInfo}>
                  <div className={styles.tripDetailsLabel}>
                    COD Value
                  </div>
                  <div className={styles.tripDetailsValue}>
                    <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={expandedTrip.TotalCODValue} />
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
});

const Drivers = React.createClass({
  render: function() {
    var driverComponents = this.props.drivers.map(function(driver, idx) {
      return (
        <div className={styles.mainDriver} key={idx}>
          <div className={styles.tripDriver} onClick={()=>{this.props.setDriver(driver.UserID)}}>
            <div className={styles.driverInput}>
              <img src={this.props.selectedDriver === driver.UserID ? "/img/icon-radio-on.png" : "/img/icon-radio-off.png"} />
            </div>
            <div className={styles.vehicleIcon}>
              <img className={styles.driverLoadImage} 
                src={driver.Vehicle && driver.Vehicle.VehicleID === 1 ? "/img/icon-vehicle-motor.png" : "/img/icon-vehicle-van.png"} />
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.driverName}>
                {driver.FirstName + ' ' + driver.LastName} 
              </span>
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.vendorLoad}>
                Available Weight 12 / 25
              </span>
            </div>
          </div>
        </div>
      );
    }.bind(this));
    return <div>{driverComponents}</div>;
  }
});

const PanelDrivers = React.createClass({
  render() {
    const setDriverButton = {
      textBase: 'Assign Driver',
      onClick: this.props.assignTrip.bind(null, this.props.expandedTrip.TripID, this.props.selectedDriver),
      styles: {
        base: stylesButton.greenButton4,
      }
    };
    return (
      <div className={styles.mainDriverPanel}>
        { this.props.isExpandDriverBulk && 
          <div onClick={this.props.shrinkTrip} className={styles.closeButton}>
            X
          </div>
        }
        { this.props.isExpandDriverBulk && 
          <div className={styles.panelDriverChoose}>
            Choose a driver for {this.props.selectedTrips.length} trip: 
          </div>
        }
        { !this.props.isExpandDriverBulk && 
          <div className={styles.panelDriverChoose}>
            Choose a driver for this trip
          </div>
        }
        <div className={styles.panelDriverSearch}>
          <input className={styles.inputDriverSearch} onChange={this.changeMark} placeholder={'Search Driver...'} />
        </div>
        <div className={styles.panelDriverList}>
          <Drivers selectedDriver={this.props.selectedDriver} setDriver={this.props.setDriver} drivers={this.props.drivers} />
        </div>
        <div className={styles.setDriverButton}>
          <ButtonWithLoading {...setDriverButton} />
        </div>
      </div>
    );
  }
});

const TripPage = React.createClass({
  getInitialState() {
    return ({driverID: null, trips: [], selectedTrips: [], isSuccessAssign: false})
  },
  componentWillMount() {
    this.props.ShrinkTrip();
    this.props.FetchList();
    this.props.FetchDrivers(this.props.userLogged.userID);
  },
  componentWillReceiveProps(nextProps) {
    this.setState({
      isSuccessAssign: nextProps['isSuccessAssign']
    });
  },
  selectDriver(e) {
    this.setState({driverID: e.key});
  },
  expandBulkAssign() {
    let selectedTrips = lodash.filter(this.props.trips, ['IsChecked', true]);
    if (selectedTrips.length < 1) {
      alert('No trip selected');
      return;
    }
    this.setState({selectedTrips: selectedTrips});
    this.props.ShrinkTrip();
    setTimeout(function() {
      this.props.ExpandDriverBulk();
    }.bind(this), 100);
  },
  exportTrip() {
    this.props.ExportTrip();
  },
  render() {
    const {paginationState, PaginationAction, drivers, total, trips, expandedTrip, isExpandTrip, isExpandDriver, isExpandDriverBulk, AssignTrip, ShrinkTrip, ExpandDriver, selectedDriver, SetDriver} = this.props;
    return (
      <Page title="My Trips" count={{itemName: 'Items', done: 'All Done', value: total}}>
        <Pagination2 {...paginationState} {...PaginationAction} />
          <div className={styles.filterOption}>
            <Filter expandDriver={this.expandBulkAssign} />
          </div>
          {
            this.props.isFetching &&
            <div>
              <div style={{clear: 'both'}} />
              <div style={{textAlign:'center'}}>
                <div style={{fontSize: 20}}>
                  Fetching data....
                </div>
              </div>
            </div>
          }
          {
            !this.props.isFetching && this.props.trips.length === 0 && !lodash.isEmpty(this.props.filters) &&
            <div>
              <div style={{clear: 'both'}} />
              <div className={styles.noTripDesc}>
                <img src="/img/image-inbound-trip-done.png" />
                <div style={{fontSize: 20}}>
                  Trips not found
                </div>
                <div style={{fontSize: 12, marginTop: 20}}>
                  Please choose another filter to get the orders.
                </div>
              </div>
            </div>
          }
          {
            !this.props.isFetching && this.props.trips.length === 0 && lodash.isEmpty(this.props.filters) &&
            <div>
              <div style={{clear: 'both'}} />
              <div className={styles.noTripDesc}>
                <img src="/img/image-inbound-trip-done.png" />
                <div style={{fontSize: 20}}>
                  Awesome work guys!
                </div>
                <div style={{fontSize: 12, marginTop: 20}}>
                  You have assign all trips, please always check if there’s another trip to assign every 5 minutes.
                </div>
              </div>
            </div>   
          }
          {
            !this.props.isFetching && this.props.trips.length > 0 &&
            <div>
              <Table trips={trips} />
              {   
                isExpandTrip &&
                <PanelDetails isExpandDriver={isExpandDriver} expandedTrip={expandedTrip} shrinkTrip={ShrinkTrip} expandDriver={ExpandDriver} />
              }
              {   
                isExpandDriver &&
                <PanelDrivers selectedTrips={this.state.selectedTrips} isExpandDriverBulk={isExpandDriverBulk} shrinkTrip={ShrinkTrip} expandedTrip={expandedTrip} assignTrip={AssignTrip} selectedDriver={selectedDriver} setDriver={SetDriver} drivers={drivers} />
              }
            </div>
          }

          { this.state.isSuccessAssign &&
            <ModalContainer>
              <ModalDialog>
                <div className={styles.modal}>
                  <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Success</h2>
                    <div className={styles.successContent + ' ' + styles.ordersContentEmpty}>
                      <img className={styles.successIcon} src={"/img/icon-success.png"} />
                      <div className={styles.mediumText}>You have successfully re-assigned this trip</div>
                    </div>
                  </div>
                  <div className={styles.modalFooter}>
                    <button className={styles.endButton} onClick={this.props.CloseSuccessAssign}>
                      <span className={styles.mediumText}>Got It</span>
                    </button>
                  </div>
                </div>
              </ModalDialog>
            </ModalContainer>
          }
      </Page>
    );
  }
});

function StoreToTripsPage(store) {
  const {currentPage, limit, total, isFetching, filters, trips, expandedTrip, isExpandTrip, isExpandDriver, isExpandDriverBulk, selectedDriver, isSuccessAssign} = store.app.myTrips;  
  const userLogged = store.app.userLogged;  
  const driversStore = store.app.driversStore;
  const driverList = driversStore.driverList;
  const fleetDrivers = driversStore.fleetDrivers;
  const drivers = fleetDrivers.driverList;
  return {
    trips: trips,
    drivers: drivers,
    userLogged: userLogged,
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
    isSuccessAssign
  }
}

function DispatchToTripsPage(dispatch) {
  return {
    FetchList: () => {
      dispatch(TripService.FetchList());
    },
    FetchDrivers: (fleetID) => {
      dispatch(driversFetch(fleetID));
    },
    AssignTrip: (trips, driverID) => {
      dispatch(TripService.ReassignDriver(trips, driverID));
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
    }
  }
}

export default connect(StoreToTripsPage, DispatchToTripsPage)(TripPage);