import lodash from 'lodash';
import React from 'react';
import moment from 'moment';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination3} from '../components/pagination3';
import {ButtonWithLoading} from '../components/button';
import * as DriverService from './driverService';
import styles from './styles.css';
import stylesButton from '../components/button.css';
import config from '../config/configValues.json';
import Countdown from 'react-cntdwn';
import NumberFormat from 'react-number-format';

function StoreBuilder(keyword) {
  return (store) => {
    const {filters} = store.app.myDrivers;

    return {
      value: filters[keyword],
    }
  }    
}

function DispatchBuilder(keyword, placeholder) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = {[keyword]: e.target.value};
      dispatch(DriverService.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if(e.keyCode !== 13) {
        return;
      }

      dispatch(DriverService.SetCurrentPage(1));
      dispatch(DriverService.FetchList());
    }

    return {
      onChange: OnChange, 
      onKeyDown: OnKeyDown,
      placeholder: placeholder
    }
  }
}

function ConnectBuilder(keyword, placeholder) {
    return connect(StoreBuilder(keyword), DispatchBuilder(keyword, placeholder));
}

function InputFilter({value, onChange, onKeyDown, placeholder}) {
  return (
    <div>
      <input className={styles.inputDriverSearch} placeholder={placeholder} type="text" value={value} onChange={onChange} onKeyDown={onKeyDown} />
    </div>
  );
}

const NameFilter = ConnectBuilder('name', 'Search Driver...')(InputFilter);

const DEFAULT_IMAGE="/img/photo-default.png"

