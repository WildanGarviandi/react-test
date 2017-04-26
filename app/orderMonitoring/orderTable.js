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
    console.log(this.props,'sapi');
    return (
      <tr className={styles.tr + ' ' + styles.card} onMouseEnter={this.onMouseOver} onMouseLeave={this.onMouseOut}>
        <td onClick={this.props.ExpandOrder}><img className={styles.orderLoadImage} src={order.IsTrunkeyOrder ? ETOBEE_IMAGE : FLEET_IMAGE} onError={(e)=>{e.target.src=DEFAULT_IMAGE}} /></td>
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

// START DROPDOWN FILTER

function DropdownDispatchBuilder(filterKeyword) {
  return (dispatch) => {
    return {
      ExpandOrder: () => {
        // dispatch(OrderService.ExpandOrder());
        console.log('kuda');
      },
      HideOrder: () => {
        dispatch(OrderService.HideOrder());
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
  // return (store) => {
  //   const {filters} = store.app.myDrivers;
  //
  //   return {
  //     value: filters[keyword],
  //   }
  // }
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

        <div className={styles.row}>
          <EDSFilter />
          <NameFilter />
          <StatusFilter />
          <FleetFilter />
        </div>
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
