import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import * as OrderService from './orderService';
import OrderStatusSelector from '../modules/orderStatus/selector';

function StoreBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myOrders;

        return {
            value: filters[keyword],
        }
    }    
}

function DispatchBuilder(keyword) {
    return (dispatch) => {
        function OnChange(e) {
            const newFilters = {[keyword]: e.target.value};
            dispatch(OrderService.UpdateFilters(newFilters));
        }

        function OnKeyDown(e) {
            if(e.keyCode !== 13) {
                return;
            }

            dispatch(OrderService.FetchList());
        }

        return {
            onChange: OnChange, 
            onKeyDown: OnKeyDown,
        }
    }
}

function DateTimeDispatch(dispatch) {
    return {
        onChange: function(date) {
            dispatch(OrderService.SetCreatedDate(date));
        }
    }
}

function DropdownStoreBuilder(name) {
    return (store) => {
        const orderTypeOptions = [{
            key: 0, value: "ALL", 
        }, {
            key: 1, value: 'SINGLE ORDER',
        }, {
            key: 2, value: 'TRIP ORDER',
        }];

        const ownerOptions = [{
            key: 0, value: "ALL", 
        }, {
            key: 1, value: 'ETOBEE',
        }, {
            key: 2, value: 'COMPANY',
        }];

        const assignmentOptions = [{
            key: 0, value: "ALL", 
        }, {
            key: 1, value: 'ASSIGNED',
        }, {
            key: 2, value: 'UNASSIGNED',
        }];

        const options = {
            "orderType": orderTypeOptions,
            "statusName": OrderStatusSelector.GetList(store),
            "orderOwner": ownerOptions,
            "assignment": assignmentOptions,
        }

        return {
            value: store.app.myOrders[name],
            options: options[name]
        }
    }
}

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

function CheckboxDispatch(dispatch, props) {
    return {
        onChange: () => {
            dispatch(OrderService.ToggleChecked(props.orderID));
        }
    }
}

function CheckboxHeaderStore(store) {
    return {
        value: store.app.myOrders.selectedAll,
    }
}

function CheckboxHeaderDispatch(dispatch) {
    return {
        onChange: () => {
            dispatch(OrderService.ToggleCheckedAll());
        }
    }
}

function DateRangeBuilder(keyword) {
    return (store) => {
        const {filters} = store.app.myOrders;
        return {
            startDate: filters['start' + keyword],
            endDate: filters['end' + keyword],
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
                dispatch(OrderService.UpdateAndFetch(newFilters))
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

const WebOrderIDFilter = ConnectBuilder('webOrderID')(Table.InputCell);
const UserOrderNumberFilter = ConnectBuilder('userOrderNumber')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(Table.FilterDropdown);
const OrderTypeFilter = ConnectDropdownBuilder('orderType')(Table.FilterDropdown);
const OrderOwnerFilter = ConnectDropdownBuilder('orderOwner')(Table.FilterDropdown);
const AssignmentFilter = ConnectDropdownBuilder('assignment')(Table.FilterDropdown);
const CreatedDateFilter = connect(DateRangeBuilder('Created'), DateRangeDispatch('Created'))(Table.FilterDateTimeRangeCell);
const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(Table.CheckBoxHeader);
const CheckboxRow = connect(undefined, CheckboxDispatch)(Table.CheckBoxCell);

function OrderParser(order) {
    function getAssignment(order) {
        var assignment = 'Unassigned';
        if ((order.CurrentRoute && order.CurrentRoute.Trip && order.CurrentRoute.Trip.Driver) || (order.Driver)) {
            assignment = 'ASSIGNED';
        }
        return assignment;
    }

    function getStatus(order) {
        if (!order.CurrentRoute && order.OrderStatus && order.OrderStatus.OrderStatus) {
            return order.OrderStatus.OrderStatus;
        }
        if (order.CurrentRoute
            && order.CurrentRoute.OrderStatus 
            && order.CurrentRoute.OrderStatus.OrderStatus) {
            return order.CurrentRoute.OrderStatus.OrderStatus;
        }
    }

    return lodash.assign({}, order, {
        OrderType: order.CurrentRoute && order.CurrentRoute.Trip ? "Trip Order" : "Single Order",
        OrderOwner: order.IsTrunkeyOrder ? "Etobee" : "Company",
        OrderAssignment: getAssignment(order),
        Status: getStatus(order),
        IsChecked: ('IsChecked' in order) ? order.IsChecked : false,
    })
}

function OrderHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader text="User Order Number" />
            <Table.TextHeader text="Web Order ID" />
            <Table.TextHeader text="Pickup" />
            <Table.TextHeader text="Dropoff" />
            <Table.TextHeader text="Status" />
            <Table.TextHeader text="Order Type" />
            <Table.TextHeader text="Order Owner" />
            <Table.TextHeader text="Assignment" />
            <Table.TextHeader text="Created Date" />
        </tr>
    );
}

function OrderFilter() {
    return (
        <tr className={styles.tr}>
            <Table.EmptyCell />
            <UserOrderNumberFilter />
            <Table.EmptyCell />
            <PickupFilter />
            <DropoffFilter />
            <StatusFilter />
            <Table.EmptyCell />
            <Table.EmptyCell />
            <Table.EmptyCell />
            <Table.EmptyCell />
        </tr>
    )
}

function OrderRow({order}) {
    return (
        <tr className={styles.tr}>
            <CheckboxRow checked={order.IsChecked} orderID={order.UserOrderID} />
            <Table.LinkCell to={'/myorders/edit/' + order.UserOrderID} text={order.UserOrderNumber} />
            <Table.TextCell text={order.WebOrderID} />
            <Table.TextCell text={order.PickupAddress.Address1} />
            <Table.TextCell text={order.DropoffAddress.Address1} />
            <Table.TextCell text={order.Status} />
            <Table.TextCell text={order.OrderType} />
            <Table.TextCell text={order.OrderOwner} />
            <Table.TextCell text={order.OrderAssignment} />
            <Table.TextCell text={moment(order.CreatedDate).format('MM/DD/YYYY h:mm:ss a')} />
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