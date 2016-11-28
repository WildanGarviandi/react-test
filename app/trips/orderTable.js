import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as TripService from './tripService';
import {Glyph} from '../views/base';
import {formatDate} from '../helper/time';

function CheckboxStore(store, props) {
    const { orders } = store.app.myTrips;

    return {
        checked: orders.includes(props.orderID),
    }
}

function CheckboxDispatch(dispatch, props) {
    return {
        onChange: () => {
            dispatch(TripService.ToggleOrderChecked(props.orderID));
        }
    }
}
 
function CheckboxHeaderStore(store) {
    const { expandedTrip, orders } = store.app.myTrips;

    return {
        checked: expandedTrip.UserOrderRoutes.length === orders.length,
    }
}
 
function CheckboxHeaderDispatch(dispatch) {
    return {
        onChange: () => {
            dispatch(TripService.ToggleOrderCheckedAll());
        }
    }
}

const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(Table.CheckBoxHeader);
const CheckboxRow = connect(CheckboxStore, CheckboxDispatch)(Table.CheckBoxCell);

function OrderHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader text="Airway Bill" />
            <Table.TextHeader text="Status" />
            <Table.TextHeader text="From" />
            <Table.TextHeader text="Pickup" />
            <Table.TextHeader text="Dropoff" />
            <Table.TextHeader text="Pickup Time" />
        </tr>
    );
}

function OrderParser(order) {
    function getFullName(user) {
        if (!user) {
            return "";
        }

        return `${user.FirstName} ${user.LastName}`;
    }

    function getMerchantName(route) {
        return route && route.UserOrder && route.UserOrder.User && getFullName(route.UserOrder.User);
    }

    const merchantNames = getMerchantName(order);

    return lodash.assign({}, order, {
        OrderMerchant: merchantNames,
        IsChecked: ('IsChecked' in order) ? order.IsChecked : false
    })
}

function OrderRow ({order}) {
    return (
       <tr className={styles.tr}>
            <CheckboxRow orderID={order.UserOrderRouteID} />
            <Table.LinkCell to={'/orders/' + order.UserOrder.UserOrderID} text={order.UserOrder.UserOrderNumber} />
            <Table.TextCell text={order.UserOrder.OrderStatus && order.UserOrder.OrderStatus.OrderStatus} />
            <Table.TextCell text={order.OrderMerchant} />
            <Table.TextCell text={order.UserOrder.PickupAddress && order.UserOrder.PickupAddress.Address1} />
            <Table.TextCell text={order.UserOrder.DropoffAddress && order.UserOrder.DropoffAddress.Address1} />
            <Table.TextCell text={order.UserOrder.PickupTime && formatDate(order.UserOrder.PickupTime)} />
        </tr>
    );
}

function OrderTable({orders}) {
  const headers = <OrderHeader />;
  const body = orders.map(order=>{
    return <OrderRow key={order.UserOrderRouteID} order={OrderParser(order)} />;
  });

  return (
    <table className={styles.table} style={{margin: '0'}}>
      <thead>{headers}</thead>
      <tbody>{body}</tbody>
    </table>
  );
}

export default OrderTable;