import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import Table from './orderTable';
import * as Form from '../components/form';
import * as OrderService from './orderService';
import driversFetch from '../modules/drivers/actions/driversFetch';
import styles from './styles.css';
import * as UtilHelper from '../helper/utility';

const OrderPage = React.createClass({
    getInitialState() {
        return ({driverID: null, orders: []})
    },
    componentWillMount() {
        this.props.FetchList();
        this.props.FetchDrivers(this.props.userLogged.userID);
    },
    selectDriver(e) {
        this.setState({driverID: e.key});
    },
    assignOrder() {
        let selectedOrders = lodash.filter(this.props.orders, ['IsChecked', true]);
        if (selectedOrders.length < 1) {
            alert('Must selected one or more orders');
            return;
        }
        if (!this.state.driverID) {
            alert('Driver must be set');
            return;
        }
        var orderPage = this;
        orderPage.props.AssignOrder(selectedOrders, orderPage.state.driverID);
    },
    render() {
        const {paginationState, PaginationAction, orders, drivers, userLogged} = this.props;
        const assignOrderButton = {
            textBase: 'Assign Order',
            onClick: this.assignOrder,
            styles: {
                base: styles.assignOrderButton,
            }
        };
        return (
            <Page title="My Order">
                <Pagination {...paginationState} {...PaginationAction} />
                <p>
                    <ButtonWithLoading {...assignOrderButton} />
                    <Form.DropdownWithState options={drivers} handleSelect={this.selectDriver} />
                </p>
                <Table orders={orders} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToOrdersPage(store) {
    const {currentPage, limit, total, orders} = store.app.myOrders;
    const userLogged = store.app.userLogged;
    const driversStore = store.app.driversStore;
    const driverList = driversStore.driverList;
    const fleetDrivers = driversStore.fleetDrivers;
    const drivers = lodash.chain(fleetDrivers.dict[userLogged.userID] || []).map((driverID) => {
        return {
            key: driverID,
            value: UtilHelper.UserFullName(driverList.dict[driverID]),
        }
    }).sortBy((arr) => (arr.value)).value();
    return {
        orders: orders,
        drivers: drivers,
        userLogged: userLogged,
        paginationState: {
            currentPage, limit, total,
        },
    }
}

function DispatchToOrdersPage(dispatch) {
    return {
        FetchList: () => {
            dispatch(OrderService.FetchList());
        },
        FetchDrivers: (fleetID) => {
            dispatch(driversFetch(fleetID));
        },
        AssignOrder: (orders, driverID) => {
            dispatch(OrderService.AssignOrder(orders, driverID));
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(OrderService.SetCurrentPage(currentPage));
            },
            setLimit: (limit) => {
                dispatch(OrderService.SetLimit(limit));
            },
        }
    }
}

export default connect(StoreToOrdersPage, DispatchToOrdersPage)(OrderPage);