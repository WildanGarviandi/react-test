import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Page} from '../views/base';
import {Pagination2} from '../components/pagination2';
import {ButtonWithLoading} from '../components/button';
import * as Form from '../components/form';
import Table, {Filter, Deadline} from './orderTable';
import * as OrderService from './orderService';
import driversFetch from '../modules/drivers/actions/driversFetch';
import styles from './styles.css';
import stylesButton from '../components/button.css';
import * as UtilHelper from '../helper/utility';
import NumberFormat from 'react-number-format';
import {ModalContainer, ModalDialog} from 'react-modal-dialog';

const PanelDetails = React.createClass({
  render() {
    const { expandedOrder, shrinkOrder, isExpandDriver } = this.props;
    const reassignOrderButton = {
      textBase: 'Assign',
      onClick: this.props.expandDriver,
      styles: {
        base: stylesButton.greenButton2,
      }
    };
    return (
      <div>
        { expandedOrder &&
          <div className={isExpandDriver ? styles.panelDetails2 : styles.panelDetails}>
            <div onClick={shrinkOrder} className={styles.closeButton}>
              X
            </div>
            <div className={styles.orderDueTime}>
              <Deadline deadline={expandedOrder.DueTime} />
            </div>   
            <div className={styles.orderDetails}>
              <div className={styles.reassignButton}>
                <ButtonWithLoading {...reassignOrderButton} />
              </div>
              <div className={styles.orderDetailsLabel}>
                Order ID
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.UserOrderNumber}
              </div>
              <div className={styles.orderDetailsLabel}>
                Origin
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.PickupAddress && expandedOrder.PickupAddress.City}
              </div>
              <div className={styles.orderDetailsLabel}>
                Destination
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.DropoffAddress && expandedOrder.DropoffAddress.City}
              </div>
              <div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>
                    Weight
                  </div>
                  <div className={styles.orderDetailsValue}>
                    {expandedOrder.PackageWeight} kg
                  </div>
                </div>
                <div className={styles.orderAdditionalInfo}>
                  <div className={styles.orderDetailsLabel}>
                    COD Type
                  </div>
                  <div className={styles.orderDetailsValue}>
                    {expandedOrder.IsCOD ? 'COD' : 'Non-COD'}
                  </div>
                </div>
              </div>
            </div>            
            <div className={styles.orderValue}>                            
              <div className={styles.orderValueLabel}>
                Total Value
              </div>
              <div className={styles.orderTotalValue}>
                <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={expandedOrder.TotalValue} />    
              </div>
            </div>
            <div className={styles.orderDetails}>            
              <div className={styles.orderDetailsLabel}>
                From
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.PickupAddress && expandedOrder.PickupAddress.FirstName + ' ' + expandedOrder.PickupAddress.LastName}
              </div>
              <div className={styles.orderDetailsValue2}>
                {expandedOrder.PickupAddress && expandedOrder.PickupAddress.Address1}
              </div>
            </div>
            <div className={styles.orderDetails}>            
              <div className={styles.orderDetailsLabel}>
                To
              </div>
              <div className={styles.orderDetailsValue}>
                {expandedOrder.DropoffAddress && expandedOrder.DropoffAddress.FirstName + ' ' + expandedOrder.DropoffAddress.LastName}
              </div>
              <div className={styles.orderDetailsValue2}>
                {expandedOrder.DropoffAddress && expandedOrder.DropoffAddress.Address1}
              </div>
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
      const isSelected = this.props.selectedDriver === driver.UserID;
      const totalWeight = parseFloat(driver.TotalCurrentWeight) + parseFloat(this.props.selectedOrder.Weight);
      const driverWeight = isSelected ? totalWeight : parseFloat(driver.TotalCurrentWeight);
      let orderDriverStyle = isSelected ? styles.orderDriverSelected : styles.orderDriver;
      if (isSelected && (totalWeight > driver.AvailableWeight)) {
        orderDriverStyle = styles.orderDriverSelectedExceed;
      }
      return (
        <div className={styles.mainDriver} key={idx}>
          <div className={orderDriverStyle} onClick={()=>{this.props.setDriver(driver.UserID)}}>
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
                Available Weight {driverWeight} / {driver.AvailableWeight}
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
  getInitialState() {
    return ({driverList: this.props.drivers, searchValue: ''})
  },
  searchDriver(e) {
    this.setState({searchValue: e.target.value});
    let driverList = lodash.filter(this.props.drivers, function(driver) { 
      let driverName = driver.FirstName + ' ' + driver.LastName;
      let searchValue = e.target.value;
      return driverName.toLowerCase().includes(searchValue);
    });
    this.setState({driverList: driverList});
  },
  render() {
    const setDriverButton = {
      textBase: 'Assign Driver',
      onClick: this.props.isExpandDriverBulk ? 
        this.props.bulkAssignOrder.bind(null, this.props.selectedOrders, this.props.selectedDriver) :
        this.props.assignOrder.bind(null, this.props.expandedOrder.UserOrderID, this.props.selectedDriver),
      styles: {
        base: stylesButton.greenButton4,
      }
    };
    return (
      <div className={styles.mainDriverPanel}>
        { this.props.isExpandDriverBulk && 
          <div onClick={this.props.shrinkOrder} className={styles.closeButton}>
            X
          </div>
        }
        { this.props.isExpandDriverBulk && 
          <div className={styles.panelDriverChoose}>
            Choose a driver for {this.props.selectedOrders.length} order: 
          </div>
        }
        { !this.props.isExpandDriverBulk && 
          <div className={styles.panelDriverChoose}>
            Choose a driver for this order
          </div>
        }
        <div className={styles.panelDriverSearch}>
          <input className={styles.inputDriverSearch} onChange={this.searchDriver} placeholder={'Search Driver...'} />
        </div>
        <div className={styles.panelDriverList}>
          <Drivers selectedDriver={this.props.selectedDriver} selectedOrder={this.props.expandedOrder} setDriver={this.props.setDriver} drivers={this.state.driverList} />
        </div>
        <div className={styles.setDriverButton}>
          <ButtonWithLoading {...setDriverButton} />
        </div>
      </div>
    );
  }
});

