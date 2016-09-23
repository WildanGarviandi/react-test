import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as DriverService from './driverService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';
import {Link} from 'react-router';

function StoreBuilder(keyword) {
    return (store) => {
        const {filtersOrders} = store.app.myDrivers;

        return {
            value: filtersOrders[keyword],
        }
    }    
}

function DispatchBuilder(keyword) {
    return (dispatch) => {
        function OnChange(e) {
            const newFilters = {[keyword]: e.target.value};
            dispatch(DriverService.UpdateFiltersOrders(newFilters));
        }

        function OnKeyDown(e) {
            if(e.keyCode !== 13) {
                return;
            }

            dispatch(DriverService.StoreSetterOrders("currentPageOrders", 1));
            dispatch(DriverService.FetchListOrders());
        }

        return {
            onChange: OnChange, 
            onKeyDown: OnKeyDown,
        }
    }
}

function DropdownStoreBuilder(name) {
    return (store) => {

        const options = {
            "statusName": OrderStatusSelector.GetList(store)
        }

        return {
            value: store.app.myDrivers[name],
            options: options[name]
        }
    }
}

function DropdownDispatchBuilder(filterKeyword) {
    return (dispatch) => {
        return {
            handleSelect: (selectedOption) => {
                const SetFn = DriverService.SetDropDownFilterOrders(filterKeyword);
                dispatch(DriverService.StoreSetterOrders("currentPageOrders", 1));
                dispatch(SetFn(selectedOption));
            }
        }
    }
}

function DateRangeBuilder(keyword) {
    return (store) => {
        const {filtersOrders} = store.app.myDrivers;
        return {
            startDate: filtersOrders['start' + keyword],
            endDate: filtersOrders['end' + keyword],
        }
    }
}

function DateRangeDispatch(keyword) {
    return (dispatch) => {
        return {
            onChange: (event, picker) => {
                const newFilters = {
                    ['start' + keyword]: picker.startDate,
                    ['end' + keyword]: picker.endDate
                }
                dispatch(DriverService.StoreSetterOrders("currentPageOrders", 1));
                dispatch(DriverService.UpdateAndFetchOrders(newFilters))
            }
        }
    }
}
function ConnectBuilder(keyword) {
    return connect(StoreBuilder(keyword), DispatchBuilder(keyword));
}

function ConnectDropdownBuilder(keyword) {
    return connect(DropdownStoreBuilder(keyword), DropdownDispatchBuilder(keyword));
}

const UserOrderNumberFilter = ConnectBuilder('userOrderNumber')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(Table.FilterDropdown);
const PickupTimeFilter = connect(DateRangeBuilder('Pickup'), DateRangeDispatch('Pickup'))(Table.FilterDateTimeRangeCell);

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
            <Table.TextHeader text="Status" />
            <Table.TextHeader text="Pickup Time" />
        </tr>
    );
}

function OrderFilter() {
    return (
        <tr className={styles.tr}>
            <Table.EmptyCell />
            <UserOrderNumberFilter />
            <PickupFilter />
            <DropoffFilter />
            <StatusFilter />
            <PickupTimeFilter />
        </tr>
    )
}

function OrderRow({order}) {
    return (
        <tr className={styles.tr}>
            <Table.TextCell text={order.WebOrderID} />
            <Table.TextCell text={order.UserOrderNumber} />
            <Table.TextCell text={order.PickupAddress && order.PickupAddress.Address1} />
            <Table.TextCell text={order.DropoffAddress && order.DropoffAddress.Address1} />
            <Table.TextCell text={order.OrderStatus && order.OrderStatus.OrderStatus} />
            <Table.TextCell text={moment(order.PickupTime).format('MM-DD-YYYY hh:mm:ss a')} />
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
      <tbody><OrderFilter /></tbody>
      <tbody>{body}</tbody>
    </table>
  );
}

export default OrderTable;