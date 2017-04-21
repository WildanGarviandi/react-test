import React from 'react';
import {connect} from 'react-redux';
import { FilterTop } from '../components/form';
// import {DropdownWithState2 as FilterTop} from '../views/base/dropdown';
import {Pagination2} from '../components/pagination2';
import OrderStatusSelector from '../modules/orderStatus/selector';
import * as OrderService from '../orders/orderService';
import styles from './table.css';

const OrderRow = React.createClass({
  getInitialState() {
    return ({isHover: false, isEdit: false});
  },
  onMouseOver() {
    this.setState({isHover: true});
  },
  onMouseOut() {
    this.setState({isHover: false});
  },
  render() {
    const { order } = this.props;
    const DEFAULT_IMAGE = "/img/default-logo.png";
    const ETOBEE_IMAGE = "/img/etobee-logo.png";
    return (
      <tr className={styles.tr + ' ' + styles.card} onMouseEnter={this.onMouseOver} onMouseLeave={this.onMouseOut}>
        <td><img className={styles.orderLoadImage} src={order.IsTrunkeyOrder ? ETOBEE_IMAGE : FLEET_IMAGE} onError={(e)=>{e.target.src=DEFAULT_IMAGE}} /></td>
        <td className={styles.orderIDColumn}>{order.UserOrderNumber}</td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Driver's Name
          </div>
          <br />
          <div className={styles.cardValue}>
            Agung Santoso
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Order Status
          </div>
          <br />
          <div className={styles.cardValue + ' ' + styles['cancelled']}>
            Cancelled
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Fleet's Area
          </div>
          <br />
          <div className={styles.cardValue}>
            Jakarta Pusat
          </div>
        </td>
      </tr>
    );
  }
});

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

export const Filter = React.createClass({
  render() {
    const paginationState = {
      currentPage: 1,
      limit: 10,
      total: 1,
      style: { marginTop: '5px'}
    }
    return (
      <div>
        <SortFilter />
        <OrderTypeFilter />

        <Pagination2 { ...paginationState }/>
      </div>
    );
  }
});

function OrderTable() {
  const order = {
    order: {
      DropoffAddress:{
        City: "Jakarta Selatan"
      },
      IsTrunkeyOrder: true,
      UserOrderNumber: "EDS21396244"
    }
  }
  return (
    <table className={styles.table}>
      <OrderRow {...order} />
    </table>
  );
}

export default OrderTable;
