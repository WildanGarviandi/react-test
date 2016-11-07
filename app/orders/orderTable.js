import lodash from 'lodash';
import React from 'react';
import DateTime from 'react-datetime';
import {connect} from 'react-redux';
import moment from 'moment';
import * as Table from '../components/table';
import styles from '../components/table.css';
import stylesOrders from './styles.css';
import * as OrderService from './orderService';
import OrderStatusSelector from '../modules/orderStatus/selector';
import {Glyph} from '../views/base';
import {Link} from 'react-router';
import {formatDate} from '../helper/time';
import defaultValues from '../../defaultValues.json';

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

            dispatch(OrderService.StoreSetter("currentPage", 1));
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
            key: 'All', value: "All", 
        }, {
            key: 0, value: 'Company',
        }, {
            key: 1, value: 'Etobee',
        }];

        const assignmentOptions = [{
            key: 0, value: "ALL", 
        }, {
            key: 1, value: 'ASSIGNED',
        }, {
            key: 2, value: 'UNASSIGNED',
        }];

        const codOptions = [{
            key: 'All', value: "All", 
        }, {
            key: 0, value: 'No',
        }, {
            key: 1, value: 'Yes',
        }];

        const statusFilter = store.app.myOrders.statusFilter;
        let statusOptions = lodash.filter(OrderStatusSelector.GetList(store), function(status) {
            switch (statusFilter) {
                case 'ongoing' :
                     return defaultValues.ongoingOrderStatus.includes(status.key);
                     break;
                case 'completed' :
                    return defaultValues.completedOrderStatus.includes(status.key);
                    break;
                default :
                    return defaultValues.openOrderStatus.includes(status.key);
                    break;
            }
        });

        const options = {
            "orderType": orderTypeOptions,
            "statusName": statusOptions,
            "orderOwner": ownerOptions,
            "assignment": assignmentOptions,
            "isCOD": codOptions,
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
                    ['start' + keyword]: picker.startDate.toISOString(),
                    ['end' + keyword]: picker.endDate.toISOString()
                }
                dispatch(OrderService.UpdateAndFetch(newFilters))
            }
        }
    }
}

function HeaderDispatch(keyword, sortCriteria) {
    return (dispatch) => {
        return {
            onClick: () => {
                const newFilters = {
                    ['sortBy']: keyword,
                    ['sortCriteria']: sortCriteria
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

const WebOrderIDFilter = ConnectBuilder('userOrderNumber')(Table.InputCell);
const UserOrderNumberFilter = ConnectBuilder('userOrderNumber')(Table.InputCell);
const PickupFilter = ConnectBuilder('pickup')(Table.InputCell);
const DropoffFilter = ConnectBuilder('dropoff')(Table.InputCell);
const DriverFilter = ConnectBuilder('driver')(Table.InputCell);
const StatusFilter = ConnectDropdownBuilder('statusName')(Table.FilterDropdown);
const OrderTypeFilter = ConnectDropdownBuilder('orderType')(Table.FilterDropdown);
const OrderOwnerFilter = ConnectDropdownBuilder('orderOwner')(Table.FilterDropdown);
const AssignmentFilter = ConnectDropdownBuilder('assignment')(Table.FilterDropdown);
const CODFilter = ConnectDropdownBuilder('isCOD')(Table.FilterDropdown);
const CreatedDateFilter = connect(DateRangeBuilder('Created'), DateRangeDispatch('Created'))(Table.FilterDateTimeRangeCell);
const DueTimeFilter = connect(DateRangeBuilder('DueTime'), DateRangeDispatch('DueTime'))(Table.FilterDateTimeRangeCell);
const CreatedDateASC = connect(undefined, HeaderDispatch('CreatedDate', 'ASC'))(Table.SortCriteria);
const CreatedDateDESC = connect(undefined, HeaderDispatch('CreatedDate', 'DESC'))(Table.SortCriteria);
const DueTimeASC = connect(undefined, HeaderDispatch('DueTime', 'ASC'))(Table.SortCriteria);
const DueTimeDESC = connect(undefined, HeaderDispatch('DueTime', 'DESC'))(Table.SortCriteria);
const CheckboxHeader = connect(CheckboxHeaderStore, CheckboxHeaderDispatch)(Table.CheckBoxHeader);
const CheckboxRow = connect(undefined, CheckboxDispatch)(Table.CheckBoxCell);

function OrderParser(order) {
    function getAssignment(order) {
        var assignment = 'UNASSIGNED';
        if ((order.CurrentRoute && order.CurrentRoute.Trip && order.CurrentRoute.Trip.Driver) || (order.Driver)) {
            assignment = 'Assigned';
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
        IsCOD: order.IsCOD ? "Yes" : "No",
        OrderAssignment: getAssignment(order),
        Driver: order.Driver && `${order.Driver.FirstName} ${order.Driver.LastName}`,
        Status: getStatus(order),
        DueTime: order.DueTime && formatDate(order.DueTime),
        CreatedDate: order.CreatedDate && formatDate(order.CreatedDate),
        IsChecked: ('IsChecked' in order) ? order.IsChecked : false,
    })
}

function OrderHeader() {
    return (
        <tr className={styles.tr}>
            <CheckboxHeader />
            <Table.TextHeader />
            <Table.TextHeader text="AWB / Order ID" />
            <Table.TextHeader text="Pickup" />
            <Table.TextHeader text="Dropoff" />
            <Table.TextHeader text="Driver" />
            <Table.TextHeader text="Status" />
            <Table.TextHeader text="Order Owner" />
            <Table.TextHeader text="Is COD" />
            <th className={styles.th}>
                Created Date
                <CreatedDateASC glyphName='chevron-down' />
                <CreatedDateDESC glyphName='chevron-up' />
            </th>
            <th className={styles.th}>
                Deadline
                <DueTimeASC glyphName='chevron-down' />
                <DueTimeDESC glyphName='chevron-up' />
            </th>
        </tr>
    );
}

function OrderFilter() {
    return (
        <tr className={styles.tr}>
            <Table.EmptyCell />
            <Table.EmptyCell />
            <UserOrderNumberFilter />
            <PickupFilter />
            <DropoffFilter />
            <DriverFilter />
            <StatusFilter />
            <OrderOwnerFilter />
            <CODFilter />
            <CreatedDateFilter />
            <DueTimeFilter />
        </tr>
    )
}

function OrderRow({order}) {
    return (
        <tr className={styles.tr}>
            <CheckboxRow checked={order.IsChecked} orderID={order.UserOrderID} />
            <td className={stylesOrders.detailsTableColumn}>
                <Link title='Edit' to={'/myorders/edit/' + order.UserOrderID} className={styles.linkMenu}>
                    {<Glyph name={'pencil'}/>}
                </Link>
                <Link title='View Details' to={'/myorders/details/' + order.UserOrderID} className={styles.linkMenu}>
                    {<Glyph name={'list-alt'}/>}
                </Link>
            </td>
            <Table.TextCell text={`${order.UserOrderNumber} / ${order.WebOrderID}`} />
            <Table.TextCell text={order.PickupAddress ? order.PickupAddress.Address1 : ''} />
            <Table.TextCell text={order.DropoffAddress ? order.DropoffAddress.Address1 : ''} />
            <Table.TextCell text={order.Driver} />
            <Table.TextCell text={order.Status} />
            <Table.TextCell text={order.OrderOwner} />
            <Table.TextCell text={order.IsCOD} />
            <Table.TextCell text={order.CreatedDate} />
            <Table.TextCell text={order.DueTime} />
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