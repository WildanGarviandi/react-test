import lodash from 'lodash';
import React from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router';
import {Page} from '../components/page';
import {Pagination} from '../components/pagination';
import {ButtonWithLoading} from '../components/button';
import Table from './driverOrderTable';
import * as DriverService from './driverService';
import styles from './styles.css';

const DriverOrderPage = React.createClass({
    componentWillMount() {
        this.props.FetchListOrders()
    },
    render() {
        const {paginationState, PaginationAction, orders} = this.props;
        return (
            <Page title="Driver's Order">
                <Pagination {...paginationState} {...PaginationAction} />
                <Table orders={orders} />
                <Pagination {...paginationState} {...PaginationAction} />
            </Page>
        );
    }
});

function StoreToDriverOrdersPage(store) {
    const {currentPageOrders, limitOrders, totalOrders, orders} = store.app.myDrivers;
    return {
        orders: orders,
        paginationState: {
            currentPage: currentPageOrders, 
            limit: limitOrders, 
            total: totalOrders
        },
    }
}

function DispatchToDriverOrdersPage(dispatch, ownProps) {
    return {
        FetchListOrders: () => {
            dispatch(DriverService.FetchListOrders(ownProps.params.id));
        },
        PaginationAction: {
            setCurrentPage: (currentPage) => {
                dispatch(DriverService.SetCurrentPageOrders(currentPage, ownProps.params.id));
            },
            setLimit: (limit) => {
                dispatch(DriverService.SetLimitOrders(limit));
            },
        }
    }
}

export default connect(StoreToDriverOrdersPage, DispatchToDriverOrdersPage)(DriverOrderPage);