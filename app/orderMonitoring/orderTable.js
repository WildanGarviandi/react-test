import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FilterTop } from '../components/form';
import { Pagination2 } from '../components/pagination2';
import OrderStatusSelector from '../modules/orderStatus/selector';
import * as OrderService from '../orders/orderService';
import * as orderMonitoringService from './orderMonitoringService';
import {CheckboxHeaderPlain as CheckboxHeaderBase, CheckboxCell } from '../views/base/tableCell';
import styles from './table.css';

class OrderRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
    }
  }

  render() {
    const { IsTrunkeyOrder, UserOrderNumber, IsChecked } = this.props;
    const DEFAULT_IMAGE = "/img/default-logo.png";
    const ETOBEE_IMAGE = "/img/etobee-logo.png";

    return (
      <tr className={styles.tr + ' ' + styles.card}>
        <td className={styles.driverInput}>
          <Checkbox isChecked={IsChecked} orderID={UserOrderNumber}  />
        </td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <img
            className={styles.orderLoadImage}
            src={IsTrunkeyOrder ? ETOBEE_IMAGE : FLEET_IMAGE}
            onError={(e)=>{e.target.src=DEFAULT_IMAGE}}
          />
        </td>
        <td onClick={this.props.expandOrder} className={styles.orderIDColumn}>{UserOrderNumber}</td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <div className={styles.cardLabel}>
            Driver's Name
          </div>
          <br />
          <div className={styles.cardValue}>
            &nbsp;
          </div>
        </td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <div className={styles.cardLabel}>
            Order Status
          </div>
          <br />
          <div className={styles.cardValue + ' ' + styles['cancelled']}>
            &nbsp;
          </div>
        </td>
        <td onClick={this.props.expandOrder}><div className={styles.cardSeparator} /></td>
        <td onClick={this.props.expandOrder}>
          <div className={styles.cardLabel}>
            Fleet's Area
          </div>
          <br />
          <div className={styles.cardValue}>
            &nbsp;
          </div>
        </td>
      </tr>
    );
  }
}

// START DROPDOWN FILTER

function DropdownDispatchBuilder(filterKeyword) {
  return (dispatch) => {
    return {
      handleSelect: (selectedOption) => {
        const SetFn = OrderService.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      }
    }
  }
}

function DropdownStoreBuilder(name) {
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
      value: store.app.myOrders[name],
      options: options[name]
    }
  }
}

function ConnectDropdownBuilder(keyword) {
  return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const SortFilter = ConnectDropdownBuilder('sortOptions')(FilterTop);
const OrderTypeFilter = ConnectDropdownBuilder('orderTypeOptions')(FilterTop);

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

export class Filter extends Component {
  render() {
    const { PaginationAction, paginationState } = this.props.pagination;

    return (
      <div>
        <SortFilter />
        <OrderTypeFilter />

        <Pagination2 {...paginationState} {...PaginationAction} />

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
  expand() {
    this.props.HideOrder();
    setTimeout(() => {
      this.props.ExpandOrder();
    }, 1);
  }

  render() {
    return (
      <table className={styles.table}>
        <tbody>
          { this.props.orders.map((order, idx) => (
            <OrderRow key={idx} {...order} expandOrder={() => this.expand()} />
          )) }
        </tbody>
      </table>
    );
  }
}

function OrderTableStoreBuilder() {
  return (store) => {
    const { orders } = store.app.orderMonitoring;

    return {
      orders
    }
  }
}

function OrderTableDispatchBuilder() {
  return (dispatch) => {
    return {
      ExpandOrder: () => {
        dispatch(orderMonitoringService.ExpandOrder());
      },
      HideOrder: () => {
        dispatch(orderMonitoringService.HideOrder());
      },
      FetchList: () => {
        dispatch(orderMonitoringService.FetchList());
      }
    }
  }
}

export default connect(OrderTableStoreBuilder, OrderTableDispatchBuilder)(OrderTable);