const Drivers = React.createClass({
  render: function() {
    var driverComponents = this.props.drivers.map(function(driver, idx) {
      return (
        <div className={styles.mainDriver} key={idx} onClick={()=>{this.props.selectDriver(driver.UserID)}}>
          <div className={styles.tripDriver}>
            <div className={styles.vehicleIcon}>
              <img className={styles.driverLoadImage} src={driver.PictureUrl} onError={(e)=>{e.target.src=DEFAULT_IMAGE}}/>
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.driverName}>
                {driver.FirstName + ' ' + driver.LastName} 
              </span>
            </div>
            <div className={styles.driverDetails}>
              <span className={styles.vendorLoad}>
                Number of orders : 6
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
    return (
      <div className={styles.mainDriverPanel}>
        <div className={styles.driverTitle}>
          Driver List
        </div>
        <div className={styles.panelDriverSearch}>
          <NameFilter />
        </div>
        <div className={styles.panelDriverList}>
          <Drivers drivers={this.props.drivers} selectDriver={this.props.selectDriver} />
        </div>
        <Pagination3 {...this.props.paginationState} {...this.props.PaginationAction} />
      </div>
    );
  }
});

const PanelDriversDetails = React.createClass({
  render() {
    const {driver} = this.props;
    return (
      <div className={styles.mainDriverDetailsPanel}>
        <div className={styles.driverTitle}>
          Driver Details
        </div>
        <div className={styles.driverDetailsMain}>
          <div className={styles.driverDetailsPicture}>
            <img src={driver.PictureUrl} onError={(e)=>{e.target.src=DEFAULT_IMAGE}}/>
          </div>
          <div className={styles.driverDetailsName}>
            <div className={styles.driverDetailsLabel}>
              First Name
            </div>
            <div className={styles.driverDetailsValue}>
              {driver.FirstName}
            </div>
            <div className={styles.driverDetailsLabel}>
              Last Name
            </div>
            <div className={styles.driverDetailsValue}>
              {driver.LastName}
            </div>
          </div>
        </div>
        <div className={styles.driverDetailsSecondary}>
          <div className={styles.driverDetailsLabel}>
            Email
          </div>
          <div className={styles.driverDetailsValue}>
            {driver.Email}
          </div> 
          <div className={styles.driverDetailsLabel}>
            Phone Number
          </div>
          <div className={styles.driverDetailsValue}>
            {driver.PhoneNumber}
          </div> 
          <div className={styles.driverDetailsLabel}>
            Address
          </div>
          <div className={styles.driverDetailsValue}>
            {driver.Location}
          </div>          
        </div>
        <div className={styles.driverDetailsMain}>
          <div className={styles.driverDetailsPicture}>
            <div className={styles.driverDetailsLabel}>
              State
            </div>
            <div className={styles.driverDetailsValue}>
              {driver.State && driver.State.Name}
            </div>
          </div>
          <div className={styles.driverDetailsName}>
            <div className={styles.driverDetailsLabel}>
              Last Name
            </div>
            <div className={styles.driverDetailsValue}>
              {driver.ZipCode}
            </div>
          </div>
        </div>
        <div className={styles.driverDetailsSecondary}>
          <div className={styles.driverDetailsLabel}>
            Vehicle Type
          </div>
          <div className={styles.driverDetailsValue}>
            {driver.PackageSizeMaster && driver.PackageSizeMaster.PackageSizeID === 1 ? 'Motorcycle' : 'Van'}
          </div> 
          <div className={styles.driverDetailsLabel}>
            Vehicle License Number
          </div>
          <div className={styles.driverDetailsValue}>
            {driver.DrivingLicenseID}
          </div>         
        </div>
      </div>
    );
  }
});

const Deadline = React.createClass({
  render() {
    let format = {
      hour: 'hh',
      minute: 'mm',
      second: 'ss'
    };
    let Duration = moment.duration(moment(this.props.deadline).diff(moment(new Date())));
    if (!this.props.deadline) {            
      return <span style={{color: 'black'}}>
          -
      </span>
    } else if (Duration._milliseconds > config.deadline.day) {            
      return <span style={{color: 'black'}}>
          {Duration.humanize()} remaining
      </span>
    } else if (Duration._milliseconds < 0) {
      return <span style={{color: 'red'}}>
          Passed
      </span>
    } else {
      let normalDeadline = (Duration._milliseconds > config.deadline['3hours']) && (Duration._milliseconds < config.deadline.day);
      return <span style={{color: normalDeadline ? 'black' : 'red'}}>
        <Countdown targetDate={new Date(this.props.deadline)}
         startDelay={500}
         interval={1000}
         format={format}
         timeSeparator={':'}
         leadingZero={true} />
      </span>
    }
  }
});

const DriverOrders = React.createClass({
  render: function() {
    var orderComponents = this.props.orders.map(function(order, idx) {
      return (
        <div className={styles.mainOrder} key={idx}>
          <div className={styles.orderName}>
            <div className={styles.orderNum}>
              {order.UserOrderNumber} 
              <br />
              {order.WebOrderID}
            </div>
            <div className={styles.orderEDS}>
              Deadline: <Deadline deadline={order.DueTime} />
            </div>
            { 
              order.IsCOD &&
              <div className={styles.orderCOD}>
                COD
              </div>
            }
          </div>
          <div style={{clear: 'both'}} />
          <div>
            <div className={styles.orderDetailsLabel}>
              From
            </div>
            <div className={styles.orderDetailsValue}>
              {order.PickupAddress && order.PickupAddress.FirstName + ' ' + order.PickupAddress.LastName}
            </div>
            <div className={styles.orderDetailsValue2}>
              {order.PickupAddress && order.PickupAddress.Address1}
            </div>
            <div className={styles.orderDetailsLabel}>
              To
            </div>
            <div className={styles.orderDetailsValue}>
              {order.DropoffAddress && order.DropoffAddress.FirstName + ' ' + order.DropoffAddress.LastName}
            </div>
            <div className={styles.orderDetailsValue2}>
              {order.DropoffAddress && order.DropoffAddress.Address1}
            </div>
          </div>
        </div>
      );
    }.bind(this));
    return <div>{orderComponents}</div>;
  }
});

const PanelDriversOrders = React.createClass({
  render() {
    const {driver, orders} = this.props;
    const weight = lodash.sumBy(orders, 'PackageWeight');
    const codOrders = lodash.filter(orders, (order) => order.IsCOD === true);
    const totalValue = _.reduce(orders, (total, order) => {
      return total + order.TotalValue;
    }, 0);
    const codTotalValue = _.reduce(codOrders, (total, order) => {
      return total + order.TotalValue;
    }, 0);
    return (
      <div className={styles.mainDriverOrdersPanel}>
        <div className={styles.driverTitle}>
          Driver Orders
        </div>        
        <div className={styles.orderDetails}>
          <div>
            <div className={styles.orderAdditionalInfo}>
              <div className={styles.orderDetailsLabel}>
                Weight
              </div>
              <div className={styles.orderDetailsValue}>
                {weight} kg
              </div>
            </div>
            <div className={styles.orderAdditionalInfo}>
              <div className={styles.orderDetailsLabel}>
                COD Order
              </div>
              <div className={styles.orderDetailsValue}>
                {codOrders.length} items
              </div>
            </div>
            <div className={styles.orderAdditionalInfo}>
              <div className={styles.orderDetailsLabel}>
                COD Value
              </div>
              <div className={styles.orderDetailsValue}>
                <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={codTotalValue} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.orderValue}>                            
          <div className={styles.orderValueLabel}>
            Total Value
          </div>
          <div className={styles.orderTotalValue}>
            <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={totalValue} />    
          </div>
        </div>
        <div>
          <div className={styles.driverNumOrders}>
            <div className={styles.numOrderLeft}>
              Number of orders: 
            </div>
            <div className={styles.numOrderRight}>
              {orders.length}
            </div>
          </div>
          <div className={styles.driverDetailsOrder}>
            <DriverOrders orders={orders} />
          </div>
        </div>        
        <Pagination3 {...this.props.paginationState} {...this.props.PaginationAction} />
      </div>
    );
  }
});

const DriverPage = React.createClass({
  componentWillMount() {
    this.props.FetchList()
  },
  render() {
    const {paginationState, paginationStateOrders, PaginationAction, PaginationActionOrders, drivers, driver, orders, SelectDriver} = this.props;
    return (
      <Page title="My Driver">
        <div className={styles.mainDriverPage}>
          <PanelDrivers drivers={drivers} paginationState={paginationState} PaginationAction={PaginationAction} selectDriver={SelectDriver} />
          {
            !lodash.isEmpty(driver) &&
            <PanelDriversDetails driver={driver} />
          }
          {
            !lodash.isEmpty(driver) &&
            <PanelDriversOrders driver={driver} orders={orders} paginationState={paginationStateOrders} PaginationAction={PaginationActionOrders} />
          }
        </div>
      </Page>
    );
  }
});

function StoreToDriversPage(store) {
  const {currentPage, currentPageOrders, limit, limitOrders, total, totalOrders, drivers, driver, orders} = store.app.myDrivers;
  return {
    drivers: drivers,
    paginationState: {
      currentPage, limit, total,
    },
    paginationStateOrders: {
      currentPage: currentPageOrders, 
      limit: limitOrders, 
      total: totalOrders
    },
    driver: driver,
    orders: orders
  }
}

function DispatchToDriversPage(dispatch) {
  return {
    FetchList: () => {
      dispatch(DriverService.FetchList());
    },
    PaginationAction: {
      setCurrentPage: (currentPage) => {
          dispatch(DriverService.SetCurrentPage(currentPage));
      },
      setLimit: (limit) => {
          dispatch(DriverService.SetLimit(limit));
      },
    },
    PaginationActionOrders: {
      setCurrentPage: (currentPage) => {
          dispatch(DriverService.SetCurrentPageOrders(currentPage));
      },
      setLimit: (limit) => {
          dispatch(DriverService.SetLimitOrders(limit));
      },
    },
    SelectDriver: (id) => {
      dispatch(DriverService.FetchDetails(id));
      dispatch(DriverService.FetchListOrders(id));
    }
  }
}

export default connect(StoreToDriversPage, DispatchToDriversPage)(DriverPage);