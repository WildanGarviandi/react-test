/* eslint no-underscore-dangle: ["error", { "allow": ["_milliseconds"] }] */
import React from 'react';
import { connect } from 'react-redux';
import NumberFormat from 'react-number-format';
import Countdown from 'react-cntdwn';

import * as _ from 'lodash';
import moment from 'moment';
import PropTypes from 'prop-types';

import styles from './table.scss';
import * as OrderService from './orderService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import { CheckboxHeader2 as CheckboxHeaderBase, CheckboxCell } from '../views/base/tableCell';
import { FilterTop } from '../components/form';
import stylesButton from '../components/button.scss';
import { ButtonWithLoading } from '../components/button';
import config from '../config/configValues.json';

function StoreBuilder(keyword) {
  return (store) => {
    const { filters } = store.app.myOrders;

    return {
      value: filters[keyword],
    };
  };
}

function DispatchBuilder(keyword) {
  return (dispatch) => {
    function OnChange(e) {
      const newFilters = { [keyword]: e.target.value };
      dispatch(OrderService.UpdateFilters(newFilters));
    }

    function OnKeyDown(e) {
      if (e.keyCode !== 13) {
        return;
      }

      dispatch(OrderService.StoreSetter('currentPage', 1));
      dispatch(OrderService.FetchList());
    }

    return {
      onChange: OnChange,
      onKeyDown: OnKeyDown,
    };
  };
}

function DropdownStoreBuilder(name) {
  return (store) => {
    const sortOptions = [{
      key: 1, value: 'Deadline (newest)',
    }, {
      key: 2, value: 'Deadline (oldest)',
    }];

    const orderTypeOptions = [{
      key: 'All', value: 'All',
    }, {
      key: 0, value: 'Company',
    }, {
      key: 1, value: 'Etobee',
    }];

    const options = {
      statusName: OrderStatusSelector.GetList(store),
      sortOptions,
      orderTypeOptions,
    };

    return {
      value: store.app.myOrders[name],
      options: options[name],
    };
  };
}

function DropdownDispatchBuilder(filterKeyword) {
  return (dispatch) => {
    const dispatchFunc = {
      handleSelect: (selectedOption) => {
        const SetFn = OrderService.SetDropDownFilter(filterKeyword);
        dispatch(SetFn(selectedOption));
      },
    };
    return dispatchFunc;
  };
}

function CheckboxDispatch(dispatch, props) {
  return {
    onToggle: () => {
      dispatch(OrderService.ToggleChecked(props.orderID));
    },
  };
}

function CheckboxHeaderStore(store) {
  return {
    isChecked: store.app.myOrders.selectedAll,
  };
}

function CheckboxHeaderDispatch(dispatch) {
  return {
    onToggle: () => {
      dispatch(OrderService.ToggleCheckedAll());
    },
  };
}

function ConnectBuilder(keyword) {
  return connect(StoreBuilder(keyword), DispatchBuilder(keyword));
}