const OrderPage = React.createClass({
  getInitialState() {
    return ({driverID: null, orders: [], selectedOrders: [], isSuccessAssign: false});
  },
  componentWillMount() {
    this.props.ShrinkOrder();
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
    let selectedOrders = lodash.filter(this.props.orders, ['IsChecked', true]);
    if (selectedOrders.length < 1) {
      alert('No order selected');
      return;
    }
    this.setState({selectedOrders: selectedOrders});
    this.props.ShrinkOrder();
    setTimeout(function() {
      this.props.ExpandDriverBulk();
    }.bind(this), 100);
  },
  render() {
    const {paginationState, PaginationAction, drivers, total, orders, expandedOrder, isExpandOrder, isExpandDriver, isExpandDriverBulk, AssignOrder, BulkAssignOrder, ShrinkOrder, ExpandDriver, selectedDriver, SetDriver} = this.props;
    return (
      <Page title="My Orders" count={{itemName: 'Items', done: 'All Done', value: total}}>
        <Pagination2 {...paginationState} {...PaginationAction} />
          <div className={styles.filterOption}>
            <Filter expandDriver={this.expandBulkAssign} />
          </div>
          {
            (this.props.isFetching || this.props.isLoadingDriver) &&
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
            !this.props.isFetching && this.props.orders.length === 0 && !lodash.isEmpty(this.props.filters) &&
            <div>
              <div style={{clear: 'both'}} />
              <div className={styles.noOrderDesc}>
                <img src="/img/icon-orders-done.png" />
                <div style={{fontSize: 20}}>
                  Orders not found
                </div>
                <div style={{fontSize: 12, marginTop: 20}}>
                  Please choose another filter to get the orders.
                </div>
              </div>
            </div>
          }
          {
            !this.props.isFetching && this.props.orders.length === 0 && lodash.isEmpty(this.props.filters) &&
            <div>
              <div style={{clear: 'both'}} />
              <div className={styles.noOrderDesc}>
                <img src="/img/icon-orders-done.png" />
                <div style={{fontSize: 20}}>
                  You dont have any orders right now!
                </div>
                <div style={{fontSize: 12, marginTop: 20}}>
                  You have assign all orders
                </div>
              </div>
            </div>   
          }
          {
            !this.props.isFetching && !this.props.isLoadingDriver && this.props.orders.length > 0 &&
            <div>
              <Table orders={orders} />
              {   
                isExpandOrder &&
                <PanelDetails 
                  isExpandDriver={isExpandDriver} 
                  expandedOrder={expandedOrder} 
                  shrinkOrder={ShrinkOrder} 
                  expandDriver={ExpandDriver} />
              }
              {   
                isExpandDriver &&
                <PanelDrivers 
                  selectedOrders={this.state.selectedOrders} 
                  isExpandDriverBulk={isExpandDriverBulk} 
                  shrinkOrder={ShrinkOrder} 
                  expandedOrder={expandedOrder} 
                  assignOrder={AssignOrder} 
                  bulkAssignOrder={BulkAssignOrder} 
                  selectedDriver={selectedDriver} 
                  setDriver={SetDriver} 
                  drivers={drivers} />
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
                      <div className={styles.mediumText}>You have successfully assigned this order</div>
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

function StoreToOrdersPage(store) {
  const {currentPage, limit, total, isFetching, filters, orders, expandedOrder, isExpandOrder, isExpandDriver, isExpandDriverBulk, selectedDriver, isSuccessAssign} = store.app.myOrders;  
  const userLogged = store.app.userLogged;  
  const driversStore = store.app.driversStore;
  const driverList = driversStore.driverList;
  const isLoadingDriver = driverList.isLoading;
  const fleetDrivers = driversStore.fleetDrivers;
  const drivers = fleetDrivers.driverList;
  return {
    orders: orders,
    drivers: drivers,
    userLogged: userLogged,
    paginationState: {
        currentPage, limit, total,
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
    isLoadingDriver
  }
}

function DispatchToOrdersPage(dispatch) {
  return {
    FetchList: () => {
      dispatch(OrderService.FetchList());
    },
    FetchDrivers: (fleetID) => {
      dispatch(driversFetch(fleetID, true));
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
    SetDriver: (driverID) => {
      dispatch(OrderService.SetDriver(driverID));
    },
    PaginationAction: {
      setCurrentPage: (currentPage) => {
        dispatch(OrderService.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
        dispatch(OrderService.SetLimit(limit));
      },
    }
  }
}

export default connect(StoreToOrdersPage, DispatchToOrdersPage)(OrderPage);