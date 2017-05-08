import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import moment from 'moment';
import { FilterTop, Filter as FilterDropdown } from '../components/form';
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
    const { IsChecked, expandedOrder, order, profilePicture, tab } = this.props;
    const DEFAULT_IMAGE = "/img/default-logo.png";
    const ETOBEE_IMAGE = "/img/etobee-logo.png";
    const FLEET_IMAGE = profilePicture;
    let rowStyles = `${styles.tr} ${styles.card} `;
    if (expandedOrder.UserOrderNumber === order.UserOrderNumber) {
      rowStyles += styles.select;
    }

    return (
      <tr className={rowStyles}>
        <td className={styles.driverInput}>
          <Checkbox isChecked={order.IsChecked} orderID={order.UserOrderNumber} tab={tab} />
        </td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}><div className={styles.cardSeparator} /></td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}>
          <img
            className={styles.orderLoadImage}
            src={order.IsTrunkeyOrder ? ETOBEE_IMAGE : FLEET_IMAGE}
            onError={(e)=>{e.target.src=DEFAULT_IMAGE}}
          />
        </td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)} className={styles.orderIDColumn}>{order.UserOrderNumber}</td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}><div className={styles.cardSeparator} /></td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}>
          <div className={styles.cardLabel}>
            Deadline
          </div>
          <br />
          <div className={styles.cardValue + ' ' + styles['cancelled']}>
            <Deadline deadline={order.DueTime} />
          </div>
        </td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}><div className={styles.cardSeparator} /></td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}>
          <div className={styles.cardLabel}>
            Driver's Name
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.Driver ? order.Driver.FirstName : 'null' } {order.Driver ? order.Driver.LastName : 'null' }
          </div>
        </td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}><div className={styles.cardSeparator} /></td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}>
          <div className={styles.cardLabel}>
            Order Status
          </div>
          <br />
          <div className={styles.cardValue + ' ' + styles[order.OrderStatus.OrderStatus]}>
            {order.OrderStatus.OrderStatus}
          </div>
        </td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}><div className={styles.cardSeparator} /></td>
        <td onClick={() => this.props.getDetail(order.UserOrderID)}>
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
  return (dispatch, props) => {
    return {
      handleSelect: (value) => {
        dispatch(orderMonitoringService.SetDropDownFilter(keyword, value, tab||props.tab));
      }
    }
  }
}

function DropdownStoreBuilder(name) {
  return (store, props) => {
    const { sortOptions, orderTypeOptions, statusOptions } = config;
    statusOptions.total = _.union(
      statusOptions.pending,
      statusOptions.succeed,
      statusOptions.failed
    );
    const options = {
      statusOptions: statusOptions[props.tab],
      sortOptions,
      orderTypeOptions
    };

    return {
      value: store.app.orderMonitoring[name][props.tab],
      options: options[name]
    };
  }
}

function ConnectDropdownBuilder(keyword) {
  return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const StatusFilter = ConnectDropdownBuilder('statusOptions')(FilterDropdown);

const SortFilter = ConnectDropdownBuilder('sortOptions')(FilterTop);
const OrderTypeFilter = ConnectDropdownBuilder('orderTypeOptions')(FilterTop);

// END DROPDOWN FILTER

// START INPUT FILTER

function InputStoreBuilder(keyword) {
  return(store, props) => {
    const {filters} = store.app.orderMonitoring;
    if(!_.isEmpty(filters[props.tab])){
      return {value: filters[props.tab][keyword]};
    }

    return {value: ""};
  }
}

function InputDispatchBuilder(keyword, placeholder) {
  return (dispatch, props) => {
    const {tab} = props;
    function OnChange(e) {
      let value = (keyword == 'userOrderNumber') ? e.target.value.toUpperCase() : e.target.value ;

      const newFilters = {
        filters: {
          [tab]: {
            [keyword]: value
          }
        }
      };
      dispatch(orderMonitoringService.SetFilter(newFilters));
    }

    function OnKeyDown(e) {
      if(e.keyCode !== 13) {
        return;
      }
      dispatch(orderMonitoringService.SetCurrentPage(1, tab));
      dispatch(orderMonitoringService.FetchList(tab));
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

const EDSFilter = ConnectBuilder('userOrderNumber', 'Search for EDS...')(InputFilter);
const NameFilter = ConnectBuilder('driverName', 'Search for driver...')(InputFilter);
const FleetFilter = ConnectBuilder('dropoffCity', "Search for fleet's area...")(InputFilter);

// END INPUT FILTER

// START CHECKBOX

function CheckboxHeaderStore() {
  return (store, props) => {
    return {
      isChecked: store.app.orderMonitoring.selectedAll[props.tab],
    }
  }
}

function CheckboxHeaderDispatch() {
  return (dispatch, props) => {
    return {
      onToggle: () => {
        dispatch(orderMonitoringService.ToggleCheckAll(props.tab));
      }
    }
  }
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(CheckboxHeaderBase);

function CheckboxDispatch(dispatch, props) {
  return {
    onToggle: () => {
      dispatch(orderMonitoringService.ToggleSelectOrder(props.orderID, props.tab));
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
        <SortFilter tab={tab} />
        <OrderTypeFilter tab={tab} />

        <Pagination2 {...paginationState} {...PaginationAction} tab={this.props.tab} style={{marginTop: "5px"}} />

        <div className={styles.row}>
          <CheckboxHeader tab={tab} />
          <EDSFilter tab={tab} />
          <NameFilter tab={tab} />
          <StatusFilter tab={tab} />
          <FleetFilter tab={tab} />
        </div>
      </div>
    );
  }
}

class OrderTable extends Component {
  expand(order, tab) {
    this.props.HideOrder();
    setTimeout(() => {
      this.props.ExpandOrder(order, tab);
    }, 1);
  }

  render() {
    const { orders, tab } = this.props;
    return (
      <table className={styles.table}>
        <tbody>
          { orders[tab].map((order, idx) => (
            <OrderRow
              key={idx}
              order={order}
              expandOrder={(tab === "pending") && (() => this.expand(order, tab))}
              expandedOrder={this.props.expandedOrder}
              getDetail={this.props.FetchDetails}
              tab={tab}
            />
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
      ExpandOrder: (order, tab) => {
        dispatch(orderMonitoringService.ExpandOrder(order, tab));
      },
      HideOrder: () => {
        dispatch(orderMonitoringService.HideOrder());
      },
      FetchList: (tab) => {
        dispatch(orderMonitoringService.FetchList(tab));
      },
      FetchDetails: (orderID) => {
        dispatch(orderMonitoringService.FetchDetails(orderID));
      }
    }
  }
}

export default connect(OrderTableStoreBuilder, OrderTableDispatchBuilder)(OrderTable);
