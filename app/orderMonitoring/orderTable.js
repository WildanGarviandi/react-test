import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { FilterTop } from '../components/form';
import { Pagination2 } from '../components/pagination2';
import OrderStatusSelector from '../modules/orderStatus/selector';
import * as orderMonitoringService from './orderMonitoringService';
import {CheckboxHeaderPlain as CheckboxHeaderBase, CheckboxCell } from '../views/base/tableCell';
import styles from './table.css';
import config from '../config/configValues.json';
import Countdown from 'react-cntdwn';

class OrderRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const { IsChecked, expandedOrder, order } = this.props;
    const DEFAULT_IMAGE = "/img/default-logo.png";
    const ETOBEE_IMAGE = "/img/etobee-logo.png";
    let rowStyles = `${styles.tr} ${styles.card} `;
    if (expandedOrder.UserOrderNumber === order.UserOrderNumber) {
      rowStyles += styles.select;
    }

    return (
      <tr className={rowStyles}>
        <td className={styles.driverInput}>
          <Checkbox isChecked={order.IsChecked} orderID={order.UserOrderNumber}  />
        </td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <img
            className={styles.orderLoadImage}
            src={order.IsTrunkeyOrder ? ETOBEE_IMAGE : FLEET_IMAGE}
            onError={(e)=>{e.target.src=DEFAULT_IMAGE}}
          />
        </td>
        <td onClick={this.props.expandOrder} className={styles.orderIDColumn}>{order.UserOrderNumber}</td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <div className={styles.cardLabel}>
            Deadline
          </div>
          <br />
          <div className={styles.cardValue + ' ' + styles['cancelled']}>
            <Deadline deadline={order.DueTime} />
          </div>
        </td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <div className={styles.cardLabel}>
            Driver's Name
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.Driver ? order.Driver.FirstName : 'null' } {order.Driver ? order.Driver.LastName : 'null' }
          </div>
        </td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <div className={styles.cardLabel}>
            Order Status
          </div>
          <br />
          <div className={styles.cardValue + ' ' + styles[order.OrderStatus.OrderStatus]}>
            {order.OrderStatus.OrderStatus}
          </div>
        </td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <div className={styles.cardLabel}>
            Fleet's Area
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.DropoffAddress.City}
          </div>
        </td>
      </tr>
    );
  }
}

// START DROPDOWN FILTER

function DropdownDispatchBuilder(keyword, tab) {
  return (dispatch) => {
    return {
      handleSelect: (value, tab) => {
        dispatch(orderMonitoringService.SetDropDownFilter(keyword, value, tab));
      }
    }
  }
}

function DropdownStoreBuilder(name, tab) {
  return (store) => {

    const sortOptions = [{
      key: 'Default', value: "Sort By"
    }, {
      key: 1, value: "A-Z (Driver's Name)",
    }, {
      key: 2, value: "Z-A (Driver's Name)",
    }, {
      key: 3, value: "A-Z (Fleet's Area)",
    },{
      key: 4, value: "Z-A (Fleet's Area)",
    }];

    const orderTypeOptions = [{
      key: 'All', value: "All",
    }, {
      key: 0, value: 'Etobee',
    }, {
      key: 1, value: 'Company Orders',
    }];

    const options = {
      "statusName": OrderStatusSelector.GetList(store),
      "sortOptions": sortOptions,
      "orderTypeOptions": orderTypeOptions
    }

    return {
      value: store.app.orderMonitoring[name][tab],
      options: options[name]
    }
  }
}

function ConnectDropdownBuilder(keyword, tab) {
  return connect(DropdownStoreBuilder(keyword, tab), DropdownDispatchBuilder(keyword, tab));
}

const SortFilterTotal = ConnectDropdownBuilder('sortOptions', 'total')(FilterTop);
const OrderTypeFilterTotal = ConnectDropdownBuilder('orderTypeOptions', 'total')(FilterTop);

const SortFilterSucceed = ConnectDropdownBuilder('sortOptions', 'succeed')(FilterTop);
const OrderTypeFilterSucceed = ConnectDropdownBuilder('orderTypeOptions', 'succeed')(FilterTop);

const SortFilterPending = ConnectDropdownBuilder('sortOptions', 'pending')(FilterTop);
const OrderTypeFilterPending = ConnectDropdownBuilder('orderTypeOptions', 'pending')(FilterTop);

