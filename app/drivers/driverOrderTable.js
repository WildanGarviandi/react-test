import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as DriverService from './driverService';
import {Glyph} from '../views/base';
import {Link} from 'react-router';

function OrderParser(order) {

    return lodash.assign({}, order, {
        
    })
}

function OrderHeader() {
    return (
        <tr className={styles.tr}>
            <Table.TextHeader text="Web Order ID" />
            <Table.TextHeader text="User Order Number" />
            <Table.TextHeader text="Pickup" />
            <Table.TextHeader text="Dropoff" />
            <Table.TextHeader text="Pickup Time" />
            <Table.TextHeader text="Status" />
        </tr>
    );
}

function OrderRow({order}) {
    return (
        <tr className={styles.tr}>
            <Table.TextCell text={order.WebOrderID} />
            <Table.TextCell text={order.UserOrderNumber} />
            <Table.TextCell text={order.PickupAddress && order.PickupAddress.Address1} />
            <Table.TextCell text={order.DropoffAddress && order.DropoffAddress.Address1} />
            <Table.TextCell text={moment(order.PickupTime).format('MM-DD-YYYY hh:mm:ss a')} />
            <Table.TextCell text={order.OrderStatus && order.OrderStatus.OrderStatus} />
        </tr>
    );
}

function OrderTable({orders}) {
  const headers = <OrderHeader />;
  const body = lodash.map(orders, (order) => {
    return <OrderRow key={order.UserOrderID} order={OrderParser(order)} />
  });

  return (
    <table className={styles.table}>
      <thead>{headers}</thead>
      <tbody>{body}</tbody>
    </table>
  );
}

export default OrderTable;