function ConnectDropdownBuilder(keyword) {
  return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(CheckboxHeaderBase);
const CheckboxRow = connect(undefined, CheckboxDispatch)(CheckboxCell);
const SortFilter = ConnectDropdownBuilder('sortOptions')(FilterTop);
const OrderTypeFilter = ConnectDropdownBuilder('orderTypeOptions')(FilterTop);

export const Filter = React.createClass({
  render() {
    const reassignOrderButton = {
      textBase: 'Assign Orders',
      onClick: this.props.expandDriver,
      styles: {
        base: stylesButton.greenButton3,
      },
    };
    return (
      <div>
        <CheckboxHeader />
        <SortFilter />
        <OrderTypeFilter />
        {
          <div className={styles.reassignBulkButton}>
            <ButtonWithLoading {...reassignOrderButton} />
          </div>
        }
      </div>
    );
  },
});

function OrderParser(order) {
  return _.assign({}, order, { IsOrder: true });
}

export const Deadline = React.createClass({
  render() {
    const format = {
      hour: 'hh',
      minute: 'mm',
      second: 'ss',
    };
    const duration = moment.duration(moment(this.props.deadline).diff(moment(new Date())));
    if (!this.props.deadline) {
      return (
        <span style={{ color: 'black' }}>
          -
        </span>
      );
    } else if (duration._milliseconds > config.deadline.day) {
      return (
        <span style={{ color: 'black' }}>
          {duration.humanize()} remaining
        </span>
      );
    } else if (duration._milliseconds < 0) {
      return (
        <span style={{ color: 'red' }}>
          Passed
        </span>
      );
    }
    const normalDeadline = (duration._milliseconds > config.deadline['3hours']) && (duration._milliseconds < config.deadline.day);
    return (
      <span style={{ color: normalDeadline ? 'black' : 'red' }}>
        <Countdown
          targetDate={new Date(this.props.deadline)}
          startDelay={500}
          interval={1000}
          format={format}
          timeSeparator={':'}
          leadingZero
        />
      </span>
    );
  },
});

const OrderRow = React.createClass({
  getInitialState() {
    return ({ isHover: false, isEdit: false });
  },
  expandOrder(order) {
    this.props.shrink();
    setTimeout(() => {
      if (!this.props.expandedOrder.UserOrderID) {
        this.props.expand(order);
      } else {
        if (this.props.expandedOrder.UserOrderID !== order.UserOrderID) {
          this.props.expand(order);
        }
        this.props.shrink();
      }
    }, 100);
  },
  onMouseOver() {
    this.setState({ isHover: true });
  },
  onMouseOut() {
    this.setState({ isHover: false });
  },
  render() {
    const { order, expandedOrder, profilePicture } = this.props;
    const { isHover } = this.state;
    const deadline = moment(order.DueTime).format(config.DATE_FORMAT.DATE_MONTH_YEAR);
    let rowStyles = `${styles.tr} ${styles.card} ${isHover && ` ${styles.hovered}`}`;
    const duration = moment.duration(moment(order.DueTime).diff(moment(new Date())));
    if (expandedOrder.UserOrderID === order.UserOrderID) {
      rowStyles = `${styles.tr} ${styles.card} ${styles.select}`;
    }
    const FLEET_IMAGE = profilePicture;
    return (
      <tr
        className={rowStyles}
        onMouseEnter={this.onMouseOver}
        onMouseLeave={this.onMouseOut}
        onClick={() => this.expandOrder(order)}
      >
        <td><CheckboxRow isChecked={order.IsChecked} orderID={order.UserOrderID} /></td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <img
            alt="load"
            className={styles.orderLoadImage}
            src={order.IsTrunkeyOrder ? config.IMAGES.ETOBEE_LOGO : FLEET_IMAGE}
            onError={(e) => { e.target.src = config.IMAGES.DEFAULT_LOGO; }}
          />
        </td>
        <td className={styles.orderIDColumn}>
          {order.UserOrderNumber}
          <br />
          <span className={styles.webOrderID}>{order.WebOrderID}</span>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Deadline
          </div>
          <br />
          <div className={styles.cardValue}>
            <Deadline deadline={order.DueTime} />
            <br />
            <span
              className={`${duration._milliseconds < 0 ? styles['text-red'] : styles['text-black']}
              ${styles.deadlineDate}`}
            >
              {deadline}
            </span>
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Origin
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.PickupAddress && order.PickupAddress.City}
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Destination
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.DropoffAddress && order.DropoffAddress.City}
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Weight
          </div>
          <br />
          <div className={styles.cardValue}>
            {parseFloat(order.PackageWeight).toFixed(2)} kg
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            COD Type
          </div>
          <br />
          <div className={styles.cardValue}>
            {order.IsCOD ? 'COD' : 'Non-COD'}
          </div>
        </td>
        <td><div className={styles.cardSeparator} /></td>
        <td>
          <div className={styles.cardLabel}>
            Value
          </div>
          <br />
          <div className={styles.cardValue}>
            <NumberFormat displayType={'text'} thousandSeparator={'.'} decimalSeparator={','} prefix={'Rp '} value={order.TotalValue} />
          </div>
        </td>
      </tr>
    );
  },
});

const OrderBody = React.createClass({
  getBodyContent() {
    const { orders, expandedOrder, expand, shrink, profilePicture } = this.props;
    const content = [];
    orders.forEach((order) => {
      content.push(
        <OrderRow
          key={order.UserOrderID}
          profilePicture={profilePicture}
          order={OrderParser(order)}
          expandedOrder={expandedOrder}
          expand={expand}
          shrink={shrink}
        />,
      );
    });
    return content;
  },
  render() {
    return (
      <tbody>
        {this.getBodyContent()}
      </tbody>
    );
  },
});

function OrderBodyStore() {
  return (store) => {
    const { expandedOrder } = store.app.myOrders;
    const { user } = store.app.userLogged;
    return {
      expandedOrder,
      profilePicture: user && user.User && user.User.ProfilePicture,
    };
  };
}

function OrderBodyDispatch() {
  return (dispatch) => {
    const dispatchFunc = {
      expand: (order) => {
        dispatch(OrderService.ExpandOrder(order));
      },
      shrink: () => {
        dispatch(OrderService.ShrinkOrder());
      },
    };
    return dispatchFunc;
  };
}

const OrderBodyContainer = connect(OrderBodyStore, OrderBodyDispatch)(OrderBody);

function OrderTable({ orders }) {
  return (
    <table className={styles.table}>
      <OrderBodyContainer orders={orders} />
    </table>
  );
}

/* eslint-disable */
OrderTable.propTypes = {
  orders: PropTypes.array,
};
/* eslint-enable */

OrderTable.defaultProps = {
  orders: [],
};

export default OrderTable;