const SortFilterFailed = ConnectDropdownBuilder('sortOptions', 'failed')(FilterTop);
const OrderTypeFilterFailed = ConnectDropdownBuilder('orderTypeOptions', 'failed')(FilterTop);

// END DROPDOWN FILTER

// START INPUT FILTER

function InputStoreBuilder(keyword) {
}

function InputDispatchBuilder(keyword, placeholder) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = {[keyword]: e.target.value};
    }

    function OnKeyDown(e) {
      if(e.keyCode !== 13) {
        return;
      }
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
      placeholder: placeholder
    }
  }
}

function ConnectBuilder(keyword, placeholder) {
    return connect(InputStoreBuilder(keyword), InputDispatchBuilder(keyword, placeholder));
}

function InputFilter({value, onChange, onKeyDown, placeholder}) {
  return (
    <input className={styles.inputSearch} placeholder={placeholder} type="text" value={value} onChange={onChange} onKeyDown={onKeyDown} />
  );
}

const EDSFilter = ConnectBuilder('eds', 'Search for EDS...')(InputFilter);
const NameFilter = ConnectBuilder('name', 'Search for driver...')(InputFilter);
const StatusFilter = ConnectBuilder('status', 'Search for order status...')(InputFilter);
const FleetFilter = ConnectBuilder('fleet', "Search for fleet's area...")(InputFilter);

// END INPUT FILTER

// START CHECKBOX

function CheckboxHeaderStore(store) {
  return {
    isChecked: store.app.orderMonitoring.selectedAll,
  }
}

function CheckboxHeaderDispatch(dispatch) {
  return {
    onToggle: () => {
      dispatch(orderMonitoringService.ToggleCheckAll());
    }
  }
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(CheckboxHeaderBase);


function CheckboxDispatch(dispatch, props) {
  return {
    onToggle: () => {
      dispatch(orderMonitoringService.ToggleSelectOrder(props.orderID));
    }
  }
}

const Checkbox = connect(null, CheckboxDispatch)(CheckboxCell);

// END CHECKBOX

// START COUNTDOWN

export class Deadline extends Component{
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
}

// END COUNTDOWN

export class Filter extends Component {
  render() {
    const { PaginationAction, paginationState } = this.props.pagination;
    const { tab } = this.props;

    return (
      <div>
        { tab === "total" &&
          <div>
            <SortFilterTotal />
            <OrderTypeFilterTotal />
          </div>
        }

        { tab === "succeed" &&
          <div>
            <SortFilterSucceed />
            <OrderTypeFilterSucceed />
          </div>
        }

        { tab === "pending" &&
          <div>
            <SortFilterPending />
            <OrderTypeFilterPending />
          </div>
        }

        { tab === "failed" &&
          <div>
            <SortFilterFailed />
            <OrderTypeFilterFailed />
          </div>
        }

        <Pagination2 {...paginationState} {...PaginationAction} tab={this.props.tab} style={{marginTop: "5px"}} />

        <div className={styles.row}>
          <CheckboxHeader />
          <EDSFilter />
          <NameFilter />
          <StatusFilter />
          <FleetFilter />
        </div>
      </div>
    );
  }
}

class OrderTable extends Component {
  expand(order) {
    this.props.HideOrder();
    setTimeout(() => {
      this.props.ExpandOrder(order);
    }, 1);
  }

  render() {
    const { orders, tab } = this.props;
    return (
      <table className={styles.table}>
        <tbody>
          { orders[tab].map((order, idx) => (
            <OrderRow key={idx} order={order} expandOrder={(tab === "pending") && (() => this.expand(order))} expandedOrder={this.props.expandedOrder} tab={tab} />
          )) }
        </tbody>
      </table>
    );
  }
}

function OrderTableStoreBuilder() {
  return (store) => {
    const { orders, expandedOrder } = store.app.orderMonitoring;

    return {
      orders,
      expandedOrder
    }
  }
}

function OrderTableDispatchBuilder() {
  return (dispatch) => {
    return {
      ExpandOrder: (order) => {
        dispatch(orderMonitoringService.ExpandOrder(order));
      },
      HideOrder: () => {
        dispatch(orderMonitoringService.HideOrder());
      },
      FetchList: (tab) => {
        dispatch(orderMonitoringService.FetchList(tab));
      }
    }
  }
}

export default connect(OrderTableStoreBuilder, OrderTableDispatchBuilder)(OrderTable);
